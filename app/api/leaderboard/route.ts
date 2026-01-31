/**
 * GET /api/leaderboard
 * 
 * Season-aware leaderboard with optional cohort filtering
 * Public route (no authentication required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveSeason } from '@/lib/seasons';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query params
    const seasonParam = searchParams.get('season') || 'active';
    const seasonIdParam = searchParams.get('seasonId');
    const cohortTag = searchParams.get('cohortTag');
    const limitParam = searchParams.get('limit');
    
    // Parse and validate limit
    const limit = limitParam 
      ? Math.min(Math.max(parseInt(limitParam, 10), 1), 200)
      : 50;

    if (isNaN(limit)) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' },
        { status: 400 }
      );
    }

    // Resolve season
    let season;
    if (seasonIdParam) {
      // Fetch specific season by ID
      season = await prisma.season.findUnique({
        where: { id: seasonIdParam },
        select: {
          id: true,
          name: true,
          startsAt: true,
          endsAt: true,
          isActive: true,
        },
      });

      if (!season) {
        return NextResponse.json(
          { error: 'Season not found' },
          { status: 404 }
        );
      }
    } else {
      // Get active season (season=active or default)
      season = await getActiveSeason();
    }

    // Build where clause for LeaderboardSnapshot query
    const whereClause: any = {
      seasonId: season.id,
    };

    // Optional cohort filter
    if (cohortTag) {
      whereClause.user = {
        cohortTag: cohortTag,
      };
    }

    // Query leaderboard snapshots
    const snapshots = await prisma.leaderboardSnapshot.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            discriminator: true,
            isAnonymous: true,
            publicHandle: true,
            anonId: true,
            cohortTag: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { efficiency: 'desc' },
      ],
      take: limit,
    });

    // Format entries with display names and ranks
    const entries = snapshots.map((snapshot, index) => {
      const { user } = snapshot;
      
      // Determine display name based on anonymity settings
      let displayName: string;
      if (user.isAnonymous) {
        displayName = user.anonId || 'Anonymous';
      } else if (user.publicHandle) {
        displayName = user.publicHandle;
      } else {
        const discriminator = user.discriminator.toString().padStart(4, '0');
        displayName = `${user.displayName}#${discriminator}`;
      }

      return {
        rank: index + 1,
        userId: user.id,
        name: displayName,
        cohortTag: user.cohortTag,
        rating: snapshot.rating,
        matches: snapshot.matches,
        wins: snapshot.wins,
        losses: snapshot.losses,
        accuracy: snapshot.accuracy,
        efficiency: snapshot.efficiency,
      };
    });

    return NextResponse.json({
      ok: true,
      season: {
        id: season.id,
        name: season.name,
        startsAt: season.startsAt,
        endsAt: season.endsAt,
        isActive: season.isActive,
      },
      entries,
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
