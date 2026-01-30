'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import UsernameModal from '@/components/UsernameModal';
import { apiFetch } from '@/lib/apiFetch';
import { 
  getOrCreateClientId, 
  getStoredUsername, 
  getStoredDiscriminator,
  formatUserTag 
} from '@/lib/identity';

export default function PlayPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [discriminator, setDiscriminator] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeIdentity();
  }, []);

  const initializeIdentity = async () => {
    if (typeof window === 'undefined') return;

    try {
      const clientId = getOrCreateClientId();
      const storedUsername = getStoredUsername();
      const storedDiscriminator = getStoredDiscriminator();

      // If we have stored credentials, verify with server
      if (storedUsername && storedDiscriminator !== null) {
        setUsername(storedUsername);
        setDiscriminator(storedDiscriminator);
        setIsInitializing(false);
        return;
      }

      // Otherwise, upsert to get or create identity
      const res = await fetch('/api/identity/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      const data = await res.json();

      if (data.ok && data.user) {
        setUsername(data.user.displayName);
        setDiscriminator(data.user.discriminator);
        
        // If they got assigned "Player", prompt them to choose a name
        if (data.user.displayName === 'Player') {
          setShowUsernameModal(true);
        }
      } else {
        // Failed to get identity, show modal
        setShowUsernameModal(true);
      }
    } catch (err) {
      console.error('Failed to initialize identity:', err);
      setShowUsernameModal(true);
    } finally {
      setIsInitializing(false);
    }
  };

  const logEvent = async (name: string, properties?: Record<string, any>) => {
    try {
      const clientId = getOrCreateClientId();
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          properties,
          clientId,
        }),
      });
    } catch {}
  };

  const handleUsernameSuccess = (newUsername: string, newDiscriminator: number) => {
    setUsername(newUsername);
    setDiscriminator(newDiscriminator);
    setShowUsernameModal(false);
  };

  const handlePlayBot = async () => {
    if (!username || discriminator === null) {
      setShowUsernameModal(true);
      return;
    }

    await logEvent('cta_play_vs_bot_clicked');
    setError(null);

    try {
      const clientId = getOrCreateClientId();
      
      const result = await apiFetch<{ matchId: string; requestId: string }>(
        '/api/bot-match/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            username,
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

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  const userTag = username && discriminator !== null ? formatUserTag(username, discriminator) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={handleUsernameSuccess}
        currentUsername={username || undefined}
      />

      <div className="flex-1 flex flex-col px-6 py-10 max-w-lg mx-auto w-full">
        <div className="text-center space-y-8 flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-start pt-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                Ready to Battle?
              </h1>
              <p className="text-lg text-neutral-600">
                Play against our adaptive AI.
              </p>
              {userTag && (
                <p className="text-sm text-neutral-500 mt-2">
                  Playing as: <span className="font-semibold">{userTag}</span>
                  {' '}
                  <button
                    onClick={() => setShowUsernameModal(true)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    (change)
                  </button>
                </p>
              )}
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
      </div>
    </div>
  );
}
