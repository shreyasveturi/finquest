/**
 * POST /api/identity/upsert
 * 
 * Creates or updates a user based on clientId.
 * Handles username changes with cooldown enforcement.
 * Assigns discriminators to avoid name collisions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateClientId, validateUsername } from '@/lib/validation';
import { canonicalizeUsername } from '@/lib/identity';

const NAME_CHANGE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_DISCRIMINATOR = 9999;

interface UpsertResponse {
  ok: boolean;
  user?: {
    id: string;
    clientId: string;
    displayName: string;
    canonicalName: string;
    discriminator: number;
    tag: string;
  };
  cooldownEndsAt?: string;
  reason?: string;
}

/**
 * Find an available discriminator for a canonical name.
 * Strategy: Find all used discriminators, pick a random free one.
 * Fallback to first free discriminator if random fails.
 */
async function findAvailableDiscriminator(
  canonicalName: string,
  excludeUserId?: string
): Promise<number> {
  // Get all users with this canonical name
  const existingUsers = await prisma.user.findMany({
    where: {
      canonicalName,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { discriminator: true },
  });
  
  const usedDiscriminators = new Set(existingUsers.map((u: { discriminator: number }) => u.discriminator));
  
  // If no discriminators are used, return 0
  if (usedDiscriminators.size === 0) {
    return 0;
  }
  
  // If all discriminators are taken (0-9999 = 10,000 total)
  if (usedDiscriminators.size >= MAX_DISCRIMINATOR + 1) {
    throw new Error('All discriminators for this name are taken');
  }
  
  // Pick a random free discriminator
  // Try up to 20 times to find a random free one, then fallback to sequential
  for (let attempt = 0; attempt < 20; attempt++) {
    const random = Math.floor(Math.random() * (MAX_DISCRIMINATOR + 1));
    if (!usedDiscriminators.has(random)) {
      return random;
    }
  }
  
  // Fallback: find first free discriminator sequentially
  for (let i = 0; i <= MAX_DISCRIMINATOR; i++) {
    if (!usedDiscriminators.has(i)) {
      return i;
    }
  }
  
  throw new Error('Failed to find available discriminator');
}

/**
 * Format user tag for display.
 */
function formatUserTag(displayName: string, discriminator: number): string {
  const disc = discriminator.toString().padStart(4, '0');
  return `${displayName}#${disc}`;
}

export async function POST(req: NextRequest): Promise<NextResponse<UpsertResponse>> {
  try {
    const body = await req.json();
    const { clientId, desiredName } = body;
    
    // Validate clientId
    const clientIdValidation = validateClientId(clientId);
    if (!clientIdValidation.valid) {
      return NextResponse.json(
        { ok: false, reason: clientIdValidation.reason },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { clientId },
    });
    
    // CASE 1: User exists
    if (existingUser) {
      // If no desiredName provided, just return current user
      if (!desiredName) {
        return NextResponse.json({
          ok: true,
          user: {
            id: existingUser.id,
            clientId: existingUser.clientId,
            displayName: existingUser.displayName,
            canonicalName: existingUser.canonicalName,
            discriminator: existingUser.discriminator,
            tag: formatUserTag(existingUser.displayName, existingUser.discriminator),
          },
        });
      }
      
      // User wants to change name
      const trimmedName = desiredName.trim();
      
      // Check if name is actually different
      if (trimmedName === existingUser.displayName) {
        // No change needed
        return NextResponse.json({
          ok: true,
          user: {
            id: existingUser.id,
            clientId: existingUser.clientId,
            displayName: existingUser.displayName,
            canonicalName: existingUser.canonicalName,
            discriminator: existingUser.discriminator,
            tag: formatUserTag(existingUser.displayName, existingUser.discriminator),
          },
        });
      }
      
      // Validate cooldown
      if (existingUser.lastNameChangeAt) {
        const timeSinceLastChange = Date.now() - existingUser.lastNameChangeAt.getTime();
        if (timeSinceLastChange < NAME_CHANGE_COOLDOWN_MS) {
          const cooldownEndsAt = new Date(
            existingUser.lastNameChangeAt.getTime() + NAME_CHANGE_COOLDOWN_MS
          ).toISOString();
          
          return NextResponse.json({
            ok: false,
            reason: 'Name change cooldown active. You can change your name once every 24 hours.',
            cooldownEndsAt,
          });
        }
      }
      
      // Validate new name
      const nameValidation = validateUsername(desiredName);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { ok: false, reason: nameValidation.reason },
          { status: 400 }
        );
      }
      
      // Canonicalize new name
      const newCanonicalName = canonicalizeUsername(trimmedName);
      
      // Determine discriminator
      let newDiscriminator: number;
      
      // If canonical name is the same (only casing/whitespace changed), keep discriminator
      if (newCanonicalName === existingUser.canonicalName) {
        newDiscriminator = existingUser.discriminator;
      } else {
        // Need to find new discriminator for new canonical name
        newDiscriminator = await findAvailableDiscriminator(newCanonicalName, existingUser.id);
      }
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          displayName: trimmedName,
          canonicalName: newCanonicalName,
          discriminator: newDiscriminator,
          lastNameChangeAt: new Date(),
        },
      });
      
      return NextResponse.json({
        ok: true,
        user: {
          id: updatedUser.id,
          clientId: updatedUser.clientId,
          displayName: updatedUser.displayName,
          canonicalName: updatedUser.canonicalName,
          discriminator: updatedUser.discriminator,
          tag: formatUserTag(updatedUser.displayName, updatedUser.discriminator),
        },
      });
    }
    
    // CASE 2: New user
    let displayName: string;
    let canonicalName: string;
    
    if (!desiredName) {
      // No name provided, use default "Player"
      displayName = 'Player';
      canonicalName = 'player';
    } else {
      // Validate provided name
      const nameValidation = validateUsername(desiredName);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { ok: false, reason: nameValidation.reason },
          { status: 400 }
        );
      }
      
      displayName = desiredName.trim();
      canonicalName = canonicalizeUsername(displayName);
    }
    
    // Find available discriminator
    const discriminator = await findAvailableDiscriminator(canonicalName);
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        clientId,
        displayName,
        canonicalName,
        discriminator,
        lastNameChangeAt: null, // First name doesn't count as a "change"
        banned: false,
      },
    });
    
    return NextResponse.json({
      ok: true,
      user: {
        id: newUser.id,
        clientId: newUser.clientId,
        displayName: newUser.displayName,
        canonicalName: newUser.canonicalName,
        discriminator: newUser.discriminator,
        tag: formatUserTag(newUser.displayName, newUser.discriminator),
      },
    });
    
  } catch (error) {
    console.error('[identity/upsert] Error:', error);
    
    // Check for specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { ok: false, reason: 'This username combination is already taken. Please try again.' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { ok: false, reason: 'Server error occurred' },
      { status: 500 }
    );
  }
}
