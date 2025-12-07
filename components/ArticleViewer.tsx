"use client";
import React from 'react';
import AnnotatedParagraph from './AnnotatedParagraph';
import type { ArticleParagraph, KeyTerm, Checkpoint } from '../content/rachelReevesBudget';

export default function ArticleViewer({
  paragraphs,
  keyTerms,
  checkpoints,
  onStartCheckpoint,
  completedCheckpoints = [],
}: {
  paragraphs: ArticleParagraph[];
  keyTerms: KeyTerm[];
  checkpoints: Checkpoint[];
  onStartCheckpoint: (id: string) => void;
  completedCheckpoints?: string[];
}) {
  // Find which checkpoint index we're currently on
  const nextCheckpointIndex = checkpoints.findIndex((c) => !completedCheckpoints.includes(c.id));
  const currentCheckpointId = nextCheckpointIndex >= 0 ? checkpoints[nextCheckpointIndex].id : null;

  // Pre-calculate which terms have already appeared before each paragraph
  // This ensures consistent rendering between server and client
  const usedTermsByParagraph = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    const globalUsed = new Set<string>();
    
    paragraphs.forEach((p) => {
      // Store what's been used BEFORE this paragraph
      map.set(p.id, new Set(globalUsed));
      
      // Find terms in this paragraph and mark them as used
      const termsSorted = [...keyTerms].sort((a, b) => b.term.length - a.term.length);
      const pattern = termsSorted.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const re = new RegExp(`(${pattern})`, 'gi');
      const parts = p.text.split(re);
      
      parts.forEach((part) => {
        const match = termsSorted.find((t) => part.toLowerCase() === t.term.toLowerCase());
        if (match) {
          globalUsed.add(match.term.toLowerCase());
        }
      });
    });
    
    return map;
  }, [paragraphs, keyTerms]);

  return (
    <div className="space-y-8">
      {paragraphs.map((p, idx) => {
        // Find the paragraph index of the next incomplete checkpoint
        let firstIncompleteCheckpointParagraphIndex = -1;
        if (nextCheckpointIndex >= 0) {
          const nextCheckpoint = checkpoints[nextCheckpointIndex];
          firstIncompleteCheckpointParagraphIndex = paragraphs.findIndex(
            (para) => para.checkpointId === nextCheckpoint.id
          );
        }
        
        // Blur all paragraphs after the first incomplete checkpoint
        const shouldBlur = firstIncompleteCheckpointParagraphIndex >= 0 && idx > firstIncompleteCheckpointParagraphIndex;

        return (
          <div key={p.id} className="relative">
            <div className={`text-base text-gray-900 leading-relaxed mb-6 transition-all duration-300 ${shouldBlur ? 'blur-sm opacity-50 pointer-events-none select-none' : ''}`}>
              <AnnotatedParagraph text={p.text} keyTerms={keyTerms} usedTerms={usedTermsByParagraph.get(p.id)} />
            </div>

            {p.checkpointId && (
              <div className="mt-6">
                {checkpoints
                  .filter((c) => c.id === p.checkpointId)
                  .map((c) => {
                    const isCompleted = completedCheckpoints.includes(c.id);
                    const isCurrent = c.id === currentCheckpointId;
                    
                    return (
                      <div 
                        key={c.id} 
                        className={`border rounded-xl p-5 mt-4 transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' 
                            : isCurrent
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                            : 'bg-slate-100 border-slate-200 blur-sm opacity-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{isCompleted ? '✅' : '🎯'}</span>
                              <div className="font-semibold text-slate-900">
                                {isCompleted ? 'Completed: ' : 'Checkpoint: '}{c.title}
                              </div>
                            </div>
                            {!isCompleted && <div className="text-slate-600 text-sm mt-1 ml-6">{c.helperText}</div>}
                          </div>
                          {!isCompleted && isCurrent && (
                            <button
                              onClick={() => onStartCheckpoint(c.id)}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap font-medium"
                            >
                              Start
                            </button>
                          )}
                          {!isCompleted && !isCurrent && (
                            <div className="text-sm text-slate-500 px-4 py-2">
                              🔒 Locked
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
