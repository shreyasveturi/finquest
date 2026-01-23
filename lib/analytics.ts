/**
 * Scio v0.1 Analytics System
 * 
 * Tracks ranked match events for game analytics dashboard.
 * Used by /admin/metrics to display player stats, leaderboard, and match history.
 */

export interface AnalyticsEvent {
  userId?: string;
  eventType: 'match_started' | 'round_completed' | 'match_finished';
  matchId?: string;
  roundNumber?: number;
  correct?: boolean;
  eloChange?: number;
  timestamp?: Date;
}
