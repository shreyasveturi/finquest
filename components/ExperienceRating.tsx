"use client";

import React from 'react';

type RatingOption = {
  id: string;
  label: string;
  emoji: string;
};

interface ExperienceRatingProps {
  value: string;
  onChange: (val: string) => void;
  title?: string;
  subtitle?: string;
}

const OPTIONS: RatingOption[] = [
  { id: 'amazing', label: 'Amazing', emoji: '🤩' },
  { id: 'good', label: 'Good', emoji: '😊' },
  { id: 'meh', label: 'Meh', emoji: '😐' },
  { id: 'sad', label: 'Sad', emoji: '😕' },
  { id: 'confused', label: 'Confused', emoji: '🤔' },
  { id: 'inspired', label: 'Inspired', emoji: '🚀' },
];

export default function ExperienceRating({ value, onChange, title, subtitle }: ExperienceRatingProps) {
  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-medium text-gray-800">{title}</p>}
      {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-150 flex items-center gap-3 ${
                active
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
              }`}
            >
              <span className="text-xl" aria-hidden>
                {opt.emoji}
              </span>
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}