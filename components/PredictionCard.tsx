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
import MultipleChoiceCard from '@/components/MultipleChoiceCard';
import { trackPredictionWritten } from '@/lib/analytics';

export interface PredictionChoice {
  id: string;
  label: string;
}

interface PredictionCardProps {
  articleId: string;
  title?: string;
  choices?: PredictionChoice[];
}

export const DEFAULT_CHOICES: PredictionChoice[] = [
  { id: 'tax-rise', label: 'Expect further tax rises to fund spending' },
  { id: 'spend-cuts', label: 'Expect spending cuts to balance the budget' },
  { id: 'market-confidence', label: 'Expect measures to reassure markets and lower yields' },
  { id: 'status-quo', label: 'Expect minimal changes; steady status quo' },
];

export const PREDICTION_CORRECT_ID = 'tax-rise';

export default function PredictionCard({ articleId, title = 'Your Prediction', choices = DEFAULT_CHOICES }: PredictionCardProps) {
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
      if (!prediction) return;
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
        <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
        <p className="text-xs text-gray-500 mb-4">Before reading, pick the outcome you expect.</p>

        <MultipleChoiceCard
          choices={choices}
          value={prediction}
          onChange={(val) => {
            setPrediction(val);
            setIsSaved(false);
          }}
        />

        <div className="flex items-center justify-end mt-4">
          <Button
            variant={isSaved ? 'outline' : 'primary'}
            className="text-sm px-3 py-2"
            onClick={handleSave}
            disabled={!prediction}
          >
            {isSaved ? '✓ Saved' : 'Save Prediction'}
          </Button>
        </div>
      </div>
    </div>
  );
}
