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
    const tooltipWidth = 288; // w-72
    const margin = 8;
    let left = rect.left;
    // try keep inside viewport
    if (left + tooltipWidth + margin > window.innerWidth) {
      left = Math.max(margin, window.innerWidth - tooltipWidth - margin);
    }
    const top = rect.bottom + 8;
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
        className="rounded-sm border-b-2 border-dotted border-emerald-500 text-emerald-600 hover:text-emerald-700 px-[2px] py-[1px] font-medium cursor-help"
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
              className="fixed z-50 w-72 bg-white border border-slate-200 shadow-lg rounded-lg p-3 text-sm"
            >
              <div className="font-semibold text-slate-900">{term.term}</div>
              <div className="text-slate-700 mt-2">{term.friendlyDefinition}</div>
              <div className="text-slate-600 mt-2 italic text-xs">💡 Why it matters: {term.whyItMatters}</div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
