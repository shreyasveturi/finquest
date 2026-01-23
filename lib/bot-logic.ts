/**
 * Deterministic bot answers based on question ID and difficulty
 * - Easy: 70-85% correct
 * - Medium: 55-70% correct
 * - Hard: 40-55% correct
 */

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getBotAnswer(questionId: string, difficulty: string): number {
  // Convert questionId to numeric seed
  const seed = questionId.charCodeAt(0) * 31 + questionId.length;
  const rand = seededRandom(seed);

  let correctProbability = 0.75; // default
  if (difficulty === 'easy') {
    correctProbability = 0.7 + rand * 0.15; // 70-85%
  } else if (difficulty === 'medium') {
    correctProbability = 0.55 + rand * 0.15; // 55-70%
  } else if (difficulty === 'hard') {
    correctProbability = 0.4 + rand * 0.15; // 40-55%
  }

  // Return 0 (correct) or 1 (incorrect)
  return rand < correctProbability ? 0 : 1;
}
