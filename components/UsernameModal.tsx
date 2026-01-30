/**
 * UsernameModal - Modal for choosing or changing username
 */
'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import { getOrCreateClientId, setStoredUsername, setStoredDiscriminator } from '@/lib/identity';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string, discriminator: number) => void;
  currentUsername?: string;
  cooldownEndsAt?: string;
}

export default function UsernameModal({
  isOpen,
  onClose,
  onSuccess,
  currentUsername,
  cooldownEndsAt,
}: UsernameModalProps) {
  const [username, setUsername] = useState(currentUsername || '');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);

  // Update cooldown display
  useEffect(() => {
    if (!cooldownEndsAt) {
      setCooldownRemaining(null);
      return;
    }

    const updateCooldown = () => {
      const now = Date.now();
      const end = new Date(cooldownEndsAt).getTime();
      const remaining = end - now;

      if (remaining <= 0) {
        setCooldownRemaining(null);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setCooldownRemaining(`${hours}h ${minutes}m`);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [cooldownEndsAt]);

  // Real-time validation
  useEffect(() => {
    if (!username || username.trim().length === 0) {
      setValidationMessage(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const res = await fetch('/api/identity/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ desiredName: username }),
        });

        const data = await res.json();
        if (!data.ok) {
          setValidationMessage(data.reason || 'Invalid username');
        } else {
          setValidationMessage(null);
        }
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        setIsValidating(false);
      }
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cooldownRemaining) {
      setError(`You can change your name again in ${cooldownRemaining}`);
      return;
    }

    if (!username || username.trim().length === 0) {
      setError('Please enter a username');
      return;
    }

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const clientId = getOrCreateClientId();

      const res = await fetch('/api/identity/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          desiredName: username,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.reason || 'Failed to set username');
        return;
      }

      // Store username and discriminator locally
      setStoredUsername(data.user.displayName);
      setStoredDiscriminator(data.user.discriminator);

      // Success!
      onSuccess(data.user.displayName, data.user.discriminator);
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-neutral-900">
            {currentUsername ? 'Change Username' : 'Choose Your Username'}
          </h2>
          <p className="text-sm text-neutral-600">
            {currentUsername
              ? 'You can change your name once every 24 hours.'
              : 'Pick a name to identify yourself on the leaderboard.'}
          </p>
          {cooldownRemaining && (
            <p className="text-sm text-orange-600 font-semibold">
              Cooldown: {cooldownRemaining} remaining
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              disabled={isSubmitting || !!cooldownRemaining}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={20}
              autoFocus
            />
            
            {isValidating && (
              <p className="text-xs text-neutral-500 mt-1">Checking...</p>
            )}
            
            {validationMessage && !isValidating && (
              <p className="text-xs text-red-600 mt-1">{validationMessage}</p>
            )}
            
            {!validationMessage && !isValidating && username.trim().length >= 3 && (
              <p className="text-xs text-green-600 mt-1">Username is available!</p>
            )}
            
            <p className="text-xs text-neutral-500 mt-1">
              3-20 characters. Letters, numbers, spaces, and underscores only.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            {currentUsername && !cooldownRemaining && (
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !username ||
                username.trim().length < 3 ||
                !!validationMessage ||
                isValidating ||
                !!cooldownRemaining
              }
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : currentUsername ? 'Change Name' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
