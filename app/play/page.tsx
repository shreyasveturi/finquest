'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { apiFetch } from '@/lib/apiFetch';

export default function PlayPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = localStorage.getItem('scio_username');
    setNeedsUsername(!existing);
  }, []);

  const ensureIdentity = () => {
    if (typeof window === 'undefined') return null;

    let clientId = localStorage.getItem('scio_client_id');
    let username = localStorage.getItem('scio_username');

    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('scio_client_id', clientId);
    }

    if (!username) {
      setNeedsUsername(true);
      return null;
    }

    return { clientId, username };
  };

  const logEvent = async (name: string, properties?: Record<string, any>) => {
    try {
      const ident = ensureIdentity();
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          properties,
          clientId: ident?.clientId,
        }),
      });
    } catch {}
  };

  const handleSetUsername = () => {
    if (!usernameInput) return;
    if (usernameInput.length < 3 || usernameInput.length > 16) return;
    if (!/^[A-Za-z0-9_]+$/.test(usernameInput)) return;

    const existingId =
      localStorage.getItem('scio_client_id') || crypto.randomUUID();

    localStorage.setItem('scio_client_id', existingId);
    localStorage.setItem('scio_username', usernameInput);

    setNeedsUsername(false);
    router.push('/play');
  };

  const handlePlayBot = async () => {
    const ident = ensureIdentity();
    if (!ident) return;

    await logEvent('cta_play_vs_bot_clicked');
    setError(null);

    try {
      const result = await apiFetch<{ matchId: string; requestId: string }>(
        '/api/bot-match/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: ident.clientId,
            username: ident.username,
          }),
        }
      );

      await logEvent('bot_match_started', {
        matchId: result.data.matchId,
        requestId: result.requestId,
      });

      router.push('/match/' + result.data.matchId);
    } catch (err) {
      console.error('[PlayBot] Failed to start bot match', err);
      setError('Failed to connect to match against the bot. Try again');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-10 max-w-lg mx-auto w-full">
        {needsUsername ? (
          <div className="text-center space-y-8 flex-1 flex flex-col justify-center">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                Choose a username
              </h1>
              <p className="text-lg text-neutral-600">
                Pick a name and play.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="3–16 characters, letters/numbers/_"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSetUsername} className="w-full">
                Start Playing
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8 flex-1 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-start pt-4">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                  Ready to Battle?
                </h1>
                <p className="text-lg text-neutral-600">
                  Play against our adaptive AI.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3 text-left">
                <h3 className="font-semibold text-neutral-900">
                  How it works:
                </h3>
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
                onClick={handlePlayBot}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
              >
                Play vs Bot
              </Button>

              <p className="text-xs text-neutral-500">
                Peer-to-peer matchmaking is coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
