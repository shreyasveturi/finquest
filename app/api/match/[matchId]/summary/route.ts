import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeMatchMetrics, RoundData } from '@/lib/metrics';
import { computeUserStats, computeUserLabel } from '@/lib/labels';

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

    // Fetch match with rounds from both tables
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
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

    // Phase 3: Fetch Round logs (user-specific data)
    const roundLogs = await prisma.round.findMany({
      where: {
        matchId,
        userId: match.playerAId, // Current user is playerA
      },
      orderBy: { roundIndex: 'asc' },
    });

    // Get round duration (default 25s)
    const roundDurationMs = 25000;

    // Extract round data for metrics calculation
    const roundData: RoundData[] = roundLogs.map((r) => ({
      correct: r.correct,
      responseTimeMs: r.responseTimeMs,
      timeExpired: r.timeExpired,
      selectedOption: r.selectedOption,
    }));

    // Compute match metrics
    const metrics = computeMatchMetrics(roundData, roundDurationMs);

    // Build round summaries with question details and feedback
    const roundSummaries = roundLogs.map((r) => {
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
        wasDecidingMistake: r.wasDecidingMistake || false, // Phase 3
      };
    });

    // Phase 3: Use scoreA/scoreB from Match table
    const playerAScore = (match as any).scoreA ?? roundLogs.filter(r => r.correct).length;
    const playerBScore = (match as any).scoreB ?? (match.rounds as any[]).filter(
      (mr: any) => mr.playerBAnswer !== null && mr.playerBAnswer === mr.correctIndex
    ).length;

    let winner: 'playerA' | 'playerB' | 'draw';
    if (playerAScore > playerBScore) winner = 'playerA';
    else if (playerBScore > playerAScore) winner = 'playerB';
    else winner = 'draw';

    // Phase 3: Compute user label from recent matches
    let userLabel: { label: string; blurb: string; color: string } | null = null;
    try {
      const recentMatches = await prisma.match.findMany({
        where: {
          playerAId: match.playerAId,
          status: 'COMPLETED',
        },
        orderBy: { endedAt: 'desc' },
        take: 10,
      });

      const matchStats = recentMatches.map((m) => {
        const totalRounds = 10;
        const accuracy = (m as any).scoreA !== null ? (m as any).scoreA / totalRounds : 0;
        const efficiency = 0.5; // Placeholder
        return {
          accuracy,
          efficiency,
          isNearMiss: (m as any).nearMiss || false,
          result: (m as any).resultA as 'WIN' | 'LOSS' | 'DRAW',
        };
      });

      const stats = computeUserStats(matchStats);
      userLabel = computeUserLabel(stats);
    } catch (labelError) {
      console.error(`[match-summary ${requestId}] Failed to compute label:`, labelError);
    }

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
        // Phase 3 fields
        nearMiss: (match as any).nearMiss || false,
        scoreA: playerAScore,
        scoreB: playerBScore,
        decidedByRoundIndex: (match as any).decidedByRoundIndex ?? null,
        opponentType: match.isBotMatch ? 'bot' : 'human',
        userLabel,
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
