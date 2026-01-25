import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/events';

export async function POST(req: NextRequest) {
  try {
    const { name, properties, clientId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    await trackEvent(name, properties, clientId || null);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
