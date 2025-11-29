"use client";
import React from 'react';
import AnnotatedParagraph from './AnnotatedParagraph';
import type { ArticleParagraph, KeyTerm, Checkpoint } from '../content/rachelReevesBudget';

export default function ArticleViewer({
  paragraphs,
  keyTerms,
  checkpoints,
  onStartCheckpoint,
}: {
  paragraphs: ArticleParagraph[];
  keyTerms: KeyTerm[];
  checkpoints: Checkpoint[];
  onStartCheckpoint: (id: string) => void;
}) {
  return (
    <div className="space-y-8">
      {paragraphs.map((p) => (
        <div key={p.id}>
          <div className="text-base text-slate-800 leading-relaxed mb-6">
            <AnnotatedParagraph text={p.text} keyTerms={keyTerms} />
          </div>

          {p.checkpointId && (
            <div className="mt-6">
              {checkpoints
                .filter((c) => c.id === p.checkpointId)
                .map((c) => (
                  <div key={c.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎯</span>
                          <div className="font-semibold text-slate-900">Checkpoint: {c.title}</div>
                        </div>
                        <div className="text-slate-600 text-sm mt-1 ml-6">{c.helperText}</div>
                      </div>
                      <button
                        onClick={() => onStartCheckpoint(c.id)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap font-medium"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
