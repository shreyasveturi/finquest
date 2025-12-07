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
      <div className="max-w-xl w-full p-6 md:p-8 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-gray-500 font-semibold">AI explain</p>
            <h2 className="text-2xl font-bold text-gray-900">Interview-ready framing</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-500 tracking-[0.08em] mb-1">SELECTED TEXT</p>
            <p className="text-gray-900 leading-relaxed">“{selectedText}”</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">💡</span>
              <p className="text-[11px] font-semibold text-blue-700 tracking-[0.08em]">HOW TO EXPLAIN IT</p>
            </div>

            {loading && (
              <p className="text-sm text-gray-700">Generating a concise, interview-friendly take…</p>
            )}

            {!loading && error && (
              <p className="text-sm text-rose-700">{error}</p>
            )}

            {!loading && !error && explanation && (
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">{explanation}</p>
            )}

            {!loading && !error && !explanation && (
              <p className="text-sm text-amber-700">No explanation available. Please try again or select a different portion of text.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
