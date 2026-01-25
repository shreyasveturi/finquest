import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ROUND_DURATION_MS = 25000; // 25s per round

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

    // Compute current round and timing derived from server state
    const orderedRounds = [...match.rounds].sort((a, b) => a.roundIndex - b.roundIndex);
    const activeIndex = orderedRounds.findIndex(r => r.endedAt === null);
    const now = Date.now();

    let roundStartAt: number | null = null;
    if (activeIndex === 0) {
      // Initialize match start if missing
      if (!match.startedAt) {
        await prisma.match.update({ where: { id: matchId }, data: { startedAt: new Date() } });
      }
      roundStartAt = new Date(match.startedAt ?? new Date()).getTime();
    } else if (activeIndex > 0) {
      const prev = orderedRounds[activeIndex - 1];
      roundStartAt = prev.endedAt ? new Date(prev.endedAt).getTime() : null;
    }

    const roundDurationMs = ROUND_DURATION_MS;
    const roundStatus = activeIndex === -1
      ? 'ended'
      : (roundStartAt !== null && (now >= roundStartAt + roundDurationMs))
        ? 'timeout'
        : 'active';

    return NextResponse.json({
      ...match,
      currentRoundIndex: activeIndex === -1 ? orderedRounds.length - 1 : activeIndex,
      roundStartAt,
      roundDurationMs,
      roundStatus,
      serverNow: now,
    });
  } catch (error) {
    console.error('Fetch match error:', error);
    if (error instanceof Error) {
      console.error('Error details:', { message: error.message, stack: error.stack });
    }
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    );
  }
}
