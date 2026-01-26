import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ROUND_DURATION_MS = 25000; // 25s per round

/**
 * GET /api/match/[matchId]
 * Fetch match data for the player
 * Returns authoritative round state, timing, and current round index.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  try {
    const { matchId } = await params;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    console.log(`[${requestId}] GET /api/match/:matchId`, {
      requestId,
      matchId,
      clientId,
    });

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
      console.error(`[${requestId}] Match not found`, { requestId, matchId });
      return NextResponse.json({ error: 'Match not found', requestId }, { status: 404 });
    }

    // Verify user is in this match
    if (!clientId || (match.playerAId !== clientId && match.playerBId !== clientId)) {
      console.error(`[${requestId}] Unauthorized match access`, {
        requestId,
        matchId,
        clientId,
        playerAId: match.playerAId,
        playerBId: match.playerBId,
      });
      return NextResponse.json(
        { error: 'Not a player in this match', requestId },
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
        console.log(`[${requestId}] Initializing match start time`, { requestId, matchId });
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

    console.log(`[${requestId}] Match state fetched successfully`, {
      requestId,
      matchId,
      currentRoundIndex: activeIndex === -1 ? orderedRounds.length - 1 : activeIndex,
      roundStatus,
      totalRounds: orderedRounds.length,
    });

    const headers = new Headers({ 'x-request-id': requestId });
    return NextResponse.json(
      {
        ...match,
        currentRoundIndex: activeIndex === -1 ? orderedRounds.length - 1 : activeIndex,
        roundStartAt,
        roundDurationMs,
        roundStatus,
        serverNow: now,
      },
      { headers }
    );
  } catch (error) {
    console.error(`[${requestId}] Fetch match error`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch match', requestId },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}

