/**
 * POST /api/user/profile
 * 
 * Update user profile: cohort tag, anonymous status, public handle
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { containsProfanity } from '@/lib/profanity';

const COHORT_ALLOWLIST = ['UCL', 'LSE', 'KCL', 'Imperial', 'Oxford', 'Cambridge', 'Other'];

const UpdateProfileSchema = z.object({
  clientId: z.string().min(1),
  cohortTag: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  publicHandle: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { clientId, cohortTag, isAnonymous, publicHandle } = parsed.data;

    // Find user by clientId
    const user = await prisma.user.findUnique({
      where: { clientId },
      select: {
        id: true,
        cohortTag: true,
        isAnonymous: true,
        publicHandle: true,
        anonId: true,
        displayName: true,
        discriminator: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: {
      cohortTag?: string;
      isAnonymous?: boolean;
      publicHandle?: string | null;
      anonId?: string;
    } = {};

    // Validate and set cohortTag
    if (cohortTag !== undefined) {
      if (!COHORT_ALLOWLIST.includes(cohortTag)) {
        return NextResponse.json(
          {
            error: 'Invalid cohort tag',
            allowedValues: COHORT_ALLOWLIST,
          },
          { status: 400 }
        );
      }
      updateData.cohortTag = cohortTag;
    }

    // Handle isAnonymous toggle
    if (isAnonymous !== undefined) {
      if (isAnonymous) {
        // Set anonymous: clear public handle
        updateData.isAnonymous = true;
        updateData.publicHandle = null;
        
        // Generate anonId if missing
        if (!user.anonId) {
          updateData.anonId = `anon-${generateShortId()}`;
        }
      } else {
        // Set public: require publicHandle
        if (!publicHandle) {
          return NextResponse.json(
            { error: 'publicHandle is required when isAnonymous=false' },
            { status: 400 }
          );
        }

        // Validate publicHandle
        if (publicHandle.length < 3 || publicHandle.length > 20) {
          return NextResponse.json(
            { error: 'publicHandle must be 3-20 characters' },
            { status: 400 }
          );
        }

        if (!/^[A-Za-z0-9_]+$/.test(publicHandle)) {
          return NextResponse.json(
            { error: 'publicHandle can only contain letters, numbers, and underscores' },
            { status: 400 }
          );
        }

        if (containsProfanity(publicHandle)) {
          return NextResponse.json(
            { error: 'publicHandle contains inappropriate language' },
            { status: 400 }
          );
        }

        updateData.isAnonymous = false;
        updateData.publicHandle = publicHandle;
        
        // Generate anonId if missing (for consistency)
        if (!user.anonId) {
          updateData.anonId = `anon-${generateShortId()}`;
        }
      }
    } else if (publicHandle !== undefined && !user.isAnonymous) {
      // Update publicHandle independently if isAnonymous not changing
      if (publicHandle === null) {
        return NextResponse.json(
          { error: 'Cannot clear publicHandle while isAnonymous=false' },
          { status: 400 }
        );
      }

      // Same validation
      if (publicHandle.length < 3 || publicHandle.length > 20) {
        return NextResponse.json(
          { error: 'publicHandle must be 3-20 characters' },
          { status: 400 }
        );
      }

      if (!/^[A-Za-z0-9_]+$/.test(publicHandle)) {
        return NextResponse.json(
          { error: 'publicHandle can only contain letters, numbers, and underscores' },
          { status: 400 }
        );
      }

      if (containsProfanity(publicHandle)) {
        return NextResponse.json(
          { error: 'publicHandle contains inappropriate language' },
          { status: 400 }
        );
      }

      updateData.publicHandle = publicHandle;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        cohortTag: true,
        isAnonymous: true,
        publicHandle: true,
        anonId: true,
        displayName: true,
        discriminator: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * Generate a short random ID for anonId
 */
function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8);
}
