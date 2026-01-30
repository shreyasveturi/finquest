import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateNewRatings, getTier } from '@/lib/elo';
import { getBotAnswer } from '@/lib/bot-logic';
import { trackEvent } from '@/lib/events';

const ROUND_DURATION_MS = 25000; // 25s per round

/**
 * POST /api/match/[matchId]/submit
 * Submit round answers for a match
 * Request: { roundId, playerAnswer, clientId }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const requestId = crypto.randomUUID();
  try {
    const { matchId } = await params;
    const { roundId, playerAnswer, clientId } = await req.json();
    
    console.log(`[${requestId}] POST /api/match/:matchId/submit`, {
      requestId,
      matchId,
      roundId,
      clientId,
      playerAnswer,
    });

    if (!clientId || !roundId || playerAnswer === undefined) {
      console.error(`[${requestId}] Missing required fields`, { requestId, clientId, roundId, playerAnswer });
      return NextResponse.json(
        { error: 'clientId, roundId, and playerAnswer required', requestId },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    // Get the round and match
    const round = await prisma.matchRound.findUnique({
      where: { id: roundId },
      include: {
        question: true,
        generatedQuestion: true,
        match: true,
      },
    });

    if (!round) {
      console.error(`[${requestId}] Round not found`, { requestId, roundId });
      return NextResponse.json(
        { error: 'Round not found', requestId },
        { status: 404, headers: { 'x-request-id': requestId } }
      );
    }

    if (round.match.id !== matchId) {
      console.error(`[${requestId}] Round does not belong to match`, { requestId, roundId, matchId, actualMatchId: round.match.id });
      return NextResponse.json(
        { error: 'Round does not belong to this match', requestId },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    // Resolve user by clientId and verify participant
    const user = await prisma.user.findUnique({ where: { clientId } });
    if (!user || (round.match.playerAId !== user.id && round.match.playerBId !== user.id)) {
      console.error(`[${requestId}] Client not in match`, { requestId, clientId, userId: user?.id, playerAId: round.match.playerAId, playerBId: round.match.playerBId });
      return NextResponse.json(
        { error: 'Not a player in this match', requestId },
        { status: 403, headers: { 'x-request-id': requestId } }
      );
    }

    // Determine which player this is
    const isPlayerA = round.match.playerAId === user.id;

    // If round already ended, return idempotently
    if (round.endedAt) {
      console.log(`[${requestId}] Round already ended, returning idempotently`, { requestId, roundId });
      const allRounds = await prisma.matchRound.findMany({ where: { matchId } });
      const last = allRounds.sort((a, b) => a.roundIndex - b.roundIndex)[allRounds.length - 1];
      const matchComplete = !!last?.endedAt;
      return NextResponse.json({ matchComplete, roundComplete: true, requestId });
    }

    // Update round with answer
    console.log(`[${requestId}] Recording player answer`, { requestId, roundId, isPlayerA, playerAnswer });
    await prisma.matchRound.update({
      where: { id: roundId },
      data: isPlayerA
        ? { playerAAnswer: playerAnswer }
        : { playerBAnswer: playerAnswer },
    });

    // If bot match and this is playerA (human), generate bot answer immediately
    if (round.match.isBotMatch && isPlayerA) {
      const seedId = round.questionId ?? round.generatedQuestionId ?? round.id;
      const difficultyStr = round.question?.difficulty ?? (
        typeof round.generatedQuestion?.difficulty === 'number'
          ? round.generatedQuestion!.difficulty <= 2
            ? 'easy'
            : round.generatedQuestion!.difficulty === 3
              ? 'medium'
              : 'hard'
          : 'medium'
      );
      const botAnswer = getBotAnswer(seedId, difficultyStr);
      console.log(`[${requestId}] Generating bot answer`, { requestId, roundId, botAnswer });
      await prisma.matchRound.update({
        where: { id: roundId },
        data: { playerBAnswer: botAnswer },
      });
    }

    // Check if round is complete (both players answered)
    const updatedRound = await prisma.matchRound.findUnique({
      where: { id: roundId },
      include: { match: true },
    });

    const roundComplete = updatedRound?.playerAAnswer !== null && updatedRound?.playerBAnswer !== null;

    if (roundComplete) {
      // End round immediately when both answered
      console.log(`[${requestId}] Round complete, ending round`, { requestId, roundId });
      await prisma.matchRound.update({ where: { id: roundId }, data: { endedAt: new Date() } });
      await trackEvent('round_completed', {
        matchId,
        roundId,
        requestId,
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
      console.log(`[${requestId}] All rounds complete, finalizing match`, { requestId, matchId });
      // Calculate scores
      const playerAScore = allRounds.filter(
        r => r.playerAAnswer === r.correctIndex
      ).length;
      const playerBScore = allRounds.filter(
        r => r.playerBAnswer === r.correctIndex
      ).length;

      const playerAWins = playerAScore > playerBScore;
      const playerBWins = playerBScore > playerAScore;

      console.log(`[${requestId}] Match scores`, { requestId, playerAScore, playerBScore, winner: playerAWins ? 'A' : playerBWins ? 'B' : 'draw' });

      // For bot matches, only get playerA; playerB is not a real user
      const playerA = await prisma.user.findUnique({
        where: { id: round.match.playerAId },
      });

      if (!playerA) {
        console.error(`[${requestId}] PlayerA not found`, { requestId, playerAId: round.match.playerAId });
        return NextResponse.json(
          { error: 'Player not found', requestId },
          { status: 500, headers: { 'x-request-id': requestId } }
        );
      }

      // For human vs human, also fetch playerB
      let playerB = null;
      if (!round.match.isBotMatch && round.match.playerBId) {
        playerB = await prisma.user.findUnique({
          where: { id: round.match.playerBId },
        });

        if (!playerB) {
          console.error(`[${requestId}] PlayerB not found`, { requestId, playerBId: round.match.playerBId });
          return NextResponse.json(
            { error: 'Opponent not found', requestId },
            { status: 500, headers: { 'x-request-id': requestId } }
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

      console.log(`[${requestId}] Updating ratings`, { requestId, playerAOld: playerA.rating, playerANew: playerANewRating, playerBOld: playerBRating, playerBNew: playerBNewRating });

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
        requestId,
      }, clientId);

      console.log(`[${requestId}] Match finalized`, { requestId, matchId, status: 'completed' });

      return NextResponse.json({
        matchComplete: true,
        playerAScore,
        playerBScore,
        winner: playerAWins ? 'playerA' : playerBWins ? 'playerB' : 'draw',
        playerANewRating,
        playerBNewRating,
        requestId,
      }, { headers: { 'x-request-id': requestId } });
    }

    console.log(`[${requestId}] Submit successful, match continues`, { requestId, roundComplete });
    return NextResponse.json({
      matchComplete: false,
      roundComplete,
      requestId,
    }, { headers: { 'x-request-id': requestId } });
  } catch (error) {
    console.error(`[${requestId}] Submit error`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Submission failed', requestId },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}
