'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';

export const dynamic = 'force-dynamic';

interface Metrics {
  matchesPerUser: number;
  completionRate: number;
  avgQueueTime: number;
  botMatchPercent: number;
  reQueueRate: number;
  avgRating: number;
  topPlayers: Array<{
    rank: number;
    id: string;
    rating: number;
    tier: string;
  }>;
}

interface Summary {
  totalMatches: number;
  activeUsers: number;
  totalUsers: number;
  totalRounds: number;
  completedRounds: number;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/metrics');
        const data = await res.json();
        setMetrics(data.metrics);
        setSummary(data.summary);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">Loading metrics...</p>
      </div>
    );
  }

  if (!metrics || !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Analytics Dashboard</h1>
          <p className="text-lg text-neutral-600">Last 7 days performance metrics</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-2">TOTAL MATCHES</p>
            <p className="text-4xl font-bold text-blue-600">{summary.totalMatches}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-2">ACTIVE USERS</p>
            <p className="text-4xl font-bold text-green-600">{summary.activeUsers}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-2">COMPLETION RATE</p>
            <p className="text-4xl font-bold text-purple-600">{metrics.completionRate}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-2">AVG RATING</p>
            <p className="text-4xl font-bold text-orange-600">{metrics.avgRating}</p>
          </Card>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">MATCHES/ACTIVE USER</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-blue-600">{metrics.matchesPerUser.toFixed(1)}</p>
              <p className="text-sm text-neutral-500">matches</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">AVG QUEUE TIME</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-green-600">{metrics.avgQueueTime.toFixed(1)}</p>
              <p className="text-sm text-neutral-500">seconds</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">BOT MATCH %</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-purple-600">{metrics.botMatchPercent.toFixed(1)}</p>
              <p className="text-sm text-neutral-500">percent</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">RE-QUEUE RATE</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-orange-600">{metrics.reQueueRate.toFixed(1)}</p>
              <p className="text-sm text-neutral-500">percent</p>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Users playing 2+ matches
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">ROUND COMPLETION</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-green-600">{summary.completedRounds}</p>
              <p className="text-sm text-neutral-500">of {summary.totalRounds} completed</p>
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Top Players</h2>
          <div className="space-y-3">
            {metrics.topPlayers.map(player => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-neutral-900 min-w-8">{player.rank}</div>
                  <div>
                    <p className="font-semibold text-neutral-900">Player {player.id.slice(0, 8)}</p>
                    <p className="text-sm text-neutral-600 capitalize">{player.tier}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-blue-600">{player.rating}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
