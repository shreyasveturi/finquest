import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_RESPONSE_MS = 600000;

function clampResponseTime(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(MAX_RESPONSE_MS, Math.max(0, Math.floor(value)));
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const headers = new Headers({ 'x-request-id': requestId });

  try {
    const body = await req.json();
    const {
      clientId,
      matchId,
      roundIndex,
      questionId,
      selectedOption,
      correct,
      responseTimeMs,
      timeToFirstCommitMs,
      timeExpired,
    } = body || {};

    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'clientId required', requestId } },
        { status: 400, headers }
      );
    }

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'matchId required', requestId } },
        { status: 400, headers }
      );
    }

    if (typeof roundIndex !== 'number' || roundIndex < 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'roundIndex must be non-negative', requestId } },
        { status: 400, headers }
      );
    }

    if (typeof correct !== 'boolean') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'correct must be boolean', requestId } },
        { status: 400, headers }
      );
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json(
        { error: { code: 'MATCH_NOT_FOUND', message: 'Match not found', requestId } },
        { status: 404, headers }
      );
    }

    if (match.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: { code: 'MATCH_NOT_ACTIVE', message: 'Match not active', requestId } },
        { status: 400, headers }
      );
    }

    const user = await prisma.user.findUnique({ where: { clientId } });
    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId } },
        { status: 404, headers }
      );
    }

    const resolvedResponseMs = clampResponseTime(Number(responseTimeMs));
    const resolvedFirstCommit =
      timeToFirstCommitMs === null || timeToFirstCommitMs === undefined
        ? null
        : Math.min(resolvedResponseMs, Math.max(0, Math.floor(Number(timeToFirstCommitMs))));

    const resolvedSelectedOption =
      selectedOption === null || selectedOption === undefined
        ? null
        : String(selectedOption);

    const resolvedTimeExpired = !!timeExpired;

    await (prisma as any).round.upsert({
      where: {
        matchId_userId_roundIndex: {
          matchId,
          userId: user.id,
          roundIndex,
        },
      },
      update: {
        questionId: typeof questionId === 'string' ? questionId : null,
        correct,
        selectedOption: resolvedSelectedOption,
        timeExpired: resolvedTimeExpired,
        responseTimeMs: resolvedResponseMs,
        timeToFirstCommitMs: resolvedFirstCommit,
      },
      create: {
        matchId,
        userId: user.id,
        roundIndex,
        questionId: typeof questionId === 'string' ? questionId : null,
        correct,
        selectedOption: resolvedSelectedOption,
        timeExpired: resolvedTimeExpired,
        responseTimeMs: resolvedResponseMs,
        timeToFirstCommitMs: resolvedFirstCommit,
      },
    });

    return NextResponse.json({ ok: true, requestId }, { headers });
  } catch (error) {
    console.error(`[round-submit ${requestId}] Error`, error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to log round', requestId } },
      { status: 500, headers }
    );
  }
}
