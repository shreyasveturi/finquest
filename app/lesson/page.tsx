"use client";
import React, { useEffect, useMemo, useState } from 'react';
import ArticleViewer from '../../components/ArticleViewer';
import {
  ARTICLE_PARAGRAPHS,
  KEY_TERMS,
  CHECKPOINTS,
  ARTICLE_TITLE,
  ARTICLE_SOURCE,
  ARTICLE_URL,
  GOOGLE_FORM,
} from '../../content/rachelReevesBudget';
import Link from 'next/link';
import NavBar from '../../components/NavBar';


function getLevel(xp: number) {
  if (xp >= 80) return { name: 'Level 4: Market Maven', color: 'from-indigo-500 to-purple-500' };
  if (xp >= 50) return { name: 'Level 3: Policy Analyst', color: 'from-teal-500 to-indigo-500' };
  if (xp >= 20) return { name: 'Level 2: Policy Watcher', color: 'from-green-400 to-teal-500' };
  return { name: 'Level 1: Budget Rookie', color: 'from-blue-400 to-green-400' };
}

export default function LessonPage() {
  const [xp, setXp] = useState<number>(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState<Record<string, boolean>>({});
  const [activeCheckpoint, setActiveCheckpoint] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('finquest_xp');
      const comp = localStorage.getItem('finquest_completed');
      const hints = localStorage.getItem('finquest_hints');
      if (raw) setXp(parseInt(raw, 10) || 0);
      if (comp) setCompleted(JSON.parse(comp));
      if (hints) setHintUsed(JSON.parse(hints));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('finquest_xp', String(xp));
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('finquest_completed', JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem('finquest_hints', JSON.stringify(hintUsed));
  }, [hintUsed]);

  const completedSet = useMemo(() => new Set(completed), [completed]);

  function startCheckpoint(id: string) {
    setActiveCheckpoint(id);
    setAnswer('');
    setSubmittedFor(null);
  }

  function revealHint(id: string) {
    if (hintUsed[id]) return;
    setHintUsed((s) => ({ ...s, [id]: true }));
    setXp((v) => Math.max(0, v - 5));
  }

  function submitAnswer(id: string) {
    const cp = CHECKPOINTS.find((c) => c.id === id);
    if (!cp) return;

    const trimmed = answer.trim();
    if (!completedSet.has(id)) {
      setXp((v) => Math.min(100, v + 20));
      setCompleted((arr) => [...arr, id]);
    }
    setSubmittedFor(id);
  }

  const level = getLevel(xp);

  return (
    <>
      <NavBar />
      <div className="w-full bg-slate-50 min-h-screen">
        <section className="w-full py-8 md:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8">
              <div>
        <div className="mb-4 text-sm text-slate-600 bg-slate-50 border-l-4 border-blue-400 p-3 rounded">
          <strong>Educational Attribution:</strong> Based on the Financial Times article "{ARTICLE_TITLE}" ({ARTICLE_SOURCE}). 
          Authors: George Parker, Sam Fleming, Delphine Strauss, Ian Smith. 
          <a href={ARTICLE_URL} target="_blank" rel="noreferrer" className="text-blue-600 ml-1">Read the original</a>.
          Used here for educational purposes only. Not affiliated with the Financial Times.
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-slate-900">{ARTICLE_TITLE}</h2>
        <ArticleViewer paragraphs={ARTICLE_PARAGRAPHS} keyTerms={KEY_TERMS} checkpoints={CHECKPOINTS} onStartCheckpoint={startCheckpoint} />
        <div className="mt-8 text-sm text-slate-500">Original article: <a href={ARTICLE_URL} target="_blank" rel="noreferrer" className="text-blue-600">FT link</a></div>

                </div>

                <aside className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">XP Points</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{xp}</div>
            </div>
            <div className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{level.name}</div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div className={`h-3 rounded-full bg-gradient-to-r ${level.color} transition-all duration-300`} style={{ width: `${Math.min(100, xp)}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-2">{xp} / 100 points</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-slate-900">Current Challenge</div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">{completed.length}/{CHECKPOINTS.length}</div>
          </div>

          {!activeCheckpoint && (
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">📖 Start a checkpoint from the article above.</div>
          )}

          {activeCheckpoint && (
            (() => {
              const cp = CHECKPOINTS.find((c) => c.id === activeCheckpoint)!;
              return (
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-slate-900 mb-2">{cp.title}</div>
                    <div className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg border border-blue-100">{cp.prompt}</div>
                  </div>

                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg h-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your analysis here..."
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => submitAnswer(cp.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium"
                    >
                      ✓ Check Answer
                    </button>
                    <button
                      onClick={() => revealHint(cp.id)}
                      className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                    >
                      💡 Hint
                    </button>
                  </div>

                  {hintUsed[cp.id] && (
                    <div className="text-sm bg-amber-50 border border-amber-200 p-3 rounded-lg text-slate-700">
                      <div className="font-semibold text-amber-900 mb-1">Hint (−5 XP)</div>
                      {cp.hint}
                    </div>
                  )}

                  {submittedFor === cp.id && (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-900">Feedback</div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm text-slate-700">
                        {answer.trim().length < 30 ? (
                          <div>Try to go a bit deeper: mention at least one of [tax revenues / productivity / market confidence].</div>
                        ) : (
                          <div>✓ Great effort! Compare your answer to the expert response below to see what you missed.</div>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-slate-900">Expert Response</div>
                      <div className="bg-slate-100 border border-slate-300 p-3 rounded-lg text-sm text-slate-700 italic">
                        {cp.modelAnswer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="font-bold mb-2">📢 Join the Beta</div>
          <p className="text-sm text-blue-100 mb-4">Be part of our early community and shape the future.</p>
          <a href={GOOGLE_FORM} target="_blank" rel="noreferrer" className="block w-full bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-semibold text-center">
            Sign Up
          </a>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-sm text-slate-700">
          {completed.length === CHECKPOINTS.length ? (
            <div className="space-y-2">
              <div className="font-semibold text-slate-900">🎉 All Done!</div>
              <p>You've mastered the Budget. Ready to level up?</p>
              <a href={GOOGLE_FORM} target="_blank" rel="noreferrer" className="block mt-3 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium text-center">
                Join Us
              </a>
            </div>
          ) : (
            <div className="text-slate-600">Complete all {CHECKPOINTS.length} checkpoints to unlock extras.</div>
          )}
        </div>
                </aside>
              </div>
            </div>
          </section>
        </div>
      </>
  );
}
