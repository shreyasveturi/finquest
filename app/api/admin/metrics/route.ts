import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export async function GET(req: NextRequest) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [events, matches, users] = await Promise.all([
      prisma.event.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.match.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.user.count(),
    ]);

    const matchesStarted = events.filter(e => e.eventName === 'match_started');
    const matchesCompleted = events.filter(e => e.eventName === 'match_completed');
    const playAgainClicks = events.filter(e => e.eventName === 'play_again_clicked');
    const queueMatched = events.filter(e => e.eventName === 'queue_matched');

    const activeUserIds = new Set(
      events
        .filter(e => e.eventName === 'match_started' || e.eventName === 'match_completed')
        .map(e => e.userId)
        .filter(Boolean) as string[]
    );

    const matchesPerActiveUser = activeUserIds.size
      ? matchesStarted.length / activeUserIds.size
      : 0;

    const completionRate = matchesStarted.length
      ? matchesCompleted.length / matchesStarted.length
      : 0;

    const waitTimes = queueMatched
      .map(e => {
        try {
          const parsed = e.properties ? JSON.parse(e.properties) : {};
          return typeof parsed.waitMs === 'number' ? parsed.waitMs : null;
        } catch {
          return null;
        }
      })
      .filter((v): v is number => v !== null);

    const medianQueueTimeMs = median(waitTimes);

    const botMatches = matches.filter(m => m.isBotMatch).length;
    const botMatchRate = matches.length ? botMatches / matches.length : 0;

    const reQueueRate = matchesCompleted.length
      ? playAgainClicks.length / matchesCompleted.length
      : 0;

    const topPlayers = await prisma.user.findMany({
      orderBy: { rating: 'desc' },
      take: 10,
      select: { id: true, name: true, rating: true, tier: true },
    });

    return NextResponse.json({
      metrics: {
        matchesPerActiveUser,
        completionRate,
        medianQueueTimeMs,
        botMatchRate,
        reQueueRate,
        topPlayers,
      },
      summary: {
        totalMatches: matches.length,
        activeUsers: activeUserIds.size,
        totalUsers: users,
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
