/**
 * Simple profanity filter for username validation.
 * Built-in list, no external API.
 */

const PROFANITY_LIST = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'damn',
  'crap',
  'piss',
  'dick',
  'cock',
  'pussy',
  'asshole',
  'bastard',
  'slut',
  'whore',
  'fag',
  'nigger',
  'nigga',
  'retard',
  'rape',
  'nazi',
  'hitler',
  'porn',
  'xxx',
  'sex',
  // Add more as needed
];

/**
 * Check if a username contains profanity.
 * Uses simple substring matching on lowercased text.
 */
export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  
  return PROFANITY_LIST.some(word => {
    // Check for whole word or as part of a word
    return lower.includes(word);
  });
}

/**
 * Get a sanitized error message when profanity is detected.
 */
export function getProfanityError(): string {
  return 'Username contains inappropriate language. Please choose a different name.';
}
