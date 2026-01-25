import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/matchmaking/status?queueId=XXX
 * Poll for match status
 * Returns: { matchId? | status: 'queued' | 'matched' }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queueId = searchParams.get('queueId');

    if (!queueId) {
      return NextResponse.json(
        { error: 'queueId required' },
        { status: 400 }
      );
    }

    // Check if match exists for this user
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { playerAId: queueId },
          { playerBId: queueId },
        ],
        status: 'in_progress',
      },
      include: {
        rounds: true,
      },
    });

    if (match) {
      return NextResponse.json({
        matchId: match.id,
        status: 'matched',
        isBotMatch: match.isBotMatch,
      });
    }

    // Still queued
    return NextResponse.json({
      status: 'queued',
      queueId,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}
