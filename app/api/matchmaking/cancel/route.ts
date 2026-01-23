import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { trackEvent } from '@/lib/events';

/**
 * POST /api/matchmaking/cancel
 * Leave the matchmaking queue
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Track event
    await trackEvent(userId, 'user_left_queue');

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
