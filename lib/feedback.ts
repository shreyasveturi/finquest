/**
 * Feedback Assignment Logic for Phase 1
 * 
 * Uses simple heuristics to assign feedback tags based on round data.
 * Inputs include timing, correctness, and time pressure signals.
 * 
 * NO LLM calls. NO long explanations.
 * Idempotent: safe to re-run multiple times.
 */

import { FeedbackTag } from './feedbackMap';

export interface RoundData {
  correct: boolean;
  responseTimeMs: number;
  timeExpired: boolean;
  roundDurationMs: number;
  timeToFirstCommitMs?: number | null;
  optionCount?: number;
}

/**
 * Assign a feedback tag to an incorrect round using heuristics
 * 
 * @param round Round data to analyze
 * @returns FeedbackTag or null if no feedback should be assigned
 */
export function assignFeedback(round: RoundData): FeedbackTag | null {
  // Only assign feedback for incorrect answers
  if (round.correct) {
    return null;
  }

  const {
    responseTimeMs,
    timeExpired,
    roundDurationMs,
    timeToFirstCommitMs,
  } = round;

  // Heuristic 1: Time expired → likely missed a constraint (ran out of time to check)
  if (timeExpired) {
    return FeedbackTag.MISSED_CONSTRAINT;
  }

  const responseTimeRatio = responseTimeMs / roundDurationMs;
  const earlyThreshold = 0.3; // 30% of round time
  const lateThreshold = 0.8; // 80% of round time

  // Heuristic 2: Very fast response (< 30% of round time) → rushed decision
  if (responseTimeRatio < earlyThreshold) {
    return FeedbackTag.RUSHED_DECISION;
  }

  // Heuristic 3: Very slow response (> 80% of round time) → overthought
  if (responseTimeRatio > lateThreshold) {
    return FeedbackTag.OVERTHOUGHT;
  }

  // Heuristic 4: Committed very late (timeToFirstCommit exists and is late)
  // This suggests they were uncertain and kept checking
  if (timeToFirstCommitMs !== null && timeToFirstCommitMs !== undefined) {
    const commitRatio = timeToFirstCommitMs / roundDurationMs;
    if (commitRatio > 0.7) {
      return FeedbackTag.UNCHECKED_ASSUMPTION;
    }
  }

  // Heuristic 5: Medium-speed but still wrong → likely misread structure
  // or treated noise as signal
  if (responseTimeRatio > 0.45 && responseTimeRatio < 0.75) {
    // Alternate between MISREAD_STRUCTURE and SIGNAL_NOISE_CONFUSION
    // for variety (deterministic based on time)
    return responseTimeMs % 2 === 0
      ? FeedbackTag.MISREAD_STRUCTURE
      : FeedbackTag.SIGNAL_NOISE_CONFUSION;
  }

  // Fallback: generic structural insight
  return FeedbackTag.MISREAD_STRUCTURE;
}

/**
 * Batch assign feedback to multiple rounds
 * Returns a map of roundIndex → feedback tag
 */
export function assignFeedbackBatch(
  rounds: RoundData[]
): Map<number, FeedbackTag> {
  const result = new Map<number, FeedbackTag>();

  rounds.forEach((round, index) => {
    const tag = assignFeedback(round);
    if (tag) {
      result.set(index, tag);
    }
  });

  return result;
}
