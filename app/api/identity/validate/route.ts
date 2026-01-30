/**
 * POST /api/identity/validate
 * Validates a desired username without creating/updating user.
 * Useful for instant client-side feedback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateUsername } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { desiredName } = body;
    
    if (!desiredName || typeof desiredName !== 'string') {
      return NextResponse.json(
        { ok: false, reason: 'desiredName is required' },
        { status: 400 }
      );
    }
    
    const validation = validateUsername(desiredName);
    
    if (!validation.valid) {
      return NextResponse.json({
        ok: false,
        reason: validation.reason,
      });
    }
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('[identity/validate] Error:', error);
    return NextResponse.json(
      { ok: false, reason: 'Server error' },
      { status: 500 }
    );
  }
}
