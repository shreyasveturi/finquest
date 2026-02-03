'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { apiFetch } from '@/lib/apiFetch';
import { formatAccuracy, formatResponseTime, formatEfficiency } from '@/lib/metrics';
import { getOrCreateClientId } from '@/lib/identity';

interface RoundSummary {
  roundIndex: number;
  correct: boolean;
  responseTimeMs: number;
  timeExpired: boolean;
  selectedOption: string | null;
  timeToFirstCommitMs: number | null;
  questionPrompt: string;
  correctIndex: number;
  feedbackTag?: string | null;
  feedbackText?: string | null;
  wasDecidingMistake?: boolean; // Phase 3
}

interface MatchMetrics {
  accuracy: number;
  avgResponseTimeMs: number;
  avgTimeRemainingRatio: number;
  matchEfficiencyScore: number;
  label: 'Fast but inaccurate' | 'Accurate but slow' | 'Balanced';
  explanation: string;
}

interface MatchSummary {
  matchId: string;
  isBotMatch: boolean;
  status: string;
  playerAScore: number;
  playerBScore: number;
  winner: 'playerA' | 'playerB' | 'draw';
  totalRounds: number;
  roundDurationMs: number;
  rounds: RoundSummary[];
  metrics: MatchMetrics;
  ratingBefore: number;
  ratingAfter: number;
  // Phase 3 fields
  nearMiss?: boolean;
  scoreA: number;
  scoreB?: number;
  decidedByRoundIndex?: number | null;
  opponentType?: 'bot' | 'human';
  userLabel?: {
    label: string;
    blurb: string;
    color: string;
  } | null;
}

export default function MatchResultsPage() {
  const params = useParams();
  const rawMatchId = params?.matchId;
  const matchId = Array.isArray(rawMatchId) ? rawMatchId[0] : rawMatchId;
  const router = useRouter();
  const [summary, setSummary] = useState<MatchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingAgain, setIsPlayingAgain] = useState(false);

  useEffect(() => {
    if (!matchId) {
      router.replace('/play');
      return;
    }

    const fetchSummary = async () => {
      try {
        const { data } = await apiFetch<MatchSummary>(`/api/match/${matchId}/summary`);
        setSummary(data);
      } catch (err) {
        console.error('Failed to fetch match summary:', err);
        setError('Failed to load match results');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [matchId, router]);

  const handlePlayAgain = async () => {
    setIsPlayingAgain(true);
    try {
      const clientId = getOrCreateClientId();
      const username = localStorage.getItem('scio_username') || 'Player';

      const { data } = await apiFetch<{ matchId: string }>(
        '/api/bot-match/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, username }),
        }
      );

      router.replace(`/match/${data.matchId}`);
    } catch (error) {
      console.error('Failed to start new match:', error);
      alert('Failed to start new match. Please try again.');
      setIsPlayingAgain(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading results...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-semibold">{error || 'Failed to load results'}</p>
          <Button onClick={() => router.push('/play')}>Back to Play</Button>
        </div>
      </div>
    );
  }

  const userWon = summary.winner === 'playerA';
  const isDraw = summary.winner === 'draw';
  const ratingChange = summary.ratingAfter - summary.ratingBefore;

  // Phase 3: Find deciding mistake
  const decidingMistake = summary.decidedByRoundIndex !== null && summary.decidedByRoundIndex !== undefined
    ? summary.rounds.find(r => r.roundIndex === summary.decidedByRoundIndex)
    : null;

  const decidingFeedback = decidingMistake?.feedbackText || 'You missed a key constraint under time pressure.';

  // Label color mapping
  const labelColors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-300 text-blue-900',
    purple: 'bg-purple-50 border-purple-300 text-purple-900',
    green: 'bg-green-50 border-green-300 text-green-900',
    gray: 'bg-gray-50 border-gray-300 text-gray-900',
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header: Win/Loss/Draw */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className={`text-4xl font-bold mb-3 ${
            userWon ? 'text-green-600' : isDraw ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {userWon ? '🎉 Victory!' : isDraw ? '⚖️ Draw!' : '😔 Defeat'}
          </div>
          
          <div className="flex justify-center items-center gap-6 text-xl font-semibold mb-3">
            <div>
              <p className="text-xs text-neutral-500 mb-1">You</p>
              <p className="text-neutral-900">{summary.playerAScore}</p>
            </div>
            <div className="text-neutral-400">—</div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">{summary.isBotMatch ? 'Bot' : 'Opponent'}</p>
              <p className="text-neutral-900">{summary.playerBScore}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-base">
            <span className="text-neutral-600">Rating:</span>
            <span className="font-bold text-blue-600">{summary.ratingBefore}</span>
            <span className={`font-semibold ${
              ratingChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {ratingChange >= 0 ? '+' : ''}{ratingChange}
            </span>
            <span className="text-neutral-400">→</span>
            <span className="font-bold text-blue-600">{summary.ratingAfter}</span>
          </div>
        </div>

        {/* Performance Metrics Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-neutral-900">📊 Match Performance</h2>
          
          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Accuracy */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {formatAccuracy(summary.metrics.accuracy)}
              </div>
              <p className="text-xs font-semibold text-blue-700 mt-2">Accuracy</p>
              <p className="text-xs text-blue-600 mt-1">{summary.playerAScore}/{summary.totalRounds} correct</p>
            </div>
            
            {/* Average Response Time */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {formatResponseTime(summary.metrics.avgResponseTimeMs)}
              </div>
              <p className="text-xs font-semibold text-purple-700 mt-2">Avg Time</p>
              <p className="text-xs text-purple-600 mt-1">per question</p>
            </div>
            
            {/* Efficiency */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {formatEfficiency(summary.metrics.matchEfficiencyScore)}
              </div>
              <p className="text-xs font-semibold text-green-700 mt-2">Efficiency</p>
              <p className="text-xs text-green-600 mt-1">overall score</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-200"></div>

          {/* Performance Label - Full Width with Color Coding */}
          <div className={`rounded-lg p-4 border-2 ${
            summary.metrics.label === 'Accurate but slow' 
              ? 'bg-blue-50 border-blue-300' 
              : summary.metrics.label === 'Fast but inaccurate'
              ? 'bg-orange-50 border-orange-300'
              : 'bg-green-50 border-green-300'
          }`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {summary.metrics.label === 'Accurate but slow' 
                  ? '⏱️'
                  : summary.metrics.label === 'Fast but inaccurate'
                  ? '⚡'
                  : '⚖️'}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-sm ${
                  summary.metrics.label === 'Accurate but slow' 
                    ? 'text-blue-900' 
                    : summary.metrics.label === 'Fast but inaccurate'
                    ? 'text-orange-900'
                    : 'text-green-900'
                }`}>
                  {summary.metrics.label}
                </h3>
                <p className={`text-sm mt-1 ${
                  summary.metrics.label === 'Accurate but slow' 
                    ? 'text-blue-800' 
                    : summary.metrics.label === 'Fast but inaccurate'
                    ? 'text-orange-800'
                    : 'text-green-800'
                }`}>
                  {summary.metrics.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Additional Metrics</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-700">Time Remaining Ratio</span>
                <span className="text-sm font-semibold text-neutral-900">{formatEfficiency(summary.metrics.avgTimeRemainingRatio)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3: Near-Miss Banner */}
        {summary.nearMiss && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4 text-center shadow-md">
            <p className="font-bold text-lg">Lost by 1 question. Run it back.</p>
          </div>
        )}

        {/* Phase 3: Identity Label Card */}
        {summary.userLabel && (
          <div className={`rounded-lg p-4 border-2 ${
            labelColors[summary.userLabel.color] || labelColors.gray
          }`}>
            <h3 className="font-bold text-lg mb-1">{summary.userLabel.label}</h3>
            <p className="text-sm">{summary.userLabel.blurb}</p>
          </div>
        )}

        {/* Phase 3: Deciding Mistake Callout */}
        {summary.nearMiss && decidingMistake && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-bold text-neutral-900 mb-1">
                  Deciding moment: Round {decidingMistake.roundIndex + 1}
                </h3>
                <p className="text-sm text-neutral-700">{decidingFeedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Phase 1: Feedback (Compact) */}
        {summary.rounds.filter(r => !r.correct && r.feedbackText).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-neutral-900 mb-3">💡 Key Insights</h2>
            <div className="space-y-2">
              {summary.rounds
                .filter(r => !r.correct && r.feedbackText)
                .slice(0, 3)
                .map((r, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="text-neutral-500">Round {r.roundIndex + 1}:</span>
                    <span className="text-neutral-700">{r.feedbackText}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handlePlayAgain}
            disabled={isPlayingAgain}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isPlayingAgain ? 'Starting...' : 'Play Again'}
          </Button>
          
          <Button
            onClick={() => router.push('/leaderboard')}
            className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            🏆 View Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
}
