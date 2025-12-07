"use client";

import React from 'react';

type Choice = {
  id: string;
  label: string;
};

interface MultipleChoiceCardProps {
  label?: string;
  choices: Choice[];
  value: string;
  onChange: (val: string) => void;
}

export default function MultipleChoiceCard({ label, choices, value, onChange }: MultipleChoiceCardProps) {
  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium text-gray-800">{label}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {choices.map((choice) => {
          const active = value === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChange(choice.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 ${
                active
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
              }`}
            >
              <span className="text-sm font-medium">{choice.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}