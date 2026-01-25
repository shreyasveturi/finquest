import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findHumanOpponent, getMatchmakingTimeout } from '@/lib/matchmaking';
import { getBotAnswer } from '@/lib/bot-logic';
import { trackEvent } from '@/lib/events';

/**
 * POST /api/matchmaking/join
 * User joins matchmaking queue
 * Returns: { matchId? | queueId }
 */
export async function POST(req: NextRequest) {
  try {
    // Human matchmaking disabled in bot-only mode
    return NextResponse.json({ error: 'Human matchmaking disabled. Use /api/matchmaking/create-bot.' }, { status: 410 });
  } catch (error) {
    console.error('Matchmaking error:', error);
    return NextResponse.json(
      { error: 'Matchmaking failed' },
      { status: 500 }
    );
  }
}
