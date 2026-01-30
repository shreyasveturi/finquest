/**
 * ELO rating calculation
 * K-factor: 32 (standard for most games)
 * Starting rating: 1200
 */

const K_FACTOR = 32;

export function calculateNewRatings(
  playerARating: number,
  playerBRating: number,
  playerAWins: boolean
): {
  playerANewRating: number;
  playerBNewRating: number;
} {
  // Expected score (probability of A winning)
  const expectedScoreA = 1 / (1 + Math.pow(10, (playerBRating - playerARating) / 400));
  const expectedScoreB = 1 / (1 + Math.pow(10, (playerARating - playerBRating) / 400));

  // Actual score (1 if won, 0 if lost)
  const actualScoreA = playerAWins ? 1 : 0;
  const actualScoreB = playerAWins ? 0 : 1;

  // New ratings
  const playerANewRating = Math.round(playerARating + K_FACTOR * (actualScoreA - expectedScoreA));
  const playerBNewRating = Math.round(playerBRating + K_FACTOR * (actualScoreB - expectedScoreB));

  return {
    playerANewRating,
    playerBNewRating,
  };
}

export function getTier(rating: number): string {
  if (rating < 1150) return 'Bronze';
  if (rating < 1350) return 'Silver';
  if (rating < 1550) return 'Gold';
  return 'Platinum';
}

export function calculateEloUpdate(
  playerARating: number,
  playerBRating: number,
  scoreA: number,
  kFactor: number = K_FACTOR
): { playerANewRating: number; playerBNewRating: number } {
  const expectedScoreA = 1 / (1 + Math.pow(10, (playerBRating - playerARating) / 400));
  const expectedScoreB = 1 - expectedScoreA;

  const playerANewRating = Math.round(playerARating + kFactor * (scoreA - expectedScoreA));
  const playerBNewRating = Math.round(playerBRating + kFactor * ((1 - scoreA) - expectedScoreB));

  return { playerANewRating, playerBNewRating };
}
