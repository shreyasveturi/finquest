import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackEvent } from '@/lib/events';

/**
 * POST /api/match/bot/start
 * Start a bot match with idempotency per clientId.
 * Returns: { matchId, requestId }
 *
 * Request body: { clientId, username }
 *
 * Guarantees:
 * - Idempotent: same clientId always returns same matchId (if match still pending/active)
 * - Atomic: match + 5 rounds + questions all created or all rolled back
 * - Logged: each stage with requestId for support debugging
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const { clientId, username } = await req.json();

    // Validation
    if (!clientId || !username) {
      console.error(`[${requestId}] Missing clientId or username`, {
        requestId,
        clientId: clientId ? 'present' : 'missing',
        username: username ? 'present' : 'missing',
      });
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'clientId and username are required',
            requestId,
          },
        },
        { status: 400, headers: { 'x-request-id': requestId } }
      );
    }

    console.log(`[${requestId}] Start bot match request`, {
      requestId,
      clientId,
      username,
    });

    // Check for existing active/pending bot match for this clientId
    console.log(`[${requestId}] Checking for existing bot match`, { requestId, clientId });
    const existingMatch = await prisma.match.findFirst({
      where: {
        playerAId: clientId,
        isBotMatch: true,
        status: {
          in: ['active', 'in_progress'],
        },
      },
      select: {
        id: true,
        status: true,
        rounds: {
          select: { id: true },
        },
      },
    });

    if (existingMatch && existingMatch.rounds.length === 5) {
      console.log(`[${requestId}] Returning existing match (idempotency)`, {
        requestId,
        clientId,
        matchId: existingMatch.id,
        durationMs: Date.now() - startTime,
      });
      const headers = new Headers({
        'x-request-id': requestId,
      });
      return NextResponse.json(
        {
          matchId: existingMatch.id,
          requestId,
          cached: true,
        },
        { status: 200, headers }
      );
    }

    // Ensure user exists; create if not
    console.log(`[${requestId}] Ensure user exists`, { requestId, clientId });
    let user = await prisma.user.findUnique({
      where: { id: clientId },
    });

    if (!user) {
      console.log(`[${requestId}] Creating new user`, { requestId, clientId, username });
      user = await prisma.user.create({
        data: {
          id: clientId,
          name: username,
          rating: 1200,
          tier: 'Bronze',
        },
      });
      console.log(`[${requestId}] User created`, { requestId, userId: user.id, rating: user.rating });
    } else {
      console.log(`[${requestId}] User already exists`, { requestId, userId: user.id, rating: user.rating });
    }

    // Fetch exactly 5 questions
    console.log(`[${requestId}] Fetching questions for match`, { requestId });
    const questions = await prisma.question.findMany({
      take: 5,
      orderBy: { id: 'asc' },
    });

    if (!questions || questions.length < 5) {
      console.error(`[${requestId}] Not enough questions in database`, {
        requestId,
        found: questions?.length || 0,
        required: 5,
        durationMs: Date.now() - startTime,
      });
      return NextResponse.json(
        {
          error: {
            code: 'NO_QUESTIONS',
            message: 'Not enough questions available. Please contact support.',
            requestId,
          },
        },
        { status: 500, headers: { 'x-request-id': requestId } }
      );
    }

    console.log(`[${requestId}] Transaction start: creating match and rounds`, { requestId, clientId });

    // Atomic transaction: create match and all rounds in one go
    const match = await prisma.match.create({
      data: {
        playerAId: clientId,
        isBotMatch: true,
        status: 'active',
        startedAt: new Date(),
        rounds: {
          createMany: {
            data: questions.map((q, index) => ({
              roundIndex: index,
              questionId: q.id,
              correctIndex: q.correctIndex,
            })),
          },
        },
      },
      include: {
        rounds: {
          select: {
            id: true,
            roundIndex: true,
          },
        },
      },
    });

    console.log(`[${requestId}] Match created with rounds`, {
      requestId,
      matchId: match.id,
      roundCount: match.rounds.length,
      durationMs: Date.now() - startTime,
    });

    // Track events
    await Promise.all([
      trackEvent(
        'bot_match_created',
        {
          matchId: match.id,
          playerRating: user.rating,
          roundCount: match.rounds.length,
          requestId,
        },
        clientId
      ),
      trackEvent(
        'match_started',
        {
          matchId: match.id,
          isBotMatch: true,
          requestId,
        },
        clientId
      ),
    ]);

    console.log(`[${requestId}] Match start response`, {
      requestId,
      matchId: match.id,
      durationMs: Date.now() - startTime,
    });

    const headers = new Headers({
      'x-request-id': requestId,
      'Content-Type': 'application/json',
    });

    return NextResponse.json(
      {
        matchId: match.id,
        requestId,
      },
      { status: 200, headers }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`[${requestId}] Bot match start error`, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
    });

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to start bot match. Please try again.',
          requestId,
        },
      },
      { status: 500, headers: { 'x-request-id': requestId } }
    );
  }
}
