import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const matchId = searchParams.get('matchId');

  let userId: string | null = null;
  if (clientId) {
    const user = await prisma.user.findUnique({ where: { clientId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    userId = user.id;
  }

  const rounds = await prisma.round.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(matchId ? { matchId } : {}),
    },
  });

  if (rounds.length === 0) {
    return NextResponse.json({
      accuracy: 0,
      avgResponseTimeMs: 0,
      avgTimeToFirstCommitMs: 0,
      efficiencyScore: 0,
      totalRounds: 0,
    });
  }

  const totalRounds = rounds.length;
  const correctRounds = rounds.filter((r) => r.correct).length;
  const accuracy = correctRounds / totalRounds;

  const avgResponseTimeMs = Math.round(
    rounds.reduce((sum, r) => sum + r.responseTimeMs, 0) / totalRounds
  );

  const roundsWithFirstCommit = rounds.filter((r) => r.timeToFirstCommitMs !== null);
  const avgTimeToFirstCommitMs = roundsWithFirstCommit.length
    ? Math.round(roundsWithFirstCommit.reduce((sum, r) => sum + (r.timeToFirstCommitMs ?? 0), 0) / roundsWithFirstCommit.length)
    : 0;

  const efficiencyScore = Number(
    (
      rounds.reduce((sum, r) => sum + (r.correct ? 1 : 0) / Math.max(1, r.responseTimeMs), 0) /
      totalRounds
    ).toFixed(6)
  );

  return NextResponse.json({
    accuracy,
    avgResponseTimeMs,
    avgTimeToFirstCommitMs,
    efficiencyScore,
    totalRounds,
  });
}
