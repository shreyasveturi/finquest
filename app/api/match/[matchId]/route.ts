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
  const requestId = crypto.randomUUID().slice(0, 8);
  const headers = new Headers({ 'x-request-id': requestId });

  try {
    const { matchId } = await params;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    console.log(`[match-get ${requestId}] GET /api/match/${matchId} clientId=${clientId?.slice(0, 8)}`);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        rounds: {
          include: {
            question: true,
            generatedQuestion: true,
          },
          orderBy: {
            roundIndex: 'asc',
          },
        },
      },
    });

    if (!match) {
      console.error(`[match-get ${requestId}] ✗ MATCH_NOT_FOUND matchId=${matchId}`);
      return NextResponse.json(
        { error: { code: 'MATCH_NOT_FOUND', message: 'Match not found', requestId } },
        { status: 404, headers }
      );
    }

    console.log(`[match-get ${requestId}] ✓ Found match ${matchId} with ${match.rounds.length} rounds`);

    // Resolve user by clientId and verify participant
    if (!clientId) {
      console.error(`[${requestId}] Unauthorized match access (missing clientId)`, {
        requestId,
        matchId,
      });
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not a player in this match', requestId } },
        { status: 403, headers: { 'x-request-id': requestId } }
      );
    }

    const user = await prisma.user.findUnique({ where: { clientId } });
    if (!user || (match.playerAId !== user.id && match.playerBId !== user.id)) {
      console.error(`[${requestId}] Unauthorized match access`, {
        requestId,
        matchId,
        clientId,
        userId: user?.id,
        playerAId: match.playerAId,
        playerBId: match.playerBId,
      });
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not a player in this match', requestId } },
        { status: 403, headers: { 'x-request-id': requestId } }
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

    // Normalize rounds to a unified question payload
    const normalizedRounds = orderedRounds.map((r) => {
      let questionPayload: any = null;

      if (r.generatedQuestion) {
        // Parse choices from JSON
        let choices: string[] = [];
        try {
          const parsed = JSON.parse(r.generatedQuestion.choicesJson);
          if (Array.isArray(parsed)) choices = parsed as string[];
        } catch {}

        questionPayload = {
          id: r.generatedQuestion.id,
          prompt: r.generatedQuestion.prompt,
          options: choices,
          type: 'multiple-choice',
          difficulty: (typeof r.generatedQuestion.difficulty === 'number') ? String(r.generatedQuestion.difficulty) : 'medium',
        };
      } else if (r.question) {
        // Question model stores options as JSON string
        let choices: string[] = [];
        try {
          const parsed = typeof r.question.options === 'string' ? JSON.parse(r.question.options) : r.question.options;
          if (Array.isArray(parsed)) choices = parsed as string[];
        } catch {}

        questionPayload = {
          id: r.question.id,
          prompt: r.question.prompt,
          options: choices,
          type: r.question.type || 'multiple-choice',
          difficulty: r.question.difficulty || 'medium',
        };
      }

      return {
        id: r.id,
        roundIndex: r.roundIndex,
        questionId: r.questionId ?? r.generatedQuestionId ?? undefined,
        question: questionPayload,
        playerAAnswer: r.playerAAnswer,
        playerBAnswer: r.playerBAnswer,
        correctIndex: r.correctIndex,
        endedAt: r.endedAt,
      };
    });

    console.log(`[match-get ${requestId}] ✓ Returning match data with ${normalizedRounds.length} normalized rounds`);

    return NextResponse.json(
      {
        id: match.id,
        mode: match.mode,
        status: match.status,
        playerAId: match.playerAId,
        playerBId: match.playerBId,
        isBotMatch: match.isBotMatch,
        createdAt: match.createdAt,
        startedAt: match.startedAt,
        endedAt: match.endedAt,
        rounds: normalizedRounds,
        currentRoundIndex: activeIndex === -1 ? orderedRounds.length - 1 : activeIndex,
        roundStartAt,
        roundDurationMs,
        roundStatus,
        serverNow: now,
        requestId,
      },
      { headers }
    );
  } catch (error) {
    console.error(`[match-get ${requestId}] ✗ Error:`, error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch match', requestId } },
      { status: 500, headers }
    );
  }
}

