"use client";
import React from 'react';
import KeyTermTooltip from './KeyTermTooltip';
import type { KeyTerm } from '../content/rachelReevesBudget';

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function AnnotatedParagraph({ text, keyTerms }: { text: string; keyTerms: KeyTerm[] }) {
  if (!keyTerms || keyTerms.length === 0) return <span className="leading-relaxed">{text}</span>;

  // Build regex to match any term (word boundaries to avoid partial matches)
  const termsSorted = [...keyTerms].sort((a, b) => b.term.length - a.term.length);
  const pattern = termsSorted.map((t) => escapeRegex(t.term)).join('|');
  const re = new RegExp(`(${pattern})`, 'gi');

  const parts = text.split(re);

  return (
    <span className="leading-relaxed text-slate-800">
      {parts.map((part, i) => {
        const match = termsSorted.find((t) => part.toLowerCase() === t.term.toLowerCase());
        if (match) {
          return (
            <KeyTermTooltip key={i} term={match} />
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
