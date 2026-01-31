/**
 * Admin Analytics Dashboard — Phase 2
 * 
 * Shows defensible evidence of user improvement:
 * - Learning curves
 * - Consistency scores
 * - Aggregate metrics
 */

import { prisma } from '@/lib/prisma';
import UserAnalytics from '@/components/UserAnalytics';

export default async function AnalyticsDashboard() {
  // Fetch all users with completed matches
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { matchesAsPlayerA: { some: { status: 'COMPLETED' } } },
        { matchesAsPlayerB: { some: { status: 'COMPLETED' } } },
      ],
    },
    select: {
      id: true,
      displayName: true,
      _count: {
        select: {
          matchesAsPlayerA: { where: { status: 'COMPLETED' } },
          matchesAsPlayerB: { where: { status: 'COMPLETED' } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20, // Show top 20 most active users
  });

  // Compute total match count for each user
  const usersWithMatchCount = users.map((user) => ({
    id: user.id,
    displayName: user.displayName,
    totalMatches: user._count.matchesAsPlayerA + user._count.matchesAsPlayerB,
  }));

  // Sort by total matches descending
  usersWithMatchCount.sort((a, b) => b.totalMatches - a.totalMatches);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Phase 2 — Measurement & Proof: Defensible evidence of user improvement
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Active Users</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{users.length}</p>
            <p className="text-xs text-gray-500 mt-1">with completed matches</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Total Matches</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {usersWithMatchCount.reduce((sum, u) => sum + u.totalMatches, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">across all users</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Avg Matches/User</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {usersWithMatchCount.length > 0
                ? (
                    usersWithMatchCount.reduce((sum, u) => sum + u.totalMatches, 0) /
                    usersWithMatchCount.length
                  ).toFixed(1)
                : '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">engagement metric</p>
          </div>
        </div>

        {/* User Analytics Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            User Learning Curves & Consistency Scores
          </h2>

          {usersWithMatchCount.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <p className="text-gray-500">No users with completed matches yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {usersWithMatchCount.slice(0, 10).map((user) => (
                <UserAnalytics
                  key={user.id}
                  userId={user.id}
                  displayName={user.displayName}
                />
              ))}
            </div>
          )}
        </div>

        {/* Phase 2 Explanation */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📊 Phase 2 Metrics Explained
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Learning Curve:</strong> Tracks accuracy and response time over the last 20 matches. 
              A positive accuracy slope + negative latency slope = improving reasoning skills.
            </p>
            <p>
              <strong>Consistency Score:</strong> Measures how consistently a user performs on similar question types. 
              High consistency (low variance) indicates internalized reasoning schemas.
            </p>
            <p>
              <strong>Trend Analysis:</strong> Linear regression on match history to detect improvement/regression patterns. 
              &quot;IMPROVING&quot; = measurable progress in accuracy or speed.
            </p>
            <p>
              <strong>Structural Consistency:</strong> Per-question-type variance. Lower variance on specific reasoning patterns 
              (e.g., CONSTRAINT_CHECK) shows mastery of that cognitive pattern.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
