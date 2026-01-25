import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/matchmaking/status
 * Disabled in bot-only mode.
 */
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Human matchmaking status disabled. Bot-only mode.' },
      { status: 410 }
    );
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}
