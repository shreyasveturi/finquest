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
  const requestId = crypto.randomUUID();
  try {
    const { matchId } = await params;
    const { clientId } = await req.json();

    console.log(`[${requestId}] POST /api/match/:matchId/finalize-round`, {
      requestId,
      matchId,
      clientId,
    });

    if (!clientId) {
      console.error(`[${requestId}] Missing clientId`, { requestId });
      return NextResponse.json(
        { error: 'clientId required', requestId },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        rounds: {
          include: { question: true, generatedQuestion: true },
          orderBy: { roundIndex: 'asc' },
        },
      },
    });

    if (!match) {
      console.error(`[${requestId}] Match not found`, { requestId, matchId });
      return NextResponse.json(
        { error: 'Match not found', requestId },
        { status: 404, headers: { 'x-request-id': requestId } }
      );
    }

    // Verify participant
    if (match.playerAId !== clientId && match.playerBId !== clientId) {
      console.error(`[${requestId}] Unauthorized match access`, { requestId, clientId, playerAId: match.playerAId, playerBId: match.playerBId });
      return NextResponse.json(
        { error: 'Not a player in this match', requestId },
        { status: 403, headers: { 'x-request-id': requestId } }
      );
    }

    const now = Date.now();

    // Ensure match startedAt is set
    if (!match.startedAt) {
      console.log(`[${requestId}] Initializing match start time`, { requestId, matchId });
      await prisma.match.update({ where: { id: matchId }, data: { startedAt: new Date() } });
      match.startedAt = new Date();
    }

    const rounds = [...match.rounds].sort((a, b) => a.roundIndex - b.roundIndex);
    const activeIndex = rounds.findIndex(r => r.endedAt === null);

    if (activeIndex === -1) {
      // Match already fully ended
      console.log(`[${requestId}] Match already ended`, { requestId, matchId });
      const last = rounds[rounds.length - 1];
      return NextResponse.json(
        { matchComplete: !!last?.endedAt, requestId },
        { headers: { 'x-request-id': requestId } }
      );
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

    console.log(`[${requestId}] Round finalization check`, {
      requestId,
      matchId,
      roundIndex: activeIndex,
      bothAnswered,
      timeoutReached,
      roundStartAtMs,
      now,
    });

    if ((timeoutReached || bothAnswered) && !currentRound.endedAt) {
      console.log(`[${requestId}] Finalizing round`, { requestId, roundIndex: activeIndex, reason: bothAnswered ? 'both answered' : 'timeout' });

      // If bot match and bot hasn't answered, generate answer now
      if (match.isBotMatch && currentRound.playerBAnswer === null) {
        const seedId = currentRound.questionId ?? currentRound.generatedQuestionId ?? currentRound.id;
        const difficultyStr = currentRound.question?.difficulty ?? (
          typeof currentRound.generatedQuestion?.difficulty === 'number'
            ? currentRound.generatedQuestion!.difficulty <= 2
              ? 'easy'
              : currentRound.generatedQuestion!.difficulty === 3
                ? 'medium'
                : 'hard'
            : 'medium'
        );
        const botAnswer = getBotAnswer(seedId, difficultyStr);
        console.log(`[${requestId}] Generating bot answer for timeout`, { requestId, botAnswer });
        await prisma.matchRound.update({
          where: { id: currentRound.id },
          data: { playerBAnswer: botAnswer },
        });
      }

      // End current round
      await prisma.matchRound.update({ where: { id: currentRound.id }, data: { endedAt: new Date() } });

      await trackEvent(
        'round_ended',
        { matchId, roundId: currentRound.id, reason: bothAnswered ? 'answers' : 'timeout', requestId },
        clientId
      );

      // If last round, finalize match
      const isLast = activeIndex === rounds.length - 1;
      if (isLast) {
        console.log(`[${requestId}] Last round ended, finalizing match`, { requestId, matchId });
        const allRounds = await prisma.matchRound.findMany({ where: { matchId } });

        const playerAScore = allRounds.filter(r => r.playerAAnswer === r.correctIndex).length;
        const playerBScore = allRounds.filter(r => r.playerBAnswer === r.correctIndex).length;

        const playerAWins = playerAScore > playerBScore;
        const playerBWins = playerBScore > playerAScore;

        console.log(`[${requestId}] Final match scores`, { requestId, playerAScore, playerBScore, winner: playerAWins ? 'A' : playerBWins ? 'B' : 'draw' });

        const playerA = await prisma.user.findUnique({ where: { id: match.playerAId } });
        if (!playerA) {
          console.error(`[${requestId}] PlayerA not found`, { requestId, playerAId: match.playerAId });
          return NextResponse.json(
            { error: 'Player not found', requestId },
            { status: 500, headers: { 'x-request-id': requestId } }
          );
        }

        let playerB = null as { rating: number } | null;
        if (!match.isBotMatch && match.playerBId) {
          playerB = await prisma.user.findUnique({ where: { id: match.playerBId } });
          if (!playerB) {
            console.error(`[${requestId}] PlayerB not found`, { requestId, playerBId: match.playerBId });
            return NextResponse.json(
              { error: 'Opponent not found', requestId },
              { status: 500, headers: { 'x-request-id': requestId } }
            );
          }
        }

        const playerBRating = playerB?.rating ?? 1200;
        const { playerANewRating, playerBNewRating } = calculateNewRatings(playerA.rating, playerBRating, playerAWins);

        console.log(`[${requestId}] Rating updates`, { requestId, playerAOld: playerA.rating, playerANew: playerANewRating, playerBOld: playerBRating, playerBNew: playerBNewRating });

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
            requestId,
          },
          clientId
        );

        console.log(`[${requestId}] Match completed`, { requestId, matchId, status: 'completed' });

        return NextResponse.json(
          {
            matchComplete: true,
            playerAScore,
            playerBScore,
            winner: playerAWins ? 'playerA' : playerBWins ? 'playerB' : 'draw',
            playerANewRating,
            playerBNewRating,
            serverNow: now,
            requestId,
          },
          { headers: { 'x-request-id': requestId } }
        );
      }
    }

    // Return timing and status for client to continue/poll
    return NextResponse.json(
      {
        matchComplete: false,
        currentRoundIndex: activeIndex,
        roundStartAt: roundStartAtMs,
        roundDurationMs: ROUND_DURATION_MS,
        roundStatus: currentRound.endedAt ? 'ended' : timeoutReached ? 'timeout' : 'active',
        serverNow: now,
        requestId,
      },
      { headers: { 'x-request-id': requestId } }
    );
  } catch (error) {
    console.error(`[${requestId}] Finalize-round error`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Finalize failed', requestId },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}
