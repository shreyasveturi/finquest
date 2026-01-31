/**
 * Season Management for Phase 3
 * 
 * Handles weekly/seasonal resets for leaderboards
 */

import { prisma } from './prisma';

/**
 * Get or create the current active season
 * If no active season exists, creates one for the current week
 */
export async function getActiveSeason() {
  // Try to find existing active season
  let season = await prisma.season.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  // If no active season, create one
  if (!season) {
    const now = new Date();
    const weekStart = getMonday(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const seasonName = `Week of ${weekStart.toISOString().split('T')[0]}`;

    season = await prisma.season.create({
      data: {
        name: seasonName,
        startsAt: weekStart,
        endsAt: weekEnd,
        isActive: true,
      },
    });
  }

  return season;
}

/**
 * Helper: Get Monday of current week
 */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * End current season and create new one
 * Called by cron job weekly
 */
export async function rotateSeason() {
  const now = new Date();

  // End all active seasons
  await prisma.season.updateMany({
    where: { isActive: true },
    data: {
      isActive: false,
      endsAt: now,
    },
  });

  // Create new season
  const weekStart = now;
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const seasonName = `Week of ${weekStart.toISOString().split('T')[0]}`;

  const newSeason = await prisma.season.create({
    data: {
      name: seasonName,
      startsAt: weekStart,
      endsAt: weekEnd,
      isActive: true,
    },
  });

  return newSeason;
}

/**
 * Get or create leaderboard snapshot for user in season
 */
export async function getOrCreateSnapshot(userId: string, seasonId: string) {
  let snapshot = await prisma.leaderboardSnapshot.findUnique({
    where: {
      seasonId_userId: {
        seasonId,
        userId,
      },
    },
  });

  if (!snapshot) {
    // Get user's current rating
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true },
    });

    snapshot = await prisma.leaderboardSnapshot.create({
      data: {
        seasonId,
        userId,
        rating: user?.rating || 1200,
      },
    });
  }

  return snapshot;
}

/**
 * Update leaderboard snapshot after match completion
 */
export async function updateLeaderboardAfterMatch(
  userId: string,
  matchResult: 'WIN' | 'LOSS' | 'DRAW',
  accuracy: number,
  efficiency: number,
  newRating: number
) {
  const season = await getActiveSeason();
  const snapshot = await getOrCreateSnapshot(userId, season.id);

  // Increment match count
  const newMatches = snapshot.matches + 1;
  const newWins = matchResult === 'WIN' ? snapshot.wins + 1 : snapshot.wins;
  const newLosses = matchResult === 'LOSS' ? snapshot.losses + 1 : snapshot.losses;

  // Rolling average for accuracy and efficiency
  const newAccuracy =
    (snapshot.accuracy * snapshot.matches + accuracy) / newMatches;
  const newEfficiency =
    (snapshot.efficiency * snapshot.matches + efficiency) / newMatches;

  await prisma.leaderboardSnapshot.update({
    where: { id: snapshot.id },
    data: {
      matches: newMatches,
      wins: newWins,
      losses: newLosses,
      accuracy: newAccuracy,
      efficiency: newEfficiency,
      rating: newRating,
    },
  });
}
