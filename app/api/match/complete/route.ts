import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEloUpdate, getTier } from '@/lib/elo';
import { assignFeedback, type RoundData } from '@/lib/feedback';
import { getFeedbackText, FeedbackTag } from '@/lib/feedbackMap';
import { getActiveSeason } from '@/lib/seasons';
import { computeUserLabel, computeUserStats } from '@/lib/labels';

const BOT_RATING = 1200;

function scoreForResult(result: string) {
  if (result === 'WIN') return 1;
  if (result === 'DRAW') return 0.5;
  if (result === 'LOSS') return 0;
  return null;
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const headers = new Headers({ 'x-request-id': requestId });

  try {
    const body = await req.json();
    const { clientId, matchId, resultA } = body || {};

    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'clientId required', requestId } },
        { status: 400, headers }
      );
    }

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'matchId required', requestId } },
        { status: 400, headers }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { rounds: true },
    });

    if (!match) {
      return NextResponse.json(
        { error: { code: 'MATCH_NOT_FOUND', message: 'Match not found', requestId } },
        { status: 404, headers }
      );
    }

    const user = await prisma.user.findUnique({ where: { clientId } });
    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId } },
        { status: 404, headers }
      );
    }

    if (match.playerAId !== user.id && match.playerBId !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not a player in this match', requestId } },
        { status: 403, headers }
      );
    }

    const matchRecord = match as any;

    // Idempotency: if already completed, return existing data
    if (matchRecord.status === 'COMPLETED') {
      return NextResponse.json(
        {
          ok: true,
          ratingBeforeA: matchRecord.ratingBeforeA,
          ratingAfterA: matchRecord.ratingAfterA,
          scoreA: matchRecord.scoreA,
          opponentScore: matchRecord.scoreB || (matchRecord.rounds?.length - matchRecord.scoreA),
          nearMiss: matchRecord.nearMiss,
          decidedByRoundIndex: matchRecord.decidedByRoundIndex,
          requestId,
        },
        { headers }
      );
    }

    // Determine resultA if not provided or UNKNOWN
    let resolvedResultA = resultA as string | undefined;
    const rounds = match.rounds;
    
    // Phase 3: Compute scoreA from Round logs (not MatchRound)
    const userRounds = await prisma.round.findMany({
      where: {
        matchId,
        userId: user.id,
      },
      orderBy: { roundIndex: 'asc' },
    });

    const scoreA = userRounds.filter((r) => r.correct).length;
    const totalRounds = userRounds.length;

    // Compute opponent score
    let opponentScore: number;
    if (match.isBotMatch) {
      // For bot matches, use MatchRound data
      const playerAScore = rounds.filter((r) => r.playerAAnswer === r.correctIndex).length;
      const playerBScore = rounds.filter((r) => r.playerBAnswer === r.correctIndex).length;
      opponentScore = playerBScore;
    } else if (match.playerBId) {
      // For human matches, query playerB rounds
      const playerBRounds = await prisma.round.findMany({
        where: {
          matchId,
          userId: match.playerBId,
        },
      });
      opponentScore = playerBRounds.filter((r) => r.correct).length;
    } else {
      opponentScore = 0;
    }

    // Determine result
    if (!resolvedResultA || resolvedResultA === 'UNKNOWN') {
      if (scoreA > opponentScore) resolvedResultA = 'WIN';
      else if (scoreA < opponentScore) resolvedResultA = 'LOSS';
      else resolvedResultA = 'DRAW';
    }

    // Phase 3: Near-miss detection
    const isLoss = resolvedResultA === 'LOSS';
    const nearMiss = isLoss && Math.abs(opponentScore - scoreA) === 1;

    // Phase 3: Find deciding mistake (swing round)
    let decidedByRoundIndex: number | null = null;
    if (nearMiss) {
      // Find earliest incorrect round that would change outcome if flipped
      const incorrectRounds = userRounds.filter((r) => !r.correct);
      
      for (const round of incorrectRounds) {
        // If this round was correct, scoreA would be +1
        const hypotheticalScore = scoreA + 1;
        
        // Would this change the outcome?
        if (hypotheticalScore >= opponentScore) {
          // Yes! This is the deciding mistake
          decidedByRoundIndex = round.roundIndex;
          break;
        }
      }
    }

    const scoreForElo = scoreForResult(resolvedResultA);
    if (scoreForElo === null) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid resultA', requestId } },
        { status: 400, headers }
      );
    }

    const playerA = await prisma.user.findUnique({ where: { id: match.playerAId } });
    if (!playerA) {
      return NextResponse.json(
        { error: { code: 'PLAYER_NOT_FOUND', message: 'PlayerA not found', requestId } },
        { status: 500, headers }
      );
    }

    const playerBRating = match.isBotMatch ? BOT_RATING : (match.playerBId ? (await prisma.user.findUnique({ where: { id: match.playerBId } }))?.rating ?? BOT_RATING : BOT_RATING);

    const { playerANewRating, playerBNewRating } = calculateEloUpdate(
      playerA.rating,
      playerBRating,
      scoreForElo
    );

    // Phase 3: Get active season for leaderboard update
    const activeSeason = await getActiveSeason();

    await prisma.$transaction(async (tx) => {
      // Clear any previous deciding mistake marks for this match
      if (decidedByRoundIndex !== null) {
        await tx.round.updateMany({
          where: {
            matchId,
            userId: user.id,
            wasDecidingMistake: true,
          },
          data: { wasDecidingMistake: false },
        });

        // Mark the deciding mistake
        await tx.round.updateMany({
          where: {
            matchId,
            userId: user.id,
            roundIndex: decidedByRoundIndex,
          },
          data: { wasDecidingMistake: true },
        });
      }

      await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
          resultA: resolvedResultA as any,
          ratingBeforeA: matchRecord.ratingBeforeA ?? playerA.rating,
          ratingAfterA: playerANewRating,
          ratingBeforeB: match.isBotMatch ? BOT_RATING : playerBRating,
          ratingAfterB: match.isBotMatch ? playerBNewRating : playerBNewRating,
          scoreA,
          scoreB: opponentScore,
          nearMiss,
          decidedByRoundIndex,
        } as any,
      });

      await tx.user.update({
        where: { id: playerA.id },
        data: { rating: playerANewRating, tier: getTier(playerANewRating) },
      });

      if (!match.isBotMatch && match.playerBId) {
        await tx.user.update({
          where: { id: match.playerBId },
          data: { rating: playerBNewRating, tier: getTier(playerBNewRating) },
        });
      }

      // Phase 3: Update LeaderboardSnapshot
      const matchAccuracy = totalRounds > 0 ? scoreA / totalRounds : 0;
      
      // Compute match efficiency (average of efficiencyScore if available)
      const efficiencyScores = userRounds
        .map((r) => r.efficiencyScore)
        .filter((s): s is number => s !== null && s !== undefined);
      const matchEfficiency = efficiencyScores.length > 0
        ? efficiencyScores.reduce((a, b) => a + b, 0) / efficiencyScores.length
        : 0;

      // Upsert leaderboard snapshot
      const existingSnapshot = await tx.leaderboardSnapshot.findUnique({
        where: {
          seasonId_userId: {
            seasonId: activeSeason.id,
            userId: user.id,
          },
        },
      });

      if (existingSnapshot) {
        const newMatches = existingSnapshot.matches + 1;
        const newWins = resolvedResultA === 'WIN' ? existingSnapshot.wins + 1 : existingSnapshot.wins;
        const newLosses = resolvedResultA === 'LOSS' ? existingSnapshot.losses + 1 : existingSnapshot.losses;
        
        const newAccuracy = (existingSnapshot.accuracy * existingSnapshot.matches + matchAccuracy) / newMatches;
        const newEfficiency = (existingSnapshot.efficiency * existingSnapshot.matches + matchEfficiency) / newMatches;

        await tx.leaderboardSnapshot.update({
          where: { id: existingSnapshot.id },
          data: {
            matches: newMatches,
            wins: newWins,
            losses: newLosses,
            accuracy: newAccuracy,
            efficiency: newEfficiency,
            rating: playerANewRating,
          },
        });
      } else {
        await tx.leaderboardSnapshot.create({
          data: {
            seasonId: activeSeason.id,
            userId: user.id,
            matches: 1,
            wins: resolvedResultA === 'WIN' ? 1 : 0,
            losses: resolvedResultA === 'LOSS' ? 1 : 0,
            accuracy: matchAccuracy,
            efficiency: matchEfficiency,
            rating: playerANewRating,
          },
        });
      }
    });

    // Generate feedback for all incorrect rounds (Phase 1)
    // This is idempotent: only updates rounds that don't already have feedback
    const roundDurationMs = 25000; // Standard round duration
    
    const roundsWithoutFeedback = await prisma.round.findMany({
      where: {
        matchId,
        correct: false,
        feedbackTag: { equals: null },
      },
      orderBy: { roundIndex: 'asc' },
    });

    // Assign feedback to each incorrect round
    for (const round of roundsWithoutFeedback) {
      const roundData: RoundData = {
        correct: round.correct,
        responseTimeMs: round.responseTimeMs,
        timeExpired: round.timeExpired,
        roundDurationMs,
        timeToFirstCommitMs: round.timeToFirstCommitMs,
      };

      const feedbackTag = assignFeedback(roundData);
      
      if (feedbackTag) {
        const feedbackText = getFeedbackText(feedbackTag as FeedbackTag);
        await prisma.round.update({
          where: { id: round.id },
          data: {
            feedbackTag,
            feedbackText,
          },
        });
      }
    }

    // Phase 3: Compute user label from recent matches
    let userLabel: { label: string; blurb: string } | null = null;
    try {
      const recentMatches = await prisma.match.findMany({
        where: {
          playerAId: user.id,
          status: 'COMPLETED',
        },
        orderBy: { endedAt: 'desc' },
        take: 10,
      });

      // Transform to stats format
      const matchStats = recentMatches.map((m) => {
        const totalRounds = 10; // Standard match length
        const matchAccuracy = m.scoreA !== null ? m.scoreA / totalRounds : 0;
        // Efficiency not yet tracked at match level, use placeholder
        const matchEfficiency = 0.5;
        
        return {
          accuracy: matchAccuracy,
          efficiency: matchEfficiency,
          isNearMiss: m.nearMiss,
          result: m.resultA as 'WIN' | 'LOSS' | 'DRAW',
        };
      });

      const stats = computeUserStats(matchStats);
      userLabel = computeUserLabel(stats);
    } catch (labelError) {
      console.error(`[match-complete ${requestId}] Failed to compute label:`, labelError);
      // Non-critical: proceed without label
    }

    return NextResponse.json(
      {
        ok: true,
        ratingBeforeA: matchRecord.ratingBeforeA ?? playerA.rating,
        ratingAfterA: playerANewRating,
        scoreA,
        opponentScore,
        nearMiss,
        decidedByRoundIndex,
        label: userLabel,
        requestId,
      },
      { headers }
    );
  } catch (error) {
    console.error(`[match-complete ${requestId}] Error`, error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to complete match', requestId } },
      { status: 500, headers }
    );
  }
}
