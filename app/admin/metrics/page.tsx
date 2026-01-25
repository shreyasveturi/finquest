'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';

export const dynamic = 'force-dynamic';

interface Metrics {
  matchesPerActiveUser: number;
  completionRate: number;
  medianQueueTimeMs: number;
  botMatchRate: number;
  reQueueRate: number;
  topPlayers: Array<{
    id: string;
    name: string | null;
    rating: number;
    tier: string;
  }>;
}

interface Summary {
  totalMatches: number;
  activeUsers: number;
  totalUsers: number;
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

  const nameCounts = metrics.topPlayers.reduce<Record<string, number>>((acc, p) => {
    const base = p.name || 'Player';
    acc[base] = (acc[base] || 0) + 1;
    return acc;
  }, {});

  const displayName = (p: { id: string; name: string | null }) => {
    const base = p.name || 'Player';
    if ((nameCounts[base] || 0) <= 1) return base;
    return `${base}#${p.id.slice(-4).toUpperCase()}`;
  };

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
            <p className="text-sm font-semibold text-neutral-600 mb-2">TOTAL USERS</p>
            <p className="text-4xl font-bold text-purple-600">{summary.totalUsers}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-2">COMPLETION RATE</p>
            <p className="text-4xl font-bold text-orange-600">{(metrics.completionRate * 100).toFixed(1)}%</p>
          </Card>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">MATCHES / ACTIVE USER</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-blue-600">{metrics.matchesPerActiveUser.toFixed(2)}</p>
              <p className="text-sm text-neutral-500">avg matches</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">MEDIAN QUEUE TIME</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-green-600">{(metrics.medianQueueTimeMs / 1000).toFixed(1)}</p>
              <p className="text-sm text-neutral-500">seconds</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">BOT MATCH RATE</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-purple-600">{(metrics.botMatchRate * 100).toFixed(1)}%</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">RE-QUEUE RATE</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-orange-600">{(metrics.reQueueRate * 100).toFixed(1)}%</p>
              <p className="text-sm text-neutral-500">play again / match completed</p>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-neutral-600 mb-3">MATCH COMPLETION RATE</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-green-600">{(metrics.completionRate * 100).toFixed(1)}%</p>
              <p className="text-sm text-neutral-500">completed vs started</p>
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Top Players</h2>
          <div className="space-y-3">
            {metrics.topPlayers.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-neutral-900 min-w-8">{index + 1}</div>
                  <div>
                    <p className="font-semibold text-neutral-900">{displayName(player)}</p>
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
