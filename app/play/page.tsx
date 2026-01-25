'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';

export default function PlayPage() {
  const router = useRouter();
  const [isQueued, setIsQueued] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [queueExpired, setQueueExpired] = useState(false);
  const [currentQueueId, setCurrentQueueId] = useState<string | null>(null);

  useEffect(() => {
    const existing = typeof window !== 'undefined' ? localStorage.getItem('scio_username') : null;
    setNeedsUsername(!existing);
  }, []);

  const ensureIdentity = () => {
    let clientId = typeof window !== 'undefined' ? localStorage.getItem('scio_client_id') : null;
    let username = typeof window !== 'undefined' ? localStorage.getItem('scio_username') : null;
    if (!clientId && typeof window !== 'undefined') {
      clientId = crypto.randomUUID();
      localStorage.setItem('scio_client_id', clientId);
    }
    if (!username && typeof window !== 'undefined') {
      setNeedsUsername(true);
      return null;
    }
    return { clientId: clientId!, username: username! };
  };

  const logEvent = async (name: string, properties?: Record<string, any>) => {
    try {
      const ident = ensureIdentity();
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, properties, clientId: ident?.clientId }),
      });
    } catch {}
  };

  const handleSetUsername = () => {
    if (!usernameInput) return;
    if (usernameInput.length < 3 || usernameInput.length > 16) return;
    if (!/^[A-Za-z0-9_]+$/.test(usernameInput)) return;
    const existingId = localStorage.getItem('scio_client_id') || crypto.randomUUID();
    localStorage.setItem('scio_client_id', existingId);
    localStorage.setItem('scio_username', usernameInput);
    setNeedsUsername(false);
    router.push('/play');
  };

  const handleJoinQueue = async () => {
    setError(null);
    setQueueExpired(false);
    setIsQueued(true);
    setTimeRemaining(12);
    await logEvent('cta_start_match_clicked');
    const ident = ensureIdentity();
    if (!ident) return;

    try {
      const res = await fetch('/api/matchmaking/join', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(ident) 
      });
      const data = await res.json();

      if (data.matchId) {
        // Immediate human match found
        router.push(`/match/${data.matchId}`);
        return;
      }

      if (data.queueId) {
        setCurrentQueueId(data.queueId);
        // In queue - start polling for human opponent
        let pollInterval: NodeJS.Timeout | null = null;
        let timeoutId: NodeJS.Timeout | null = null;

        pollInterval = setInterval(async () => {
          const statusRes = await fetch(`/api/matchmaking/status?queueId=${data.queueId}`);
          const statusData = await statusRes.json();

          if (statusData.matchId) {
            if (pollInterval) clearInterval(pollInterval);
            if (timeoutId) clearTimeout(timeoutId);
            router.push(`/match/${statusData.matchId}`);
          }
        }, 750);

        // After 12 seconds, show user choice to play bot or keep waiting
        timeoutId = setTimeout(() => {
          if (pollInterval) clearInterval(pollInterval);
          console.log('Queue expired, showing bot option');
          setIsQueued(false);
          setQueueExpired(true);
        }, 12000);
      }
    } catch (err) {
      setError('Failed to join queue');
      setIsQueued(false);
    }
  };

  const handlePlayBot = async () => {
    const ident = ensureIdentity();
    if (!ident) return;

    try {
      const res = await fetch('/api/matchmaking/create-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: ident.clientId }),
      });
      const data = await res.json();

      if (data.matchId) {
        router.push(`/match/${data.matchId}`);
      } else {
        setError('Failed to create bot match');
      }
    } catch (err) {
      setError('Failed to create bot match');
    }
  };

  const handleCancel = () => {
    setIsQueued(false);
    setQueueExpired(false);
    setError(null);
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-6 pt-8 pb-6 sm:pt-12 sm:pb-8">
      <div className="w-full max-w-md flex flex-col min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-10rem)] justify-start">
        {needsUsername ? (
          <div className="text-center space-y-8 flex-1 flex flex-col justify-center">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">Choose a username</h1>
              <p className="text-lg text-neutral-600">Pick a name and play.</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder="3–16 characters, letters/numbers/_"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSetUsername} className="w-full">Start Playing</Button>
            </div>
          </div>
        ) : queueExpired ? (
          <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">No opponents found</h2>
              <p className="text-neutral-600 mb-6">Would you like to play against a bot or keep waiting for a human?</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePlayBot}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              >
                🤖 Play Against Bot
              </Button>
              <Button
                onClick={handleJoinQueue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                ⏱️ Keep Waiting
              </Button>
            </div>
          </div>
        ) : isQueued ? (
          <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
            <div className="animate-pulse">
              <div className="text-6xl font-bold text-blue-600 mb-4">{timeRemaining}s</div>
              <p className="text-xl text-neutral-600">Finding a human opponent...</p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
              <p className="text-sm text-neutral-600">
                Searching for a ranked opponent in your skill range.
              </p>
              <Button variant="outline" onClick={handleCancel} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8 flex-1 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-start pt-4">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">⚔️ Ready to Battle?</h1>
                <p className="text-lg text-neutral-600">
                  Challenge a human opponent or play a bot.
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mt-8">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6 mt-8 pb-4">
              <Button
                onClick={handleJoinQueue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
              >
                Find Human Opponent
              </Button>

              <p className="text-xs text-neutral-500">
                Up to 12 seconds to find a ranked opponent
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
