/**
 * Feedback Taxonomy for Phase 1
 * 
 * Each tag maps to a structural insight that applies to a class of problems,
 * not just the specific question. These are learning-science aligned and
 * focus on reasoning schemas, not content.
 */

export enum FeedbackTag {
  MISSED_CONSTRAINT = 'MISSED_CONSTRAINT',
  UNCHECKED_ASSUMPTION = 'UNCHECKED_ASSUMPTION',
  RUSHED_DECISION = 'RUSHED_DECISION',
  OVERTHOUGHT = 'OVERTHOUGHT',
  LOCAL_OPTIMUM = 'LOCAL_OPTIMUM',
  MISREAD_STRUCTURE = 'MISREAD_STRUCTURE',
  SIGNAL_NOISE_CONFUSION = 'SIGNAL_NOISE_CONFUSION',
}

/**
 * Feedback text mapping: tag → short, actionable insight
 * 
 * Rules:
 * - Max 1–2 short sentences
 * - Use structural language: constraints, assumptions, structure, signal vs noise, trade-offs
 * - Never explain the full solution
 * - Focus on reasoning failure mode
 * - Should help performance on the *next* attempt
 */
export const FEEDBACK_MAP: Record<FeedbackTag, string> = {
  [FeedbackTag.MISSED_CONSTRAINT]:
    'You committed without checking the binding constraint.',

  [FeedbackTag.UNCHECKED_ASSUMPTION]:
    'You accepted an assumption without validating it against the evidence.',

  [FeedbackTag.RUSHED_DECISION]:
    'You prioritised speed before validating the structure.',

  [FeedbackTag.OVERTHOUGHT]:
    'You added complexity where the structure was simple.',

  [FeedbackTag.LOCAL_OPTIMUM]:
    'You optimised locally instead of comparing trade-offs.',

  [FeedbackTag.MISREAD_STRUCTURE]:
    'You focused on surface details instead of the underlying structure.',

  [FeedbackTag.SIGNAL_NOISE_CONFUSION]:
    'You treated noise as signal, or missed the signal in the details.',
};

/**
 * Get feedback text for a given tag
 */
export function getFeedbackText(tag: FeedbackTag): string {
  return FEEDBACK_MAP[tag];
}
