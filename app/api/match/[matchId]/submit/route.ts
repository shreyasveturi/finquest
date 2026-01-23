import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { calculateNewRatings, getTier } from '@/lib/elo';
import { getBotAnswer } from '@/lib/bot-logic';
import { trackEvent } from '@/lib/events';

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
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = await params;
    const userId = session.user.id;
    const { roundId, playerAnswer } = await req.json();

    // Get the round and match
    const round = await prisma.matchRound.findUnique({
      where: { id: roundId },
      include: {
        question: true,
        match: true,
      },
    });

    if (!round || round.match.id !== matchId) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Verify user is in this match
    if (round.match.playerAId !== userId && round.match.playerBId !== userId) {
      return NextResponse.json(
        { error: 'Not a player in this match' },
        { status: 403 }
      );
    }

    // Determine which player this is
    const isPlayerA = round.match.playerAId === userId;

    // Update round with answer
    await prisma.matchRound.update({
      where: { id: roundId },
      data: isPlayerA
        ? { playerAAnswer: playerAnswer }
        : { playerBAnswer: playerAnswer },
    });

    // If bot match, generate bot answer
    if (round.match.isBotMatch && !isPlayerA) {
      const botAnswer = getBotAnswer(round.questionId, round.question.difficulty);
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
      await trackEvent(userId, 'round_completed', {
        matchId,
        roundId,
      });
    }

    // Check if match is complete (all 5 rounds done)
    const allRounds = await prisma.matchRound.findMany({
      where: { matchId },
    });

    const allRoundsComplete = allRounds.every(r => r.playerAAnswer !== null && r.playerBAnswer !== null);

    if (allRoundsComplete) {
      // Calculate scores
      const playerAScore = allRounds.filter(
        r => r.playerAAnswer === r.correctIndex
      ).length;
      const playerBScore = allRounds.filter(
        r => r.playerBAnswer === r.correctIndex
      ).length;

      const playerAWins = playerAScore > playerBScore;
      const playerBWins = playerBScore > playerAScore;

      // Get current ratings
      const [playerA, playerB] = await Promise.all([
        prisma.user.findUnique({ where: { id: round.match.playerAId } }),
        prisma.user.findUnique({ where: { id: round.match.playerBId || '' } }),
      ]);

      if (!playerA || !playerB) {
        return NextResponse.json(
          { error: 'Players not found' },
          { status: 500 }
        );
      }

      // Calculate new ratings
      const { playerANewRating, playerBNewRating } = calculateNewRatings(
        playerA.rating,
        playerB.rating,
        playerAWins
      );

      // Update ratings and tiers
      await Promise.all([
        prisma.user.update({
          where: { id: round.match.playerAId },
          data: {
            rating: playerANewRating,
            tier: getTier(playerANewRating),
          },
        }),
        prisma.user.update({
          where: { id: round.match.playerBId || '' },
          data: {
            rating: playerBNewRating,
            tier: getTier(playerBNewRating),
          },
        }),
      ]);

      // Mark match as completed
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'completed',
          winnerId: playerAWins ? round.match.playerAId : playerBWins ? round.match.playerBId : null,
        },
      });

      await trackEvent(userId, 'match_finished', {
        matchId,
        playerAScore,
        playerBScore,
        winner: playerAWins ? round.match.playerAId : playerBWins ? round.match.playerBId : 'draw',
      });

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
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    );
  }
}
