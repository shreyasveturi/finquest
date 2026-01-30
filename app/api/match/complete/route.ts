import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEloUpdate, getTier } from '@/lib/elo';

const BOT_RATING = 1200;

function scoreForResult(result: string) {
  if (result === 'WIN') return 1;
  if (result === 'DRAW') return 0.5;
  if (result === 'LOSS') return 0;
  return null;
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const headers = new Headers({ 'x-request-id': requestId });

  try {
    const body = await req.json();
    const { clientId, matchId, resultA } = body || {};

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

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { rounds: true },
    });

    if (!match) {
      return NextResponse.json(
        { error: { code: 'MATCH_NOT_FOUND', message: 'Match not found', requestId } },
        { status: 404, headers }
      );
    }

    const user = await prisma.user.findUnique({ where: { clientId } });
    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId } },
        { status: 404, headers }
      );
    }

    if (match.playerAId !== user.id && match.playerBId !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not a player in this match', requestId } },
        { status: 403, headers }
      );
    }

    const matchRecord = match as any;

    if (matchRecord.status === 'COMPLETED') {
      return NextResponse.json(
        {
          ok: true,
          ratingBeforeA: matchRecord.ratingBeforeA,
          ratingAfterA: matchRecord.ratingAfterA,
          requestId,
        },
        { headers }
      );
    }

    // Determine resultA if not provided or UNKNOWN
    let resolvedResultA = resultA as string | undefined;
    const rounds = match.rounds;
    const playerAScore = rounds.filter((r) => r.playerAAnswer === r.correctIndex).length;
    const playerBScore = rounds.filter((r) => r.playerBAnswer === r.correctIndex).length;

    if (!resolvedResultA || resolvedResultA === 'UNKNOWN') {
      if (playerAScore > playerBScore) resolvedResultA = 'WIN';
      else if (playerAScore < playerBScore) resolvedResultA = 'LOSS';
      else resolvedResultA = 'DRAW';
    }

    const scoreA = scoreForResult(resolvedResultA);
    if (scoreA === null) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid resultA', requestId } },
        { status: 400, headers }
      );
    }

    const playerA = await prisma.user.findUnique({ where: { id: match.playerAId } });
    if (!playerA) {
      return NextResponse.json(
        { error: { code: 'PLAYER_NOT_FOUND', message: 'PlayerA not found', requestId } },
        { status: 500, headers }
      );
    }

    const playerBRating = match.isBotMatch ? BOT_RATING : (match.playerBId ? (await prisma.user.findUnique({ where: { id: match.playerBId } }))?.rating ?? BOT_RATING : BOT_RATING);

    const { playerANewRating, playerBNewRating } = calculateEloUpdate(
      playerA.rating,
      playerBRating,
      scoreA
    );

    await prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
          resultA: resolvedResultA as any,
          ratingBeforeA: matchRecord.ratingBeforeA ?? playerA.rating,
          ratingAfterA: playerANewRating,
          ratingBeforeB: match.isBotMatch ? BOT_RATING : playerBRating,
          ratingAfterB: match.isBotMatch ? playerBNewRating : playerBNewRating,
        } as any,
      });

      await tx.user.update({
        where: { id: playerA.id },
        data: { rating: playerANewRating, tier: getTier(playerANewRating) },
      });

      if (!match.isBotMatch && match.playerBId) {
        await tx.user.update({
          where: { id: match.playerBId },
          data: { rating: playerBNewRating, tier: getTier(playerBNewRating) },
        });
      }
    });

    return NextResponse.json(
      {
        ok: true,
        ratingBeforeA: matchRecord.ratingBeforeA ?? playerA.rating,
        ratingAfterA: playerANewRating,
        playerAScore,
        playerBScore,
        winner: resolvedResultA === 'WIN' ? 'playerA' : resolvedResultA === 'LOSS' ? 'playerB' : 'draw',
        requestId,
      },
      { headers }
    );
  } catch (error) {
    console.error(`[match-complete ${requestId}] Error`, error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to complete match', requestId } },
      { status: 500, headers }
    );
  }
}
