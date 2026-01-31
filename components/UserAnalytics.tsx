'use client';

import { useState, useEffect } from 'react';
import type { LearningCurve, ReasoningConsistencyScore } from '@/lib/analytics-learning';

interface UserAnalyticsProps {
  userId: string;
  displayName: string;
}

export default function UserAnalytics({ userId, displayName }: UserAnalyticsProps) {
  const [learningCurve, setLearningCurve] = useState<LearningCurve | null>(null);
  const [consistencyScore, setConsistencyScore] = useState<ReasoningConsistencyScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const [curveRes, scoreRes] = await Promise.all([
          fetch(`/api/analytics/learning-curve?userId=${userId}&limit=20`),
          fetch(`/api/analytics/consistency?userId=${userId}&limit=20`),
        ]);

        if (!curveRes.ok || !scoreRes.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const [curveData, scoreData] = await Promise.all([
          curveRes.json(),
          scoreRes.json(),
        ]);

        setLearningCurve(curveData);
        setConsistencyScore(scoreData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  if (!learningCurve || !consistencyScore) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  // Determine trend color and icon
  const getTrendDisplay = () => {
    switch (learningCurve.trend.improvementEvidence) {
      case 'IMPROVING':
        return { color: 'text-green-600', icon: '📈', label: 'Improving' };
      case 'REGRESSING':
        return { color: 'text-red-600', icon: '📉', label: 'Regressing' };
      case 'STABLE':
        return { color: 'text-blue-600', icon: '➡️', label: 'Stable' };
      default:
        return { color: 'text-gray-500', icon: '❓', label: 'Insufficient Data' };
    }
  };

  const trendDisplay = getTrendDisplay();

  return (
    <div className="p-6 border border-gray-200 rounded-lg space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{displayName}</h3>
        <p className="text-sm text-gray-500">User ID: {userId}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Matches Analyzed</p>
          <p className="text-2xl font-bold text-blue-700">{learningCurve.totalMatches}</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600">Consistency Score</p>
          <p className="text-2xl font-bold text-purple-700">
            {(consistencyScore.score * 100).toFixed(1)}%
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Trend</p>
          <p className={`text-2xl font-bold ${trendDisplay.color}`}>
            {trendDisplay.icon} {trendDisplay.label}
          </p>
        </div>
      </div>

      {/* Learning Curve Points */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Learning Curve (Last 20 Matches)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Match #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Time (s)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Commit (s)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {learningCurve.points.slice(0, 10).map((point) => (
                <tr key={point.matchId}>
                  <td className="px-3 py-2 text-sm text-gray-900">{point.matchIndex + 1}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {new Date(point.matchDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span
                      className={`font-medium ${
                        point.accuracy >= 0.8
                          ? 'text-green-600'
                          : point.accuracy >= 0.5
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {(point.accuracy * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    {(point.avgResponseTimeMs / 1000).toFixed(1)}s
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    {point.avgTimeToFirstCommitMs
                      ? (point.avgTimeToFirstCommitMs / 1000).toFixed(1) + 's'
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consistency Breakdown */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Consistency Breakdown</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Accuracy Variance</p>
            <p className="text-lg font-medium text-gray-900">
              {consistencyScore.breakdown.accuracyVariance.toFixed(3)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Time Variance (CV)</p>
            <p className="text-lg font-medium text-gray-900">
              {consistencyScore.breakdown.timeVariance.toFixed(3)}
            </p>
          </div>
        </div>

        {Object.keys(consistencyScore.breakdown.structuralConsistency).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Per-Type Consistency:</p>
            <div className="space-y-2">
              {Object.entries(consistencyScore.breakdown.structuralConsistency).map(([type, score]) => (
                <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{type.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(score * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trend Details */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Trend Analysis</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            <strong>Accuracy Slope:</strong>{' '}
            {learningCurve.trend.accuracySlope > 0 ? '+' : ''}
            {learningCurve.trend.accuracySlope.toFixed(4)} per match
          </p>
          <p>
            <strong>Latency Slope:</strong>{' '}
            {learningCurve.trend.latencySlope > 0 ? '+' : ''}
            {learningCurve.trend.latencySlope.toFixed(2)}ms per match
          </p>
        </div>
      </div>
    </div>
  );
}
