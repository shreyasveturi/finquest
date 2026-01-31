/**
 * GET /api/analytics/consistency
 * 
 * Returns Reasoning Consistency Score for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserReasoningConsistencyScore } from '@/lib/analytics-learning';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : 20;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const consistencyScore = await getUserReasoningConsistencyScore(userId, limit);

    return NextResponse.json(consistencyScore);
  } catch (error: any) {
    console.error('Error computing consistency score:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compute consistency score' },
      { status: 500 }
    );
  }
}
