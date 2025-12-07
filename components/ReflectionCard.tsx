/**
 * ReflectionCard Component
 * 
 * Final step in the learning loop: "Prove You Understand"
 * Prompts user to explain the main concept in interview terms.
 * Compares against their original prediction.
 */

'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import ExperienceRating from '@/components/ExperienceRating';
import { trackReflectionWritten } from '@/lib/analytics';

interface ReflectionCardProps {
  articleId: string;
  title?: string;
}

export default function ReflectionCard({ articleId, title = 'Your Reflection' }: ReflectionCardProps) {
  const [reflection, setReflection] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load reflection and prediction from localStorage on mount
  useEffect(() => {
    try {
      const storedReflection = localStorage.getItem(`scio_reflection_${articleId}`);
      if (storedReflection) {
        setReflection(storedReflection);
        setIsSaved(true);
      }
    } catch (e) {
      console.error('Failed to load reflection:', e);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  const handleSave = () => {
    try {
      if (!reflection) return;
      localStorage.setItem(`scio_reflection_${articleId}`, reflection);
      setIsSaved(true);
      trackReflectionWritten();
      // Reset saved state after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save reflection:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 mb-8">
        <div className="h-32 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 mb-12">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Describe your Scio experience.</label>
        <p className="text-xs text-gray-500 mb-4">Pick the option that best matches how this felt.</p>

        <ExperienceRating
          value={reflection}
          onChange={(val) => {
            setReflection(val);
            setIsSaved(false);
          }}
          title="How was this demo?"
          subtitle="Choose one"
        />

        <div className="flex items-center justify-end mt-4">
          <Button
            variant={isSaved ? 'outline' : 'primary'}
            className="text-sm px-3 py-2"
            onClick={handleSave}
            disabled={!reflection}
          >
            {isSaved ? '✓ Saved' : 'Save Experience'}
          </Button>
        </div>
      </div>
    </div>
  );
}
