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
    setError(null);

    const maxRetries = 2;
    const backoffMs = [300, 800]; // ms delays for retries
    let lastError: any = null;
    let lastRequestId: string | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[PlayBot] Retry attempt ${attempt}/${maxRetries}, waiting ${backoffMs[attempt - 1]}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffMs[attempt - 1]));
        }

        console.log(`[PlayBot] Attempt ${attempt + 1}/${maxRetries + 1}: POST /api/match/bot/start`, {
          clientId: ident.clientId,
          username: ident.username,
        });

        const res = await fetch('/api/match/bot/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: ident.clientId,
            username: ident.username,
          }),
        });

        lastRequestId = res.headers.get('x-request-id');
        const data = await res.json();

        if (!res.ok) {
          lastError = data;
          console.error(`[PlayBot] Attempt ${attempt + 1} failed:`, {
            status: res.status,
            error: data.error,
            requestId: lastRequestId,
          });

          // Only retry on network errors or 5xx; don't retry on 4xx client errors
          if (res.status >= 400 && res.status < 500) {
            throw new Error(`Client error (${res.status}): ${data.error?.message || 'Unknown error'}`);
          }
          // 5xx or network error; try again if retries remain
          if (attempt < maxRetries) {
            continue;
          }
          throw new Error(data.error?.message || 'Failed to start bot match');
        }

        // Success
        console.log(`[PlayBot] Match started successfully`, {
          matchId: data.matchId,
          requestId: lastRequestId,
          attempt: attempt + 1,
        });

        await logEvent('bot_match_started', {
          matchId: data.matchId,
          requestId: lastRequestId,
        });

        router.push(`/match/${data.matchId}`);
        return;
      } catch (err) {
        lastError = err;
        console.error(`[PlayBot] Attempt ${attempt + 1} exception:`, {
          error: err instanceof Error ? err.message : String(err),
          requestId: lastRequestId,
        });

        // If last attempt or client error, stop retrying
        if (attempt >= maxRetries || (err instanceof Error && err.message.includes('Client error'))) {
          break;
        }
      }
    }

    // All retries exhausted
    let errorMsg = 'Failed to connect to match against the bot. Try again';
    if (lastRequestId) {
      errorMsg += ` (ref: ${lastRequestId.slice(0, 8)})`;
    }
    console.error(`[PlayBot] All retries exhausted`, {
      lastError,
      requestId: lastRequestId,
    });
    setError(errorMsg);
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
