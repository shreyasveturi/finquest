import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const StartSchema = z.object({
  clientId: z.string().min(1),
  username: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const headers = new Headers({ 'x-request-id': requestId });

  try {
    let body: unknown = null;
    try {
      body = await req.json();
    } catch (e) {
      console.error(`[bot-start ${requestId}] Invalid JSON body`);
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid JSON body', requestId } },
        { status: 400, headers }
      );
    }

    const parsed = StartSchema.safeParse(body);
    if (!parsed.success) {
      console.error(`[bot-start ${requestId}] Validation failed`, parsed.error);
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'clientId and username required', requestId } },
        { status: 400, headers }
      );
    }
    const { clientId, username } = parsed.data;

    console.log(`[bot-start ${requestId}] Starting bot match for clientId=${clientId.slice(0, 8)}`);

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: clientId } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: clientId, name: username, rating: 1200, tier: 'Bronze' },
      });
      console.log(`[bot-start ${requestId}] Created new user ${clientId.slice(0, 8)}`);
    }

    // Select questions: take 50 then shuffle and slice 5
    const pool = await prisma.question.findMany({
      select: { id: true, correctIndex: true },
      take: 50,
    });

    console.log(`[bot-start ${requestId}] Fetched ${pool.length} questions from DB`);

    if (pool.length < 5) {
      console.error(`[bot-start ${requestId}] NO_QUESTIONS: only ${pool.length} available`);
      return NextResponse.json(
        { error: { code: 'NO_QUESTIONS', message: 'Not enough questions available', requestId } },
        { status: 500, headers }
      );
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    const questionIds = selected.map((q) => q.id);

    console.log(`[bot-start ${requestId}] Selected questionIds: ${questionIds.join(', ')}`);

    // Transaction: create match and rounds
    const match = await prisma.$transaction(async (tx) => {
      const m = await tx.match.create({
        data: {
          playerAId: clientId,
          isBotMatch: true,
          status: 'active',
          startedAt: new Date(),
          mode: 'ranked',
        },
      });

      console.log(`[bot-start ${requestId}] Created match ${m.id}`);

      await tx.matchRound.createMany({
        data: selected.map((q, idx) => ({
          matchId: m.id,
          roundIndex: idx,
          questionId: q.id,
          correctIndex: q.correctIndex,
        })),
      });

      console.log(`[bot-start ${requestId}] Created 5 rounds for match ${m.id}`);

      return m;
    });

    console.log(`[bot-start ${requestId}] ✓ Transaction committed matchId=${match.id}`);

    // Verify match was created
    const verify = await prisma.match.findUnique({
      where: { id: match.id },
      include: { rounds: { select: { id: true } } },
    });

    if (!verify) {
      console.error(`[bot-start ${requestId}] ✗ DB verification failed: match ${match.id} not found`);
      throw new Error('DB_WRITE_FAILED: Match not found after creation');
    }

    if (verify.rounds.length !== 5) {
      console.error(`[bot-start ${requestId}] ✗ DB verification failed: expected 5 rounds, got ${verify.rounds.length}`);
      throw new Error(`DB_WRITE_FAILED: Expected 5 rounds, got ${verify.rounds.length}`);
    }

    console.log(`[bot-start ${requestId}] ✓ Verified matchId=${match.id} rounds=${verify.rounds.length} questions=${questionIds.join(',')}`);

    return NextResponse.json({ matchId: match.id, requestId }, { status: 200, headers });
  } catch (err) {
    const errorInfo = err instanceof Error 
      ? { message: err.message, stack: err.stack, name: err.name }
      : { raw: err };
    console.error(`[bot-start ${requestId}] ✗ Error:`, errorInfo);
    
    const userMessage = err instanceof Error ? err.message : 'Failed to start bot match';
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: userMessage, requestId } },
      { status: 500, headers }
    );
  }
}
