/**
 * Phase 0: Core Learning Mechanics - Metrics & Efficiency Scoring
 * 
 * Computes time-pressure efficiency scores and performance labels
 * to train decision-making under time constraints.
 */

export interface RoundData {
  correct: boolean;
  responseTimeMs: number;
  timeExpired: boolean;
  selectedOption?: string | null;
}

export interface MatchMetrics {
  accuracy: number;
  avgResponseTimeMs: number;
  avgTimeRemainingRatio: number;
  matchEfficiencyScore: number;
  label: 'Fast but inaccurate' | 'Accurate but slow' | 'Balanced';
  explanation: string;
}

/**
 * Compute round efficiency score
 * Formula: (correct ? 1 : 0) * (timeRemainingMs / roundDurationMs)
 * Range: [0, 1]
 */
export function computeRoundEfficiency(
  correct: boolean,
  responseTimeMs: number,
  roundDurationMs: number
): number {
  const timeRemainingMs = Math.max(0, roundDurationMs - responseTimeMs);
  const timeRemainingRatio = timeRemainingMs / roundDurationMs;
  return correct ? timeRemainingRatio : 0;
}

/**
 * Compute match-level metrics and derive performance label
 */
export function computeMatchMetrics(
  rounds: RoundData[],
  roundDurationMs: number
): MatchMetrics {
  if (rounds.length === 0) {
    return {
      accuracy: 0,
      avgResponseTimeMs: 0,
      avgTimeRemainingRatio: 0,
      matchEfficiencyScore: 0,
      label: 'Balanced',
      explanation: 'No rounds completed',
    };
  }

  // Compute accuracy
  const correctCount = rounds.filter((r) => r.correct).length;
  const accuracy = correctCount / rounds.length;

  // Compute average response time
  const totalResponseTime = rounds.reduce((sum, r) => sum + r.responseTimeMs, 0);
  const avgResponseTimeMs = totalResponseTime / rounds.length;

  // Compute average time remaining ratio
  const timeRemainingRatios = rounds.map((r) => {
    const timeRemainingMs = Math.max(0, roundDurationMs - r.responseTimeMs);
    return timeRemainingMs / roundDurationMs;
  });
  const avgTimeRemainingRatio = timeRemainingRatios.reduce((sum, r) => sum + r, 0) / rounds.length;

  // Compute match efficiency score (average of round efficiencies)
  const roundEfficiencies = rounds.map((r) =>
    computeRoundEfficiency(r.correct, r.responseTimeMs, roundDurationMs)
  );
  const matchEfficiencyScore = roundEfficiencies.reduce((sum, e) => sum + e, 0) / rounds.length;

  // Derive performance label
  let label: 'Fast but inaccurate' | 'Accurate but slow' | 'Balanced';
  let explanation: string;

  // Thresholds
  const ACCURACY_HIGH = 0.7;
  const ACCURACY_LOW = 0.55;
  const TIME_REMAINING_LOW = 0.35;
  const TIME_REMAINING_HIGH = 0.45;

  if (accuracy >= ACCURACY_HIGH && avgTimeRemainingRatio < TIME_REMAINING_LOW) {
    label = 'Accurate but slow';
    explanation =
      "You're getting it right, but underusing the clock. Try committing earlier to build speed.";
  } else if (accuracy < ACCURACY_LOW && avgTimeRemainingRatio >= TIME_REMAINING_HIGH) {
    label = 'Fast but inaccurate';
    explanation =
      "You're committing quickly, but accuracy is lagging. Slow down slightly and verify your reasoning.";
  } else {
    label = 'Balanced';
    explanation = 'Good tradeoff between speed and accuracy. Keep refining both.';
  }

  return {
    accuracy,
    avgResponseTimeMs,
    avgTimeRemainingRatio,
    matchEfficiencyScore,
    label,
    explanation,
  };
}

/**
 * Format efficiency score as percentage string
 */
export function formatEfficiency(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Format accuracy as percentage string
 */
export function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

/**
 * Format response time in milliseconds to seconds
 */
export function formatResponseTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
