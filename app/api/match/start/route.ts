import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canonicalizeUsername } from '@/lib/identity';

const MAX_DISCRIMINATOR = 9999;

async function findAvailableDiscriminator(canonicalName: string): Promise<number> {
  const existing = await prisma.user.findMany({
    where: { canonicalName },
    select: { discriminator: true },
  });

  const used = new Set(existing.map((u) => u.discriminator));
  if (used.size === 0) return 0;
  if (used.size >= MAX_DISCRIMINATOR + 1) {
    throw new Error('All discriminators for this name are taken');
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = Math.floor(Math.random() * (MAX_DISCRIMINATOR + 1));
    if (!used.has(candidate)) return candidate;
  }

  for (let i = 0; i <= MAX_DISCRIMINATOR; i++) {
    if (!used.has(i)) return i;
  }

  throw new Error('Failed to find available discriminator');
}

async function getOrCreateUser(clientId: string, displayName?: string) {
  const existing = await prisma.user.findUnique({ where: { clientId } });
  if (existing) return existing;

  const name = displayName?.trim() || 'Player';
  const canonicalName = canonicalizeUsername(name);
  const discriminator = await findAvailableDiscriminator(canonicalName);

  return prisma.user.create({
    data: {
      clientId,
      displayName: name,
      canonicalName,
      discriminator,
      rating: 1200,
      tier: 'Bronze',
    },
  });
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const headers = new Headers({ 'x-request-id': requestId });

  try {
    const body = await req.json();
    const { clientId, opponentType, opponentClientId } = body || {};

    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'clientId required', requestId } },
        { status: 400, headers }
      );
    }

    if (opponentType !== 'BOT' && opponentType !== 'HUMAN') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'opponentType must be BOT or HUMAN', requestId } },
        { status: 400, headers }
      );
    }

    const user = await getOrCreateUser(clientId);
    let opponentUser = null;

    if (opponentType === 'HUMAN') {
      if (!opponentClientId || typeof opponentClientId !== 'string') {
        return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'opponentClientId required for HUMAN matches', requestId } },
          { status: 400, headers }
        );
      }
      opponentUser = await getOrCreateUser(opponentClientId);
    }

    // Select questions: take 50 then shuffle and slice 5
    const pool = await prisma.question.findMany({
      select: { id: true, correctIndex: true },
      take: 50,
    });

    if (pool.length < 5) {
      return NextResponse.json(
        { error: { code: 'NO_QUESTIONS', message: 'Not enough questions available', requestId } },
        { status: 500, headers }
      );
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    const match = await prisma.$transaction(async (tx) => {
      const m = await tx.match.create({
        data: {
          playerAId: user.id,
          playerBId: opponentUser?.id ?? null,
          isBotMatch: opponentType === 'BOT',
          status: 'ACTIVE',
          startedAt: new Date(),
          mode: 'ranked',
          opponentType,
          ratingBeforeA: user.rating,
          ratingBeforeB: opponentUser?.rating ?? 1200,
          resultA: 'UNKNOWN',
        } as any,
      });

      await tx.matchRound.createMany({
        data: selected.map((q, idx) => ({
          matchId: m.id,
          roundIndex: idx,
          questionId: q.id,
          correctIndex: q.correctIndex,
        })),
      });

      return m;
    });

    return NextResponse.json(
      {
        matchId: match.id,
        ratingBefore: user.rating,
        roundCount: selected.length,
        serverTime: Date.now(),
        requestId,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error(`[match-start ${requestId}] Error`, error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to start match', requestId } },
      { status: 500, headers }
    );
  }
}
