import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/matchmaking/cancel
 * Disabled in bot-only mode.
 */
export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ error: 'Human matchmaking cancel disabled. Bot-only mode.' }, { status: 410 });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json(
      { error: 'Cancel failed' },
      { status: 500 }
    );
  }
}
