import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatTag(displayName: string, discriminator: number) {
  const disc = discriminator.toString().padStart(4, '0');
  return `${displayName}#${disc}`;
}

function parseDateParam(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const from = parseDateParam(searchParams.get('from'));
  const to = parseDateParam(searchParams.get('to'));

  if (!process.env.ADMIN_EXPORT_TOKEN || token !== process.env.ADMIN_EXPORT_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (type !== 'rounds' && type !== 'matches') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  if (type === 'rounds') {
    const rounds = await (prisma as any).round.findMany({
      where: {
        createdAt: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      },
      include: {
        user: { select: { displayName: true, discriminator: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const header = [
      'userTag',
      'matchId',
      'roundIndex',
      'correct',
      'selectedOption',
      'timeExpired',
      'responseTimeMs',
      'timeToFirstCommitMs',
      'createdAt',
    ].join(',');

    const rows = rounds.map((r: {
      matchId: string;
      roundIndex: number;
      correct: boolean;
      selectedOption: string | null;
      timeExpired: boolean;
      responseTimeMs: number;
      timeToFirstCommitMs: number | null;
      createdAt: Date;
      user: { displayName: string; discriminator: number };
    }) => {
      const tag = formatTag(r.user.displayName, r.user.discriminator);
      return [
        tag,
        r.matchId,
        r.roundIndex,
        r.correct,
        r.selectedOption ?? '',
        r.timeExpired,
        r.responseTimeMs,
        r.timeToFirstCommitMs ?? '',
        r.createdAt.toISOString(),
      ]
        .map((cell) => String(cell).replace(/\n/g, ' ').replace(/,/g, ';'))
        .join(',');
    });

    const csv = [header, ...rows].join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
      },
    });
  }

  const matches = (await prisma.match.findMany({
    where: {
      createdAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    },
    include: {
      playerA: { select: { displayName: true, discriminator: true } },
    },
    orderBy: { createdAt: 'asc' },
  })) as any[];

  const header = [
    'userTag',
    'matchId',
    'opponentType',
    'ratingBeforeA',
    'ratingAfterA',
    'resultA',
    'startedAt',
    'endedAt',
    'status',
  ].join(',');

  const rows = matches.map((m: {
    id: string;
    opponentType: string;
    ratingBeforeA: number;
    ratingAfterA: number | null;
    resultA: string;
    startedAt: Date | null;
    endedAt: Date | null;
    status: string;
    playerA: { displayName: string; discriminator: number };
  }) => {
    const tag = formatTag(m.playerA.displayName, m.playerA.discriminator);
    return [
      tag,
      m.id,
      m.opponentType,
      m.ratingBeforeA,
      m.ratingAfterA ?? '',
      m.resultA,
      m.startedAt ? m.startedAt.toISOString() : '',
      m.endedAt ? m.endedAt.toISOString() : '',
      m.status,
    ]
      .map((cell) => String(cell).replace(/\n/g, ' ').replace(/,/g, ';'))
      .join(',');
  });

  const csv = [header, ...rows].join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
