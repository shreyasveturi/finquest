import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function tierFromRating(rating: number) {
  if (rating < 1150) return 'Bronze';
  if (rating < 1350) return 'Silver';
  if (rating < 1550) return 'Gold';
  return 'Platinum';
}

export default async function LeaderboardPage() {
  const topPlayers = await prisma.user.findMany({
    orderBy: { rating: 'desc' },
    take: 25,
    select: { 
      id: true, 
      name: true, 
      email: true, 
      rating: true,
      displayName: true,
      discriminator: true,
    },
  });

  const displayName = (player: { 
    id: string; 
    name: string | null; 
    email: string | null;
    displayName: string | null;
    discriminator: number | null;
  }) => {
    // Use new identity system if available
    if (player.displayName !== null && player.discriminator !== null) {
      const disc = player.discriminator.toString().padStart(4, '0');
      return `${player.displayName}#${disc}`;
    }
    
    // Fallback for legacy users (pre-identity system)
    const base = player.name || player.email || 'Player';
    const suffix = player.id.slice(-4).toUpperCase();
    return `${base}#${suffix}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-neutral-900">Leaderboard</h1>
          <p className="text-neutral-600">Top 25 players by rating.</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-600 text-sm">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((player, index) => (
                <tr key={player.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-700">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-neutral-900">{displayName(player)}</td>
                  <td className="px-4 py-3 text-sm text-neutral-700">{tierFromRating(player.rating)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-900 text-right">{player.rating}</td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
