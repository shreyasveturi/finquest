import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/match/[matchId]
 * Fetch match data for the player
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        rounds: {
          include: {
            question: true,
          },
          orderBy: {
            roundIndex: 'asc',
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify user is in this match
    if (!clientId || (match.playerAId !== clientId && match.playerBId !== clientId)) {
      return NextResponse.json(
        { error: 'Not a player in this match' },
        { status: 403 }
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('Fetch match error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    );
  }
}
