/**
 * InterviewExplainModal Component
 * 
 * AI-powered explanation for highlighted text.
 * Shows how selected text relates to interview context.
 * Currently placeholder for future AI integration.
 */

'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';

interface InterviewExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  articleTitle?: string;
}

export default function InterviewExplainModal({
  isOpen,
  onClose,
  selectedText,
  articleTitle = 'Article',
}: InterviewExplainModalProps) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !selectedText) return;

    console.log('[Explain Modal] Opening with text:', selectedText);

    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError('');
      setExplanation('');
      try {
        console.log('[Explain Modal] Calling /api/explain...');
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: selectedText, articleTitle }),
          signal: controller.signal,
        });
        console.log('[Explain Modal] Response status:', res.status);
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          console.error('[Explain Modal] API error response:', detail);
          throw new Error(detail?.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        console.log('[Explain Modal] Full response:', data);
        console.log('[Explain Modal] Got explanation:', data.explanation);
        if (!data.explanation) {
          console.warn('[Explain Modal] Empty explanation in response');
        }
        setExplanation(data.explanation || '');
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          console.log('[Explain Modal] Request aborted');
          return;
        }
        console.error('[Explain Modal] Full error:', err);
        setError(err?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [isOpen, selectedText, articleTitle]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 max-w-md">
        <h2 className="text-xl font-bold text-gray-900">Interview Explanation</h2>

        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">SELECTED TEXT</p>
          <p className="text-gray-900">"{selectedText}"</p>
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-xs font-medium text-blue-600 mb-2">💡 HOW TO EXPLAIN THIS</p>
          {loading && <p className="text-sm text-gray-700">Generating...</p>}
          {!loading && error && (
            <p className="text-sm text-rose-700">{error}</p>
          )}
          {!loading && !error && explanation && (
            <p className="text-sm text-gray-800 whitespace-pre-line">{explanation}</p>
          )}
          {!loading && !error && !explanation && (
            <p className="text-sm text-amber-700">No explanation available. Please try again or select a different portion of text.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
