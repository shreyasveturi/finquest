import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findHumanOpponent, getMatchmakingTimeout } from '@/lib/matchmaking';
import { getBotAnswer } from '@/lib/bot-logic';
import { trackEvent } from '@/lib/events';

/**
 * POST /api/matchmaking/join
 * User joins matchmaking queue
 * Returns: { matchId? | queueId }
 */
export async function POST(req: NextRequest) {
  try {
    const { clientId, username } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    // Upsert user with provided identity
    const user = await prisma.user.upsert({
      where: { id: clientId },
      update: username ? { name: username } : {},
      create: {
        id: clientId,
        name: username || null,
      },
    });
    const userId = user.id;

    const queueStartTime = Date.now();

    // Track event
    await trackEvent('queue_joined', { rating: user.rating }, userId);

    // Try to find opponent immediately
    const opponent = await findHumanOpponent(userId, user.rating, queueStartTime);

    if (opponent) {
      // Create match immediately with opponent
      const questions = await prisma.question.findMany({
        take: 5,
        orderBy: { id: 'asc' },
      });

      const match = await prisma.match.create({
        data: {
          playerAId: userId,
          playerBId: opponent,
          status: 'in_progress',
        },
      });

      // Create match rounds separately
      await Promise.all(
        questions.map((q, index) =>
          prisma.matchRound.create({
            data: {
              matchId: match.id,
              roundIndex: index,
              questionId: q.id,
              correctIndex: q.correctIndex,
            },
          })
        )
      );

      await trackEvent('queue_matched', {
        matchId: match.id,
        waitMs: Date.now() - queueStartTime,
        opponentType: 'human',
        opponent,
      }, userId);

      await trackEvent('match_started', {
        matchId: match.id,
        opponent,
        isBotMatch: false,
      }, userId);

      return NextResponse.json({
        matchId: match.id,
        status: 'matched',
        opponentType: 'human',
      });
    }

    // No human opponent found - return queued status
    // Client will poll or offer user choice to play bot
    return NextResponse.json({
      queueId: userId,
      status: 'queued',
      opponentType: 'human',
    });
  } catch (error) {
    console.error('Matchmaking error:', error);
    return NextResponse.json(
      { error: 'Matchmaking failed' },
      { status: 500 }
    );
  }
}
