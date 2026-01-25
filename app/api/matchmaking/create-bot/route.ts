import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackEvent } from '@/lib/events';

/**
 * POST /api/matchmaking/create-bot
 * Create a bot match when user explicitly chooses to play bot
 */
export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: clientId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create bot match
    const questions = await prisma.question.findMany({
      take: 5,
      orderBy: { id: 'asc' },
    });

    const match = await prisma.match.create({
      data: {
        playerAId: clientId,
        isBotMatch: true,
        status: 'in_progress',
      },
    });

    // Create match rounds
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

    await trackEvent('bot_match_created', {
      matchId: match.id,
      playerRating: user.rating,
    }, clientId);

    await trackEvent('match_started', {
      matchId: match.id,
      isBotMatch: true,
    }, clientId);

    return NextResponse.json({
      matchId: match.id,
      status: 'matched',
      opponentType: 'bot',
    });
  } catch (error) {
    console.error('Bot match creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create bot match' },
      { status: 500 }
    );
  }
}
