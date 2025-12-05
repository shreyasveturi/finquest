/**
 * PredictionCard Component
 * 
 * First step in the learning loop: "Predict First"
 * Prompts user to predict what the article will cover.
 * Saves prediction to localStorage for later reflection.
 */

'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { trackPredictionWritten } from '@/lib/analytics';

interface PredictionCardProps {
  articleId: string;
  title?: string;
}

export default function PredictionCard({ articleId, title = 'Your Prediction' }: PredictionCardProps) {
  const [prediction, setPrediction] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load prediction from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`scio_prediction_${articleId}`);
      if (stored) {
        setPrediction(stored);
        setIsSaved(true);
      }
    } catch (e) {
      console.error('Failed to load prediction:', e);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  const handleSave = () => {
    try {
      localStorage.setItem(`scio_prediction_${articleId}`, prediction);
      setIsSaved(true);
      trackPredictionWritten();
      // Reset saved state after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save prediction:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 mb-8">
        <div className="h-24 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 mb-12">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label htmlFor={`prediction-${articleId}`} className="block text-sm font-medium text-gray-700 mb-2">
          {title}
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Before reading, what do you predict this article will cover?
        </p>
        
        <textarea
          id={`prediction-${articleId}`}
          value={prediction}
          onChange={(e) => {
            setPrediction(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Write your prediction here..."
          className="w-full h-20 p-3 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-500">
            {prediction.length} characters
          </div>
          <Button
            variant={isSaved ? 'outline' : 'primary'}
            className="text-sm px-3 py-2"
            onClick={handleSave}
            disabled={!prediction.trim()}
          >
            {isSaved ? '✓ Saved' : 'Save Prediction'}
          </Button>
        </div>
      </div>
    </div>
  );
}
