/**
 * InteractiveArticleWrapper Component
 * 
 * Wraps article content to provide interactive features:
 * - Text selection detection for "Explain in Interview Terms" button
 * - Scroll depth tracking
 * - Timer management
 * - Maintains focus and reduces distractions
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { startArticleTimer, endArticleTimer, trackScrollDepth, trackInterviewExplainUse } from '@/lib/analytics';

interface InteractiveArticleWrapperProps {
  articleId: string;
  children: React.ReactNode;
  onExplainRequest?: (selectedText: string) => void;
}

export default function InteractiveArticleWrapper({
  articleId,
  children,
  onExplainRequest,
}: InteractiveArticleWrapperProps) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);
  const [timerStart] = useState(() => startArticleTimer());
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const element = wrapperRef.current;
      const scrollTop = element.scrollTop || window.scrollY;
      const docHeight = element.scrollHeight || document.documentElement.scrollHeight;
      const winHeight = element.clientHeight || window.innerHeight;

      const scrollPercent = Math.round(
        ((scrollTop + winHeight) / docHeight) * 100
      );

      trackScrollDepth(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // End timer on unmount
  useEffect(() => {
    return () => {
      endArticleTimer(timerStart);
    };
  }, [timerStart]);

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';

    console.log('[InteractiveArticleWrapper] handleMouseUp fired, selected text:', text);

    if (text.length > 0) {
      setSelectedText(text);

      // Get selection position relative to viewport
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelectionPos({
          top: rect.top - 40,
          left: rect.left,
        });
        console.log('[InteractiveArticleWrapper] Selection pos set:', { top: rect.top - 40, left: rect.left });
      }
    } else {
      setSelectedText('');
      setSelectionPos(null);
    }
  }, []);

  const handleExplain = () => {
    if (!selectedText) return;

    console.log('[InteractiveArticleWrapper] Explain clicked, selected text:', selectedText);
    trackInterviewExplainUse();
    if (onExplainRequest) {
      console.log('[InteractiveArticleWrapper] Calling onExplainRequest');
      onExplainRequest(selectedText);
    }

    // Clear selection
    setSelectedText('');
    setSelectionPos(null);
  };

  return (
    <div
      ref={wrapperRef}
      onMouseUp={handleMouseUp}
      className="relative w-full max-w-3xl mx-auto px-6 mb-8"
    >
      {children}

      {/* Selection Action Button */}
      {selectedText && selectionPos && (
        <div
          className="fixed z-50 bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded shadow-lg hover:bg-blue-700 cursor-pointer transition-colors"
          style={{
            top: `${selectionPos.top}px`,
            left: `${selectionPos.left}px`,
          }}
          onClick={handleExplain}
        >
          Explain: "{selectedText.slice(0, 30)}..."
        </div>
      )}
    </div>
  );
}
