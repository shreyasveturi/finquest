import { prisma } from './prisma';

/**
 * Find a human opponent within ±100 rating band
 * Expands search window over time
 */
export async function findHumanOpponent(
  userId: string,
  userRating: number,
  queueStartTime: number
): Promise<string | null> {
  // Calculate search band based on queue time
  const queueTimeSeconds = (Date.now() - queueStartTime) / 1000;
  const baseWindow = 100;
  const expandedWindow = baseWindow + Math.floor(queueTimeSeconds / 2) * 10; // Expand by 10 every 2s

  // Find user in queue who is not the current user
  const opponent = await prisma.user.findFirst({
    where: {
      id: { not: userId },
      rating: {
        gte: userRating - expandedWindow,
        lte: userRating + expandedWindow,
      },
    },
    orderBy: {
      rating: 'asc', // Pick closest rating match
    },
  });

  return opponent?.id || null;
}

/**
 * Calculate timeout: 8-12 seconds, then bot fallback
 */
export function getMatchmakingTimeout(): number {
  const baseTimeout = 8000; // 8 seconds base
  const randomVariance = Math.random() * 4000; // +0-4 seconds variance
  return baseTimeout + randomVariance;
}
