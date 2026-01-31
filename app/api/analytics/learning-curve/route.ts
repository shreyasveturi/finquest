/**
 * GET /api/analytics/learning-curve
 * 
 * Returns learning curve data for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserLearningCurve } from '@/lib/analytics-learning';

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

    const learningCurve = await getUserLearningCurve(userId, limit);

    return NextResponse.json(learningCurve);
  } catch (error: any) {
    console.error('Error fetching learning curve:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compute learning curve' },
      { status: 500 }
    );
  }
}
