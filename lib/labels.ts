/**
 * Identity-Based Labels for Phase 3
 * 
 * Positive-framing labels derived from recent match performance
 * NO streaks, NO shame mechanics
 */

export interface UserStats {
  avgAccuracy: number; // 0.0 to 1.0
  avgEfficiency: number; // 0.0 to 1.0 (if tracked)
  accuracyStdDev: number; // consistency metric
  closeLossRate: number; // rate of losses by 1 question
  matchCount: number;
}

export interface UserLabel {
  label: string;
  blurb: string;
  color: 'blue' | 'purple' | 'green' | 'gray';
}

/**
 * Compute identity-based label from user stats
 * Based on last N matches in active season
 */
export function computeUserLabel(stats: UserStats): UserLabel {
  const { avgAccuracy, avgEfficiency, accuracyStdDev, matchCount } = stats;

  // Need at least 3 matches for meaningful label
  if (matchCount < 3) {
    return {
      label: 'Building Momentum',
      blurb: 'Play more matches to unlock your reasoning profile.',
      color: 'gray',
    };
  }

  // Consistent Closer: Low variance + good accuracy
  if (accuracyStdDev < 0.15 && avgAccuracy >= 0.65) {
    return {
      label: 'Consistent Closer',
      blurb: 'Stable accuracy under time pressure.',
      color: 'blue',
    };
  }

  // Fast but Risky: High efficiency + lower accuracy
  if (avgEfficiency >= 0.6 && avgAccuracy < 0.55) {
    return {
      label: 'Fast but Risky',
      blurb: 'Speed is high. Tighten your constraint checks.',
      color: 'purple',
    };
  }

  // Precision Thinker: High accuracy + moderate efficiency
  if (avgAccuracy >= 0.75 && avgEfficiency >= 0.3) {
    return {
      label: 'Precision Thinker',
      blurb: 'High accuracy. Work on earlier commitment.',
      color: 'green',
    };
  }

  // Fallback: Building Momentum
  return {
    label: 'Building Momentum',
    blurb: 'Your reasoning patterns are taking shape.',
    color: 'gray',
  };
}

/**
 * Compute user stats from recent matches
 * Call this with last N completed matches for a user
 */
export function computeUserStats(matches: {
  accuracy: number;
  efficiency: number;
  isNearMiss: boolean;
  result: 'WIN' | 'LOSS' | 'DRAW';
}[]): UserStats {
  if (matches.length === 0) {
    return {
      avgAccuracy: 0,
      avgEfficiency: 0,
      accuracyStdDev: 0,
      closeLossRate: 0,
      matchCount: 0,
    };
  }

  const accuracies = matches.map((m) => m.accuracy);
  const efficiencies = matches.map((m) => m.efficiency);

  const avgAccuracy = mean(accuracies);
  const avgEfficiency = mean(efficiencies);
  const accuracyStdDev = stdDev(accuracies, avgAccuracy);

  const losses = matches.filter((m) => m.result === 'LOSS');
  const closeLosses = losses.filter((m) => m.isNearMiss);
  const closeLossRate = losses.length > 0 ? closeLosses.length / losses.length : 0;

  return {
    avgAccuracy,
    avgEfficiency,
    accuracyStdDev,
    closeLossRate,
    matchCount: matches.length,
  };
}

/**
 * Helper: Mean
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Helper: Standard deviation
 */
function stdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}
