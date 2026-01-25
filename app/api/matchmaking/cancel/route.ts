import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/events';

/**
 * POST /api/matchmaking/cancel
 * Leave the matchmaking queue
 */
export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 });
    }

    // Track event
    await trackEvent('user_left_queue', undefined, clientId);

    return NextResponse.json({
      status: 'cancelled',
    });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json(
      { error: 'Cancel failed' },
      { status: 500 }
    );
  }
}
