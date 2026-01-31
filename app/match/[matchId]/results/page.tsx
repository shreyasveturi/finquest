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

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header: Win/Loss/Draw */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className={`text-5xl font-bold mb-4 ${
            userWon ? 'text-green-600' : isDraw ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {userWon ? '🎉 Victory!' : isDraw ? '⚖️ Draw!' : '😔 Defeat'}
          </div>
          
          <div className="flex justify-center items-center gap-8 text-2xl font-semibold mb-4">
            <div>
              <p className="text-sm text-neutral-500 mb-1">You</p>
              <p className="text-neutral-900">{summary.playerAScore}</p>
            </div>
            <div className="text-neutral-400">—</div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">{summary.isBotMatch ? 'Bot' : 'Opponent'}</p>
              <p className="text-neutral-900">{summary.playerBScore}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-lg">
            <span className="text-neutral-600">Rating:</span>
            <span className="font-bold text-blue-600">{summary.ratingBefore}</span>
            <span className={`font-semibold ${ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {ratingChange >= 0 ? '+' : ''}{ratingChange}
            </span>
            <span className="text-neutral-400">→</span>
            <span className="font-bold text-blue-600">{summary.ratingAfter}</span>
          </div>
        </div>

        {/* Phase 0: Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">⚡ Performance Analysis</h2>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">Accuracy</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatAccuracy(summary.metrics.accuracy)}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatResponseTime(summary.metrics.avgResponseTimeMs)}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">Efficiency Score</p>
              <p className="text-2xl font-bold text-green-600">
                {formatEfficiency(summary.metrics.matchEfficiencyScore)}
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">Time Usage</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatEfficiency(1 - summary.metrics.avgTimeRemainingRatio)}
              </p>
            </div>
          </div>

          {/* Performance Label */}
          <div className={`rounded-lg p-4 border-2 ${
            summary.metrics.label === 'Fast but inaccurate'
              ? 'bg-orange-50 border-orange-300'
              : summary.metrics.label === 'Accurate but slow'
              ? 'bg-blue-50 border-blue-300'
              : 'bg-green-50 border-green-300'
          }`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {summary.metrics.label === 'Fast but inaccurate' ? '⚡' : 
                 summary.metrics.label === 'Accurate but slow' ? '🎯' : '⚖️'}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 mb-1">
                  {summary.metrics.label}
                </h3>
                <p className="text-sm text-neutral-700">
                  {summary.metrics.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Round-by-Round Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">📊 Round Breakdown</h2>
          
          <div className="space-y-3">
            {summary.rounds.map((round) => (
              <div
                key={round.roundIndex}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  round.correct
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  round.correct ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {round.correct ? '✓' : '✗'}
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">
                    Round {round.roundIndex + 1}
                  </p>
                  <p className="text-xs text-neutral-600 truncate">
                    {round.questionPrompt}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatResponseTime(round.responseTimeMs)}
                  </p>
                  {round.timeExpired && (
                    <p className="text-xs text-red-600">Time expired</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handlePlayAgain}
            disabled={isPlayingAgain}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            {isPlayingAgain ? 'Starting...' : 'Play Again'}
          </Button>
          
          <Button
            onClick={() => router.push('/leaderboard')}
            className="w-full"
            variant="outline"
          >
            View Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
}
