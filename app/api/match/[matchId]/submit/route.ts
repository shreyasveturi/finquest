import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateNewRatings, getTier } from '@/lib/elo';
import { getBotAnswer } from '@/lib/bot-logic';
import { trackEvent } from '@/lib/events';

const ROUND_DURATION_MS = 25000; // 25s per round

/**
 * POST /api/match/[matchId]/submit
 * Submit round answers for a match
 * Request: { roundId, playerAnswer }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const { roundId, playerAnswer, clientId } = await req.json();
    
    if (!clientId || !roundId || playerAnswer === undefined) {
      return NextResponse.json(
        { error: 'clientId, roundId, and playerAnswer required' },
        { status: 400 }
      );
    }

    // Get the round and match
    const round = await prisma.matchRound.findUnique({
      where: { id: roundId },
      include: {
        question: true,
        match: true,
      },
    });

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    if (round.match.id !== matchId) {
      return NextResponse.json(
        { error: 'Round does not belong to this match' },
        { status: 400 }
      );
    }

    // Verify user is in this match
    if (round.match.playerAId !== clientId && round.match.playerBId !== clientId) {
      return NextResponse.json(
        { error: 'Not a player in this match' },
        { status: 403 }
      );
    }

    // Determine which player this is
    const isPlayerA = round.match.playerAId === clientId;

    // If round already ended, return idempotently
    if (round.endedAt) {
      const allRounds = await prisma.matchRound.findMany({ where: { matchId } });
      const last = allRounds.sort((a, b) => a.roundIndex - b.roundIndex)[allRounds.length - 1];
      const matchComplete = !!last?.endedAt;
      return NextResponse.json({ matchComplete, roundComplete: true });
    }

    // Update round with answer
    await prisma.matchRound.update({
      where: { id: roundId },
      data: isPlayerA
        ? { playerAAnswer: playerAnswer }
        : { playerBAnswer: playerAnswer },
    });

    // If bot match and this is playerA (human), generate bot answer immediately
    if (round.match.isBotMatch && isPlayerA) {
      const botAnswer = getBotAnswer(round.questionId, round.question.difficulty);
      await prisma.matchRound.update({
        where: { id: roundId },
        data: { playerBAnswer: botAnswer },
      });
    }

    // If bot match and this is playerB (shouldn't happen), just use the submitted answer
    // (This is a safeguard; bots should only be playerB in theory)

    // Check if round is complete (both players answered)
    const updatedRound = await prisma.matchRound.findUnique({
      where: { id: roundId },
      include: { match: true },
    });

    const roundComplete = updatedRound?.playerAAnswer !== null && updatedRound?.playerBAnswer !== null;

    if (roundComplete) {
      // End round immediately when both answered
      await prisma.matchRound.update({ where: { id: roundId }, data: { endedAt: new Date() } });
      await trackEvent('round_completed', {
        matchId,
        roundId,
      }, clientId);
    }

    // Check if match is complete (all 5 rounds done)
    const allRounds = await prisma.matchRound.findMany({
      where: { matchId },
    });

    const allRoundsCompleteByAnswers = allRounds.every(r => r.playerAAnswer !== null && r.playerBAnswer !== null);
    const lastRound = allRounds.sort((a, b) => a.roundIndex - b.roundIndex)[allRounds.length - 1];
    const allRoundsEnded = !!lastRound?.endedAt;

    if (allRoundsCompleteByAnswers || allRoundsEnded) {
      // Calculate scores
      const playerAScore = allRounds.filter(
        r => r.playerAAnswer === r.correctIndex
      ).length;
      const playerBScore = allRounds.filter(
        r => r.playerBAnswer === r.correctIndex
      ).length;

      const playerAWins = playerAScore > playerBScore;
      const playerBWins = playerBScore > playerAScore;

      // For bot matches, only get playerA; playerB is not a real user
      const playerA = await prisma.user.findUnique({
        where: { id: round.match.playerAId },
      });

      if (!playerA) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 500 }
        );
      }

      // For human vs human, also fetch playerB
      let playerB = null;
      if (!round.match.isBotMatch && round.match.playerBId) {
        playerB = await prisma.user.findUnique({
          where: { id: round.match.playerBId },
        });

        if (!playerB) {
          return NextResponse.json(
            { error: 'Opponent not found' },
            { status: 500 }
          );
        }
      }

      // Calculate new ratings (use default 1200 for bot)
      const playerBRating = playerB?.rating || 1200;
      const { playerANewRating, playerBNewRating } = calculateNewRatings(
        playerA.rating,
        playerBRating,
        playerAWins
      );

      // Update only playerA (playerB is not a real user for bot matches)
      await prisma.user.update({
        where: { id: round.match.playerAId },
        data: {
          rating: playerANewRating,
          tier: getTier(playerANewRating),
        },
      });

      // Update playerB only if human vs human match
      if (playerB) {
        await prisma.user.update({
          where: { id: round.match.playerBId! },
          data: {
            rating: playerBNewRating,
            tier: getTier(playerBNewRating),
          },
        });
      }

      // Mark match as completed
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'completed',
          endedAt: new Date(),
          winnerId: playerAWins ? round.match.playerAId : playerBWins ? round.match.playerBId : null,
        },
      });

      await trackEvent('match_completed', {
        matchId,
        playerAScore,
        playerBScore,
        isBotMatch: round.match.isBotMatch,
        durationMs: Date.now() - new Date(round.match.createdAt || new Date()).getTime(),
        winner: playerAWins ? round.match.playerAId : playerBWins ? round.match.playerBId : 'draw',
      }, clientId);

      return NextResponse.json({
        matchComplete: true,
        playerAScore,
        playerBScore,
        winner: playerAWins ? 'playerA' : playerBWins ? 'playerB' : 'draw',
        playerANewRating,
        playerBNewRating,
      });
    }

    return NextResponse.json({
      matchComplete: false,
      roundComplete,
    });
  } catch (error) {
    console.error('Submit error:', error);
    if (error instanceof Error) {
      console.error('Submit error details:', { message: error.message, stack: error.stack });
    }
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    );
  }
}
