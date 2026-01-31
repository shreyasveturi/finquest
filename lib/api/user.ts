/**
 * Client-side API helpers for user operations
 */

export interface UpdateProfilePayload {
  clientId: string;
  cohortTag?: string;
  isAnonymous?: boolean;
  publicHandle?: string | null;
}

export interface UpdateProfileResponse {
  ok: boolean;
  user?: {
    cohortTag: string | null;
    isAnonymous: boolean;
    publicHandle: string | null;
    anonId: string | null;
    displayName: string;
    discriminator: number;
  };
  error?: string;
  allowedValues?: string[];
}

/**
 * Update user profile (cohort, anonymity, public handle)
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
  const response = await fetch('/api/user/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      error: data.error || 'Failed to update profile',
      allowedValues: data.allowedValues,
    };
  }

  return data;
}
