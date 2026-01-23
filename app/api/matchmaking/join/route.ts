import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user with current rating
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already in queue
    const existingInQueue = await prisma.$queryRaw`
      SELECT * FROM "_MatchmakingQueue" WHERE "userId" = ${userId} AND "createdAt" > datetime('now', '-2 minutes')
    `;

    if ((existingInQueue as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Already in queue' },
        { status: 400 }
      );
    }

    const queueStartTime = Date.now();
    const timeoutMs = getMatchmakingTimeout();

    // Track event
    await trackEvent(userId, 'user_joined_queue', { rating: user.rating });

    // Set a timeout to create bot match if no opponent found
    setTimeout(async () => {
      const opponent = await findHumanOpponent(userId, user.rating, queueStartTime);

      if (!opponent) {
        // Create bot match
        const questions = await prisma.question.findMany({
          take: 5,
          orderBy: { id: 'asc' }, // Deterministic selection
        });

        const match = await prisma.match.create({
          data: {
            playerAId: userId,
            isBotMatch: true,
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

        await trackEvent(userId, 'bot_match_created', { matchId: match.id });
      }
    }, timeoutMs);

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

      await trackEvent(userId, 'match_started', {
        matchId: match.id,
        opponent,
      });

      return NextResponse.json({
        matchId: match.id,
        status: 'matched',
      });
    }

    // Return queue ID for polling
    return NextResponse.json({
      queueId: userId,
      status: 'queued',
      timeoutMs,
    });
  } catch (error) {
    console.error('Matchmaking error:', error);
    return NextResponse.json(
      { error: 'Matchmaking failed' },
      { status: 500 }
    );
  }
}
