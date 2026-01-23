'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';

export default function PlayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isQueued, setIsQueued] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const handleJoinQueue = async () => {
    setError(null);
    setIsQueued(true);
    setTimeRemaining(12);

    try {
      const res = await fetch('/api/matchmaking/join', { method: 'POST' });
      const data = await res.json();

      if (data.matchId) {
        // Immediate match found
        router.push(`/match/${data.matchId}`);
        return;
      }

      if (data.queueId) {
        // In queue - start polling
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`/api/matchmaking/status?queueId=${data.queueId}`);
          const statusData = await statusRes.json();

          if (statusData.matchId) {
            clearInterval(pollInterval);
            router.push(`/match/${statusData.matchId}`);
          }
        }, 750); // Poll every 750ms

        // Timeout after 12 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          setIsQueued(false);
          setError('No opponent found. Try again!');
        }, data.timeoutMs || 12000);
      }
    } catch (err) {
      setError('Failed to join queue');
      setIsQueued(false);
    }
  };

  const handleCancel = async () => {
    await fetch('/api/matchmaking/cancel', { method: 'POST' });
    setIsQueued(false);
  };

  // Countdown timer
  useEffect(() => {
    if (!isQueued) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isQueued]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        {isQueued ? (
          <div className="text-center space-y-6">
            <div className="animate-pulse">
              <div className="text-6xl font-bold text-blue-600 mb-4">{timeRemaining}s</div>
              <p className="text-xl text-neutral-600">Finding opponent...</p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
              <p className="text-sm text-neutral-600">
                Looking for a ranked opponent in your skill range. Powered by SBMM.
              </p>
              <Button variant="outline" onClick={handleCancel} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">⚔️ Start a Match</h1>
              <p className="text-lg text-neutral-600">
                Challenge yourself in a ranked 1v1 reasoning battle
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3 text-left">
              <h3 className="font-semibold text-neutral-900">How it works:</h3>
              <ul className="text-sm text-neutral-700 space-y-2">
                <li>✓ 5 reasoning questions</li>
                <li>✓ 20-30 seconds per question</li>
                <li>✓ ELO rating updates after</li>
                <li>✓ Play again instantly</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleJoinQueue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
            >
              Join Queue
            </Button>

            <p className="text-xs text-neutral-500">
              You'll be matched with a human opponent or a bot if none available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
