/**
 * Scio Analytics System
 * 
 * Tracks learning and engagement behavior locally only.
 * No third-party tracking, no personal data collection.
 * 
 * Metrics tracked:
 * - Learning actions (prediction, reflection, checkpoint results)
 * - Engagement depth (tooltips, explain uses, scroll depth)
 * - Time invested in learning
 */

export type ScioAnalytics = {
  predictionWritten: boolean;
  reflectionWritten: boolean;
  tooltipOpens: number;
  checkpointCorrect: number;
  checkpointIncorrect: number;
  interviewExplainUses: number;
  totalTimeOnArticle: number;
  scrollDepth: number;
};

const ANALYTICS_KEY = 'scio_analytics';

/**
 * Get analytics object from localStorage
 */
function getAnalyticsFromStorage(): ScioAnalytics {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load analytics from storage:', e);
  }

  // Return default empty analytics
  return {
    predictionWritten: false,
    reflectionWritten: false,
    tooltipOpens: 0,
    checkpointCorrect: 0,
    checkpointIncorrect: 0,
    interviewExplainUses: 0,
    totalTimeOnArticle: 0,
    scrollDepth: 0,
  };
}

/**
 * Save analytics object to localStorage
 */
function saveAnalyticsToStorage(analytics: ScioAnalytics): void {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    console.log('SCIO ANALYTICS UPDATE:', analytics);
  } catch (e) {
    console.error('Failed to save analytics to storage:', e);
  }
}

/**
 * Track prediction written
 */
export function trackPredictionWritten(): void {
  const analytics = getAnalyticsFromStorage();
  analytics.predictionWritten = true;
  saveAnalyticsToStorage(analytics);
}

/**
 * Track reflection written
 */
export function trackReflectionWritten(): void {
  const analytics = getAnalyticsFromStorage();
  analytics.reflectionWritten = true;
  saveAnalyticsToStorage(analytics);
}

/**
 * Track tooltip open
 */
export function trackTooltipOpen(): void {
  const analytics = getAnalyticsFromStorage();
  analytics.tooltipOpens++;
  saveAnalyticsToStorage(analytics);
}

/**
 * Track checkpoint result
 */
export function trackCheckpointResult(correct: boolean): void {
  const analytics = getAnalyticsFromStorage();
  if (correct) {
    analytics.checkpointCorrect++;
  } else {
    analytics.checkpointIncorrect++;
  }
  saveAnalyticsToStorage(analytics);
}

/**
 * Track interview explain use
 */
export function trackInterviewExplainUse(): void {
  const analytics = getAnalyticsFromStorage();
  analytics.interviewExplainUses++;
  saveAnalyticsToStorage(analytics);
}

/**
 * Start article timer (returns start time)
 */
export function startArticleTimer(): number {
  return Date.now();
}

/**
 * End article timer and update total time
 */
export function endArticleTimer(startTime: number): void {
  const analytics = getAnalyticsFromStorage();
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  analytics.totalTimeOnArticle += elapsedSeconds;
  saveAnalyticsToStorage(analytics);
}

/**
 * Track scroll depth (percentage 0-100)
 */
export function trackScrollDepth(percentage: number): void {
  const analytics = getAnalyticsFromStorage();
  // Only update if current scroll is deeper than previous max
  if (percentage > analytics.scrollDepth) {
    analytics.scrollDepth = percentage;
    saveAnalyticsToStorage(analytics);
  }
}

/**
 * Get current analytics object (read-only)
 */
export function getAnalytics(): ScioAnalytics {
  return getAnalyticsFromStorage();
}

/**
 * Reset analytics (for testing)
 */
export function resetAnalytics(): void {
  localStorage.removeItem(ANALYTICS_KEY);
  console.log('SCIO ANALYTICS: Reset');
}
