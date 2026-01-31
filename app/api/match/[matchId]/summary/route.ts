import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeMatchMetrics, RoundData } from '@/lib/metrics';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const headers = new Headers({ 'x-request-id': requestId });

  try {
    const { matchId } = await params;

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'matchId required', requestId } },
        { status: 400, headers }
      );
    }

    // Fetch match with rounds and match rounds
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        roundLogs: {
          orderBy: { roundIndex: 'asc' },
        },
        rounds: {
          orderBy: { roundIndex: 'asc' },
          include: {
            question: true,
            generatedQuestion: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: { code: 'MATCH_NOT_FOUND', message: 'Match not found', requestId } },
        { status: 404, headers }
      );
    }

    // Get round duration (default 25s)
    const roundDurationMs = 25000;

    // Extract round data for metrics calculation from roundLogs
    const roundData: RoundData[] = (match.roundLogs as any[]).map((r) => ({
      correct: r.correct,
      responseTimeMs: r.responseTimeMs,
      timeExpired: r.timeExpired,
      selectedOption: r.selectedOption,
    }));

    // Compute match metrics
    const metrics = computeMatchMetrics(roundData, roundDurationMs);

    // Build round summaries with question details and feedback
    const roundSummaries = (match.roundLogs as any[]).map((r) => {
      const matchRound = (match.rounds as any[]).find(
        (mr: any) => mr.roundIndex === r.roundIndex
      );
      
      let questionPrompt = 'N/A';
      let correctIndex = -1;
      
      if (matchRound) {
        if (matchRound.generatedQuestion) {
          questionPrompt = matchRound.generatedQuestion.prompt;
          correctIndex = matchRound.generatedQuestion.correctIndex;
        } else if (matchRound.question) {
          questionPrompt = matchRound.question.prompt;
          correctIndex = matchRound.question.correctIndex;
        }
      }

      return {
        roundIndex: r.roundIndex,
        correct: r.correct,
        responseTimeMs: r.responseTimeMs,
        timeExpired: r.timeExpired,
        selectedOption: r.selectedOption,
        timeToFirstCommitMs: r.timeToFirstCommitMs,
        questionPrompt,
        correctIndex,
        feedbackTag: r.feedbackTag || null,
        feedbackText: r.feedbackText || null,
      };
    });

    // Calculate scores from matchRounds (gameplay rounds)
    const playerAScore = (match.rounds as any[]).filter(
      (mr: any) => mr.playerAAnswer === mr.correctIndex
    ).length;
    const playerBScore = (match.rounds as any[]).filter(
      (mr: any) => mr.playerBAnswer !== null && mr.playerBAnswer === mr.correctIndex
    ).length;

    let winner: 'playerA' | 'playerB' | 'draw';
    if (playerAScore > playerBScore) winner = 'playerA';
    else if (playerBScore > playerAScore) winner = 'playerB';
    else winner = 'draw';

    return NextResponse.json(
      {
        ok: true,
        matchId,
        isBotMatch: match.isBotMatch,
        status: match.status,
        playerAScore,
        playerBScore,
        winner,
        totalRounds: (match.rounds as any[]).length,
        roundDurationMs,
        rounds: roundSummaries,
        metrics: {
          accuracy: metrics.accuracy,
          avgResponseTimeMs: metrics.avgResponseTimeMs,
          avgTimeRemainingRatio: metrics.avgTimeRemainingRatio,
          matchEfficiencyScore: metrics.matchEfficiencyScore,
          label: metrics.label,
          explanation: metrics.explanation,
        },
        ratingBefore: (match as any).ratingBeforeA,
        ratingAfter: (match as any).ratingAfterA,
        requestId,
      },
      { headers }
    );
  } catch (error) {
    console.error(`[match-summary ${requestId}] Error`, error);
    return NextResponse.json(
      {
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch match summary',
          requestId,
        },
      },
      { status: 500, headers }
    );
  }
}
