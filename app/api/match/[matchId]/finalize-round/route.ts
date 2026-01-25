import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateNewRatings, getTier } from '@/lib/elo';
import { trackEvent } from '@/lib/events';
import { getBotAnswer } from '@/lib/bot-logic';

const ROUND_DURATION_MS = 25000; // 25s per round

/**
 * POST /api/match/[matchId]/finalize-round
 * Idempotently finalize the current round if timeout or both answered.
 * If last round, finalize match and compute ratings.
 * Request: { clientId }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        rounds: {
          include: { question: true },
          orderBy: { roundIndex: 'asc' },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify participant
    if (match.playerAId !== clientId && match.playerBId !== clientId) {
      return NextResponse.json({ error: 'Not a player in this match' }, { status: 403 });
    }

    const now = Date.now();

    // Ensure match startedAt is set
    if (!match.startedAt) {
      await prisma.match.update({ where: { id: matchId }, data: { startedAt: new Date() } });
      match.startedAt = new Date();
    }

    const rounds = [...match.rounds].sort((a, b) => a.roundIndex - b.roundIndex);
    const activeIndex = rounds.findIndex(r => r.endedAt === null);

    if (activeIndex === -1) {
      // Match already fully ended
      const last = rounds[rounds.length - 1];
      return NextResponse.json({ matchComplete: !!last?.endedAt });
    }

    // Derive round start time
    let roundStartAtMs: number | null = null;
    if (activeIndex === 0) {
      roundStartAtMs = new Date(match.startedAt!).getTime();
    } else {
      const prev = rounds[activeIndex - 1];
      roundStartAtMs = prev.endedAt ? new Date(prev.endedAt).getTime() : null;
    }

    const timeoutReached = roundStartAtMs !== null && now >= roundStartAtMs + ROUND_DURATION_MS;
    const currentRound = rounds[activeIndex];
    const bothAnswered = currentRound.playerAAnswer !== null && currentRound.playerBAnswer !== null;

    if ((timeoutReached || bothAnswered) && !currentRound.endedAt) {
      // If bot match and bot hasn't answered, generate answer now
      if (match.isBotMatch && currentRound.playerBAnswer === null) {
        const botAnswer = getBotAnswer(currentRound.questionId, currentRound.question.difficulty);
        await prisma.matchRound.update({
          where: { id: currentRound.id },
          data: { playerBAnswer: botAnswer },
        });
      }

      // End current round
      await prisma.matchRound.update({ where: { id: currentRound.id }, data: { endedAt: new Date() } });

      await trackEvent('round_ended', { matchId, roundId: currentRound.id, reason: bothAnswered ? 'answers' : 'timeout' }, clientId);

      // If last round, finalize match
      const isLast = activeIndex === rounds.length - 1;
      if (isLast) {
        const allRounds = await prisma.matchRound.findMany({ where: { matchId } });

        const playerAScore = allRounds.filter(r => r.playerAAnswer === r.correctIndex).length;
        const playerBScore = allRounds.filter(r => r.playerBAnswer === r.correctIndex).length;

        const playerAWins = playerAScore > playerBScore;
        const playerBWins = playerBScore > playerAScore;

        const playerA = await prisma.user.findUnique({ where: { id: match.playerAId } });
        if (!playerA) {
          return NextResponse.json({ error: 'Player not found' }, { status: 500 });
        }

        let playerB = null as { rating: number } | null;
        if (!match.isBotMatch && match.playerBId) {
          playerB = await prisma.user.findUnique({ where: { id: match.playerBId } });
          if (!playerB) {
            return NextResponse.json({ error: 'Opponent not found' }, { status: 500 });
          }
        }

        const playerBRating = playerB?.rating ?? 1200;
        const { playerANewRating, playerBNewRating } = calculateNewRatings(playerA.rating, playerBRating, playerAWins);

        // Update playerA rating
        await prisma.user.update({
          where: { id: match.playerAId },
          data: { rating: playerANewRating, tier: getTier(playerANewRating) },
        });

        // Update playerB rating if human
        if (playerB && match.playerBId) {
          await prisma.user.update({
            where: { id: match.playerBId },
            data: { rating: playerBNewRating, tier: getTier(playerBNewRating) },
          });
        }

        // Mark match as completed
        await prisma.match.update({
          where: { id: matchId },
          data: {
            status: 'completed',
            endedAt: new Date(),
            winnerId: playerAWins ? match.playerAId : playerBWins ? match.playerBId : null,
          },
        });

        await trackEvent(
          'match_completed',
          {
            matchId,
            playerAScore,
            playerBScore,
            isBotMatch: match.isBotMatch,
            durationMs: Date.now() - new Date(match.startedAt!).getTime(),
            winner: playerAWins ? match.playerAId : playerBWins ? match.playerBId : 'draw',
          },
          clientId
        );

        return NextResponse.json({
          matchComplete: true,
          playerAScore,
          playerBScore,
          winner: playerAWins ? 'playerA' : playerBWins ? 'playerB' : 'draw',
          playerANewRating,
          playerBNewRating,
          serverNow: now,
        });
      }
    }

    // Return timing and status for client to continue/poll
    return NextResponse.json({
      matchComplete: false,
      currentRoundIndex: activeIndex,
      roundStartAt: roundStartAtMs,
      roundDurationMs: ROUND_DURATION_MS,
      roundStatus: currentRound.endedAt ? 'ended' : timeoutReached ? 'timeout' : 'active',
      serverNow: now,
    });
  } catch (error) {
    console.error('Finalize-round error:', error);
    if (error instanceof Error) {
      console.error('Finalize error details:', { message: error.message, stack: error.stack });
    }
    return NextResponse.json({ error: 'Finalize failed' }, { status: 500 });
  }
}
