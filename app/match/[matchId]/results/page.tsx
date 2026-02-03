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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">📊 Performance Metrics</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Accuracy */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatAccuracy(summary.metrics.accuracy)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Accuracy</p>
            </div>
            
            {/* Efficiency */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatEfficiency(summary.metrics.matchEfficiencyScore)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Efficiency</p>
            </div>
            
            {/* Right/Wrong */}
            <div className="text-center">
              <div className="text-sm font-semibold text-neutral-900">
                <span className="text-green-600">{summary.playerAScore}</span>
                <span className="text-neutral-400 mx-1">/</span>
                <span className="text-red-600">{summary.totalRounds - summary.playerAScore}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">Right / Wrong</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-neutral-200">
            {/* Avg Response Time */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-600">Avg Response Time</p>
              <p className="text-sm font-semibold text-neutral-900">
                {formatResponseTime(summary.metrics.avgResponseTimeMs)}
              </p>
            </div>
            
            {/* Time Usage */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-600">Time Remaining</p>
              <p className="text-sm font-semibold text-neutral-900">
                {formatEfficiency(summary.metrics.avgTimeRemainingRatio)}
              </p>
            </div>
          </div>

          {/* Performance Label */}
          <div className="bg-neutral-50 rounded p-3 border-l-4 border-blue-500">
            <p className="text-sm font-semibold text-neutral-900">{summary.metrics.label}</p>
            <p className="text-xs text-neutral-600 mt-1">{summary.metrics.explanation}</p>
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            {isPlayingAgain ? 'Starting...' : 'Play Again'}
          </Button>
          
          <Button
            onClick={() => router.push('/leaderboard')}
            className="w-full bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 py-2 rounded-lg"
          >
            View Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
}
