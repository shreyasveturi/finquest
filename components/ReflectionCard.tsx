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
import { trackReflectionWritten } from '@/lib/analytics';

interface ReflectionCardProps {
  articleId: string;
  title?: string;
}

export default function ReflectionCard({ articleId, title = 'Your Reflection' }: ReflectionCardProps) {
  const [reflection, setReflection] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load reflection and prediction from localStorage on mount
  useEffect(() => {
    try {
      const storedReflection = localStorage.getItem(`scio_reflection_${articleId}`);
      const storedPrediction = localStorage.getItem(`scio_prediction_${articleId}`);
      
      if (storedReflection) {
        setReflection(storedReflection);
        setIsSaved(true);
      }
      if (storedPrediction) {
        setPrediction(storedPrediction);
      }
    } catch (e) {
      console.error('Failed to load reflection:', e);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  const handleSave = () => {
    try {
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
        <label htmlFor={`reflection-${articleId}`} className="block text-sm font-medium text-gray-700 mb-2">
          {title}
        </label>
        <p className="text-xs text-gray-500 mb-4">
          How would you explain the main concept in your own words?
        </p>

        {prediction && (
          <details className="mb-6 p-3 bg-gray-50 rounded border border-gray-200 text-xs cursor-pointer">
            <summary className="font-medium text-gray-700">Your Original Prediction</summary>
            <p className="mt-3 text-gray-600">{prediction}</p>
          </details>
        )}

        <textarea
          id={`reflection-${articleId}`}
          value={reflection}
          onChange={(e) => {
            setReflection(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Explain the concept as if in an interview..."
          className="w-full h-24 p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-500">
            {reflection.length} characters
          </div>
          <Button
            variant={isSaved ? 'outline' : 'primary'}
            className="text-sm px-3 py-2"
            onClick={handleSave}
            disabled={!reflection.trim()}
          >
            {isSaved ? '✓ Saved' : 'Save Reflection'}
          </Button>
        </div>
      </div>
    </div>
  );
}
