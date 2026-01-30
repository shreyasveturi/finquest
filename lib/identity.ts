/**
 * Client-side identity utilities for Scio Identity Lite.
 * Note: canonicalizeUsername and formatUserTag can be used server-side too.
 */

/**
 * Get or create a unique clientId stored in localStorage.
 * This is the stable anonymous identifier for the user.
 */
export function getOrCreateClientId(): string {
  if (typeof window === 'undefined') {
    throw new Error('getOrCreateClientId must be called in browser context');
  }

  let clientId = localStorage.getItem('scio_client_id');
  
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem('scio_client_id', clientId);
  }
  
  return clientId;
}

/**
 * Get the stored username from localStorage, if any.
 */
export function getStoredUsername(): string | null {
  if (typeof window === 'undefined') {
    throw new Error('getStoredUsername must be called in browser context');
  }
  
  return localStorage.getItem('scio_username');
}

/**
 * Store username in localStorage.
 */
export function setStoredUsername(username: string): void {
  if (typeof window === 'undefined') {
    throw new Error('setStoredUsername must be called in browser context');
  }
  
  localStorage.setItem('scio_username', username);
}

/**
 * Canonicalize a username for uniqueness checks.
 * - Trims whitespace
 * - Collapses internal whitespace to single spaces
 * - Converts to lowercase
 * 
 * This is used server-side to determine uniqueness while preserving
 * the user's chosen displayName for UI.
 */
export function canonicalizeUsername(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // collapse multiple spaces to single space
    .toLowerCase();
}

/**
 * Get the stored discriminator from localStorage (optional, for caching).
 */
export function getStoredDiscriminator(): number | null {
  if (typeof window === 'undefined') {
    throw new Error('getStoredDiscriminator must be called in browser context');
  }
  
  const disc = localStorage.getItem('scio_discriminator');
  return disc ? parseInt(disc, 10) : null;
}

/**
 * Store discriminator in localStorage.
 */
export function setStoredDiscriminator(discriminator: number): void {
  if (typeof window === 'undefined') {
    throw new Error('setStoredDiscriminator must be called in browser context');
  }
  
  localStorage.setItem('scio_discriminator', discriminator.toString());
}

/**
 * Format a user tag for display (DisplayName#1234).
 */
export function formatUserTag(displayName: string, discriminator: number): string {
  const disc = discriminator.toString().padStart(4, '0');
  return `${displayName}#${disc}`;
}
