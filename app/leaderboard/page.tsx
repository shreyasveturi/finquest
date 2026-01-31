'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  cohortTag: string | null;
  rating: number;
  matches: number;
  wins: number;
  losses: number;
  accuracy: number;
  efficiency: number;
}

interface Season {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
}

interface LeaderboardResponse {
  ok: boolean;
  season: Season;
  entries: LeaderboardEntry[];
}

const COHORTS = ['All', 'UCL', 'LSE', 'KCL', 'Imperial', 'Oxford', 'Cambridge', 'Other'];

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<string>('All');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCohort]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        season: 'active',
        limit: '50',
      });
      
      if (selectedCohort !== 'All') {
        params.append('cohortTag', selectedCohort);
      }

      const response = await apiFetch<LeaderboardResponse>(`/api/leaderboard?${params.toString()}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-neutral-600">Loading leaderboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-semibold">{error || 'Failed to load leaderboard'}</p>
          <button
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const seasonDateRange = data.season.endsAt
    ? `${formatDate(data.season.startsAt)} – ${formatDate(data.season.endsAt)}`
    : `Started ${formatDate(data.season.startsAt)}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-neutral-900">Leaderboard</h1>
          
          {/* Season Info */}
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 font-semibold rounded">
              {data.season.name}
            </span>
            <span className="text-neutral-600">{seasonDateRange}</span>
          </div>
        </div>

        {/* Cohort Filter */}
        <div className="flex items-center gap-3">
          <label htmlFor="cohort-filter" className="text-sm font-medium text-neutral-700">
            Filter by cohort:
          </label>
          <select
            id="cohort-filter"
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COHORTS.map((cohort) => (
              <option key={cohort} value={cohort}>
                {cohort}
              </option>
            ))}
          </select>
        </div>

        {/* Leaderboard Table */}
        {data.entries.length === 0 ? (
          <div className="bg-neutral-50 rounded-lg p-8 text-center">
            <p className="text-neutral-600">No players found for this cohort.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-600 text-sm border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">Player</th>
                  <th className="px-4 py-3 font-semibold">Cohort</th>
                  <th className="px-4 py-3 font-semibold text-right">Rating</th>
                  <th className="px-4 py-3 font-semibold text-right">Matches</th>
                  <th className="px-4 py-3 font-semibold text-right">W/L</th>
                  <th className="px-4 py-3 font-semibold text-right">Accuracy</th>
                  <th className="px-4 py-3 font-semibold text-right">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => (
                  <tr 
                    key={entry.userId} 
                    className="border-t border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-neutral-900">
                      {entry.rank}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                      {entry.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {entry.cohortTag || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                      {entry.rating}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 text-right">
                      {entry.matches}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700 text-right">
                      {entry.wins}/{entry.losses}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium text-right">
                      {formatPercent(entry.accuracy)}
                    </td>
                    <td className="px-4 py-3 text-sm text-purple-600 font-medium text-right">
                      {formatPercent(entry.efficiency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <p className="text-xs text-neutral-500 text-center">
          Leaderboard updates after each completed match. Anonymous players shown with anonIds.
        </p>
      </div>
    </div>
  );
}
