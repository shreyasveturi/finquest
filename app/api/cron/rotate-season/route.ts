import { NextRequest, NextResponse } from 'next/server';
import { rotateSeason } from '@/lib/seasons';

/**
 * Cron endpoint for weekly season rotation
 * Scheduled: Every Monday at 00:00 UTC
 * Vercel Cron: Configured in vercel.json
 */
export async function GET(req: NextRequest) {
  const headers = { 'Content-Type': 'application/json' };

  try {
    // Verify cron secret from Vercel
    const authHeader = req.headers.get('Authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      console.error('[cron/rotate-season] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500, headers }
      );
    }

    if (authHeader !== `Bearer ${expectedSecret}`) {
      console.error('[cron/rotate-season] Unauthorized attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers }
      );
    }

    // Rotate season: end active ones, create new one
    const newSeason = await rotateSeason();

    console.log('[cron/rotate-season] Season rotated:', newSeason);

    return NextResponse.json(
      {
        ok: true,
        message: 'Season rotated successfully',
        newSeason: {
          id: newSeason.id,
          name: newSeason.name,
          startsAt: newSeason.startsAt,
          endsAt: newSeason.endsAt,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error('[cron/rotate-season] Error:', error);
    return NextResponse.json(
      { error: 'Failed to rotate season' },
      { status: 500, headers }
    );
  }
}
