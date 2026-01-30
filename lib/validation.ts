/**
 * Username validation utilities for Scio Identity Lite.
 */

import { containsProfanity, getProfanityError } from './profanity';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate a desired username according to Scio rules.
 * - Min length: 3
 * - Max length: 20
 * - Allowed chars: letters, numbers, spaces, underscore
 * - No profanity
 */
export function validateUsername(desiredName: string): ValidationResult {
  // Check empty
  if (!desiredName || desiredName.trim().length === 0) {
    return { valid: false, reason: 'Username cannot be empty' };
  }
  
  const trimmed = desiredName.trim();
  
  // Check length
  if (trimmed.length < USERNAME_MIN_LENGTH) {
    return { valid: false, reason: `Username must be at least ${USERNAME_MIN_LENGTH} characters` };
  }
  
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return { valid: false, reason: `Username must be at most ${USERNAME_MAX_LENGTH} characters` };
  }
  
  // Check allowed characters: letters, numbers, spaces, underscore
  const allowedPattern = /^[A-Za-z0-9 _]+$/;
  if (!allowedPattern.test(trimmed)) {
    return { valid: false, reason: 'Username can only contain letters, numbers, spaces, and underscores' };
  }
  
  // Check profanity
  if (containsProfanity(trimmed)) {
    return { valid: false, reason: getProfanityError() };
  }
  
  return { valid: true };
}

/**
 * Validate clientId format (should be a non-empty string, ideally UUID).
 */
export function validateClientId(clientId: string): ValidationResult {
  if (!clientId || typeof clientId !== 'string' || clientId.trim().length === 0) {
    return { valid: false, reason: 'Invalid clientId' };
  }
  
  return { valid: true };
}
