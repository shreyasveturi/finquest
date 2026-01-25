'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';

export default function PlayPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

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

  const handlePlayBot = async () => {
    const ident = ensureIdentity();
    if (!ident) return;
    await logEvent('cta_play_vs_bot_clicked');

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
        ) : (
          <div className="text-center space-y-8 flex-1 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-start pt-4">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">⚔️ Ready to Battle?</h1>
                <p className="text-lg text-neutral-600">
                  Play against our adaptive AI.
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
