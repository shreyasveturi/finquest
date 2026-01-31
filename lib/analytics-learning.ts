/**
 * Learning Analytics for Phase 2
 * 
 * Computes defensible evidence of user improvement:
 * - Learning curves (accuracy & latency over time)
 * - Reasoning Consistency Score
 * - Variance tracking
 */

import { prisma } from './prisma';

/**
 * Structural question types for analysis
 */
export enum StructuralType {
  CONSTRAINT_CHECK = 'CONSTRAINT_CHECK',
  ASSUMPTION_TEST = 'ASSUMPTION_TEST',
  TRADE_OFF_ANALYSIS = 'TRADE_OFF_ANALYSIS',
  SIGNAL_NOISE = 'SIGNAL_NOISE',
  LOCAL_VS_GLOBAL = 'LOCAL_VS_GLOBAL',
  DEPENDENCY_MAPPING = 'DEPENDENCY_MAPPING',
  UNKNOWN = 'UNKNOWN',
}

export interface LearningCurvePoint {
  matchIndex: number; // 0 = most recent, increasing backward in time
  matchId: string;
  matchDate: Date;
  accuracy: number; // 0.0 to 1.0
  avgResponseTimeMs: number;
  avgTimeToFirstCommitMs: number | null;
  correctCount: number;
  totalRounds: number;
}

export interface LearningCurve {
  userId: string;
  displayName: string;
  totalMatches: number;
  points: LearningCurvePoint[];
  trend: {
    accuracySlope: number; // positive = improving
    latencySlope: number; // negative = getting faster
    improvementEvidence: 'IMPROVING' | 'STABLE' | 'REGRESSING' | 'INSUFFICIENT_DATA';
  };
}

export interface ReasoningConsistencyScore {
  userId: string;
  score: number; // 0.0 to 1.0, higher = more consistent
  breakdown: {
    accuracyVariance: number; // lower = more consistent
    timeVariance: number; // lower = more consistent
    structuralConsistency: { [key in StructuralType]?: number }; // per-type consistency
  };
  matchesSampled: number;
}

/**
 * Compute learning curve for a user over last N matches
 */
export async function getUserLearningCurve(
  userId: string,
  lastNMatches: number = 20
): Promise<LearningCurve> {
  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, displayName: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Fetch last N completed matches for this user
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ playerAId: userId }, { playerBId: userId }],
      status: 'COMPLETED',
    },
    orderBy: { endedAt: 'desc' },
    take: lastNMatches,
    include: {
      roundLogs: {
        where: { userId },
        orderBy: { roundIndex: 'asc' },
      },
    },
  });

  // Build learning curve points
  const points: LearningCurvePoint[] = matches.map((match, index) => {
    const rounds = match.roundLogs as any[];
    const correctCount = rounds.filter((r) => r.correct).length;
    const totalRounds = rounds.length;
    const accuracy = totalRounds > 0 ? correctCount / totalRounds : 0;

    const avgResponseTimeMs =
      rounds.length > 0
        ? rounds.reduce((sum, r) => sum + r.responseTimeMs, 0) / rounds.length
        : 0;

    const timesToFirstCommit = rounds
      .map((r) => r.timeToFirstCommitMs)
      .filter((t) => t !== null && t !== undefined) as number[];
    const avgTimeToFirstCommitMs =
      timesToFirstCommit.length > 0
        ? timesToFirstCommit.reduce((a, b) => a + b, 0) / timesToFirstCommit.length
        : null;

    return {
      matchIndex: index,
      matchId: match.id,
      matchDate: (match as any).endedAt || match.createdAt,
      accuracy,
      avgResponseTimeMs,
      avgTimeToFirstCommitMs,
      correctCount,
      totalRounds,
    };
  });

  // Reverse so oldest is first (for trend calculation)
  const chronologicalPoints = [...points].reverse();

  // Compute trend (simple linear regression)
  const trend = computeTrend(chronologicalPoints);

  return {
    userId: user.id,
    displayName: user.displayName,
    totalMatches: matches.length,
    points,
    trend,
  };
}

/**
 * Compute reasoning consistency score for a user
 */
export async function getUserReasoningConsistencyScore(
  userId: string,
  lastNMatches: number = 20
): Promise<ReasoningConsistencyScore> {
  // Fetch matches with rounds and questions
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ playerAId: userId }, { playerBId: userId }],
      status: 'COMPLETED',
    },
    orderBy: { endedAt: 'desc' },
    take: lastNMatches,
    include: {
      roundLogs: {
        where: { userId },
      },
      rounds: {
        include: {
          question: true,
          generatedQuestion: true,
        },
      },
    },
  });

  if (matches.length < 3) {
    return {
      userId,
      score: 0,
      breakdown: {
        accuracyVariance: 0,
        timeVariance: 0,
        structuralConsistency: {},
      },
      matchesSampled: matches.length,
    };
  }

  // Aggregate all rounds
  const allRounds = matches.flatMap((m) => (m.roundLogs as any[]));

  // Compute accuracy variance (per match)
  const matchAccuracies = matches.map((m) => {
    const rounds = (m.roundLogs as any[]);
    return rounds.filter((r) => r.correct).length / rounds.length;
  });
  const accuracyVariance = variance(matchAccuracies);

  // Compute time variance (coefficient of variation)
  const responseTimes = allRounds.map((r) => r.responseTimeMs);
  const timeVariance = coefficientOfVariation(responseTimes);

  // Compute per-structural-type consistency
  const structuralConsistency: { [key: string]: number } = {};

  for (const type of Object.values(StructuralType)) {
    const roundsOfType = allRounds.filter((r) => {
      const matchRound = matches
        .flatMap((m) => m.rounds)
        .find((mr) => (mr as any).roundIndex === r.roundIndex);
      if (!matchRound) return false;

      const question =
        (matchRound as any).generatedQuestion || (matchRound as any).question;
      return question?.structuralType === type;
    });

    if (roundsOfType.length >= 3) {
      const accuracies = roundsOfType.map((r) => (r.correct ? 1 : 0));
      const typeVariance = variance(accuracies);
      structuralConsistency[type] = 1 - Math.min(typeVariance, 1); // invert: high consistency = low variance
    }
  }

  // Composite score: lower variance = higher score
  const score = Math.max(
    0,
    Math.min(
      1,
      1 - (accuracyVariance * 0.5 + timeVariance * 0.3 + (1 - averageValue(Object.values(structuralConsistency))) * 0.2)
    )
  );

  return {
    userId,
    score,
    breakdown: {
      accuracyVariance,
      timeVariance,
      structuralConsistency,
    },
    matchesSampled: matches.length,
  };
}

/**
 * Helper: Compute simple linear trend
 */
function computeTrend(points: LearningCurvePoint[]): LearningCurve['trend'] {
  if (points.length < 3) {
    return {
      accuracySlope: 0,
      latencySlope: 0,
      improvementEvidence: 'INSUFFICIENT_DATA',
    };
  }

  // X = match index (0, 1, 2, ...), Y = metric value
  const n = points.length;
  const xMean = (n - 1) / 2;

  // Accuracy slope
  const yAccuracyMean = points.reduce((sum, p) => sum + p.accuracy, 0) / n;
  const accuracySlope =
    points.reduce((sum, p, i) => sum + (i - xMean) * (p.accuracy - yAccuracyMean), 0) /
    points.reduce((sum, p, i) => sum + Math.pow(i - xMean, 2), 0);

  // Latency slope (response time)
  const yLatencyMean =
    points.reduce((sum, p) => sum + p.avgResponseTimeMs, 0) / n;
  const latencySlope =
    points.reduce(
      (sum, p, i) => sum + (i - xMean) * (p.avgResponseTimeMs - yLatencyMean),
      0
    ) / points.reduce((sum, p, i) => sum + Math.pow(i - xMean, 2), 0);

  // Determine improvement evidence
  let improvementEvidence: LearningCurve['trend']['improvementEvidence'] =
    'STABLE';
  if (accuracySlope > 0.01 && latencySlope < -100) {
    // Getting more accurate AND faster
    improvementEvidence = 'IMPROVING';
  } else if (accuracySlope > 0.01 || latencySlope < -100) {
    // Improving in one dimension
    improvementEvidence = 'IMPROVING';
  } else if (accuracySlope < -0.01 || latencySlope > 100) {
    improvementEvidence = 'REGRESSING';
  }

  return {
    accuracySlope,
    latencySlope,
    improvementEvidence,
  };
}

/**
 * Helper: Compute variance
 */
function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Helper: Compute coefficient of variation (std dev / mean)
 */
function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const stdDev = Math.sqrt(variance(values));
  return stdDev / mean;
}

/**
 * Helper: Average of array
 */
function averageValue(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Find isomorphic (structurally similar) questions
 */
export async function findIsomorphicQuestions(
  questionId: string,
  structuralType: StructuralType,
  limit: number = 5
): Promise<string[]> {
  // Find questions with same structural type
  const questions = await prisma.question.findMany({
    where: {
      structuralType,
      id: { not: questionId },
    },
    take: limit,
    select: { id: true },
  });

  const generatedQuestions = await prisma.generatedQuestion.findMany({
    where: {
      structuralType,
      id: { not: questionId },
    },
    take: limit,
    select: { id: true },
  });

  return [
    ...questions.map((q) => q.id),
    ...generatedQuestions.map((q) => q.id),
  ].slice(0, limit);
}
