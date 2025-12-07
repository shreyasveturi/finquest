"use client";
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import type { KeyTerm } from '../content/rachelReevesBudget';

export default function KeyTermTooltip({ term }: { term: KeyTerm }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  function openWithPosition() {
    if (!ref.current) {
      setOpen(true);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const margin = 16;
    let left = rect.left;
    
    // Keep inside viewport horizontally
    if (left + tooltipWidth + margin > window.innerWidth) {
      left = Math.max(margin, window.innerWidth - tooltipWidth - margin);
    }
    
    // Position below the term with some spacing
    let top = rect.bottom + 12;
    
    // If tooltip would go below viewport, position above instead
    const tooltipHeight = 200; // approximate
    if (top + tooltipHeight + margin > window.innerHeight) {
      top = rect.top - tooltipHeight - 12;
    }
    
    setPos({ left, top });
    setOpen(true);
  }

  return (
    <span className="inline-block relative">
      <button
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          if (open) setOpen(false);
          else openWithPosition();
        }}
        onMouseEnter={() => openWithPosition()}
        onMouseLeave={() => setOpen(false)}
        className="rounded-sm px-[2px] py-[1px] text-neutral-800 hover:text-neutral-900 underline decoration-dotted underline-offset-2 decoration-neutral-400 hover:bg-yellow-50 transition-colors duration-150 ease-out cursor-pointer"
        aria-expanded={open}
      >
        {term.term}
      </button>

      {open && pos
        ? createPortal(
            <div
              style={{ left: pos.left, top: pos.top }}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              className="fixed z-50 w-80 max-w-[320px] bg-white border border-neutral-200 shadow-md rounded-xl p-4 animate-tooltip"
            >
              <div className="text-xs uppercase tracking-wide text-neutral-500 font-semibold mb-2">Explanation</div>
              <div className="font-semibold text-neutral-900 mb-2">{term.term}</div>
              <div className="text-sm text-neutral-700 leading-relaxed mb-3">{term.friendlyDefinition}</div>
              <div className="text-sm text-neutral-600 leading-relaxed italic">💡 Why it matters: {term.whyItMatters}</div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
