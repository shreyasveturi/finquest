"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import ArticleViewer from '@/components/ArticleViewer';
import Modal from '@/components/Modal';
import PredictionCard, { DEFAULT_CHOICES as DEFAULT_PREDICTION_CHOICES, PREDICTION_CORRECT_ID } from '@/components/PredictionCard';
import ReflectionCard from '@/components/ReflectionCard';
import InteractiveArticleWrapper from '@/components/InteractiveArticleWrapper';
import InterviewExplainModal from '@/components/InterviewExplainModal';
import { LESSONS, DEFAULT_LESSON_SLUG, GOOGLE_FORM } from '@/data/lessons';
import type { Lesson, ReasoningLinksBlock } from '@/types/lesson';
import type { CheckpointFeedback } from '@/types/checkpoint';

function getLesson(slug: string | undefined): Lesson {
  const found = LESSONS.find((l) => l.slug === slug);
  if (found) return found;
  const fallback = LESSONS.find((l) => l.slug === DEFAULT_LESSON_SLUG);
  if (!fallback) throw new Error('Default lesson not found');
  return fallback;
}

function storageKey(name: string, slug: string) {
  return `scio_${name}_${slug}`;
}

export default function LessonPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const lesson = getLesson(slugParam || DEFAULT_LESSON_SLUG);

  const [xp, setXp] = useState<number>(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState<Record<string, boolean>>({});
  const [activeCheckpoint, setActiveCheckpoint] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [explainSelection, setExplainSelection] = useState('');
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [predictionChoice, setPredictionChoice] = useState('');
  const [feedback, setFeedback] = useState<CheckpointFeedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [reasoningBlock, setReasoningBlock] = useState<ReasoningLinksBlock | null>(null);

  const lessonSlug = lesson.slug;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey('xp', lessonSlug)) || (lessonSlug === DEFAULT_LESSON_SLUG ? localStorage.getItem('scio_xp') : null);
      const comp = localStorage.getItem(storageKey('completed', lessonSlug)) || (lessonSlug === DEFAULT_LESSON_SLUG ? localStorage.getItem('scio_completed') : null);
      const hints = localStorage.getItem(storageKey('hints', lessonSlug)) || (lessonSlug === DEFAULT_LESSON_SLUG ? localStorage.getItem('scio_hints') : null);
      const prediction = localStorage.getItem(`scio_prediction_${lesson.articleId}`);
      if (raw) setXp(parseInt(raw, 10) || 0);
      if (comp) setCompleted(JSON.parse(comp));
      if (hints) setHintUsed(JSON.parse(hints));
      if (prediction) setPredictionChoice(prediction);
    } catch (e) {
      // ignore
    }
  }, [lessonSlug, lesson.articleId]);

  useEffect(() => {
    localStorage.setItem(storageKey('xp', lessonSlug), String(xp));
  }, [xp, lessonSlug]);

  useEffect(() => {
    localStorage.setItem(storageKey('completed', lessonSlug), JSON.stringify(completed));
  }, [completed, lessonSlug]);

  useEffect(() => {
    localStorage.setItem(storageKey('hints', lessonSlug), JSON.stringify(hintUsed));
  }, [hintUsed, lessonSlug]);

  const completedSet = useMemo(() => new Set(completed), [completed]);

  function startCheckpoint(id: string) {
    setActiveCheckpoint(id);
    setAnswer('');
    setSubmittedFor(null);
    setFeedback(null);
    setFeedbackLoading(false);
    setFeedbackError(false);
  }

  function revealHint(id: string) {
    if (hintUsed[id]) return;
    setHintUsed((s) => ({ ...s, [id]: true }));
    setXp((v) => Math.max(0, v - 5));
  }

  async function submitAnswer(id: string) {
    const cp = lesson.checkpoints.find((c) => c.id === id);
    if (!cp) return;

    const trimmed = answer.trim();
    if (!trimmed) return;

    if (!completedSet.has(id)) {
      setXp((v) => Math.min(100, v + 20));
      const newCompleted = [...completed, id];
      setCompleted(newCompleted);

      if (newCompleted.length === lesson.checkpoints.length) {
        setTimeout(() => {
          setShowCompletionModal(true);
          setActiveCheckpoint(null);
        }, 1500);
      }
    }
    setSubmittedFor(id);

    setFeedbackLoading(true);
    setFeedbackError(false);
    setFeedback(null);

    try {
      const response = await fetch('/api/checkpoint-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cp.prompt,
          userAnswer: trimmed,
          context: cp.helperText || '',
          articleTitle: lesson.articleTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error('Error fetching checkpoint feedback:', error);
      setFeedbackError(true);
    } finally {
      setFeedbackLoading(false);
    }
  }

  function closeCheckpointModal() {
    setActiveCheckpoint(null);
    setAnswer('');
    setSubmittedFor(null);
    setFeedback(null);
    setFeedbackLoading(false);
    setFeedbackError(false);
  }

  const level = (() => {
    if (xp >= 80) return { name: 'Level 4: Market Maven', color: 'from-indigo-500 to-purple-500' };
    if (xp >= 50) return { name: 'Level 3: Policy Analyst', color: 'from-teal-500 to-indigo-500' };
    if (xp >= 20) return { name: 'Level 2: Policy Watcher', color: 'from-green-400 to-teal-500' };
    return { name: 'Level 1: Budget Rookie', color: 'from-blue-400 to-green-400' };
  })();

  const predictionLabel = DEFAULT_PREDICTION_CHOICES.find((c) => c.id === predictionChoice)?.label;
  const correctPredictionLabel = DEFAULT_PREDICTION_CHOICES.find((c) => c.id === (lesson.predictionCorrectId || PREDICTION_CORRECT_ID))?.label;
  const predictionWasCorrect = predictionChoice === (lesson.predictionCorrectId || PREDICTION_CORRECT_ID);

  return (
    <>
      <div className="w-full bg-white min-h-screen">
        {/* Sticky XP Bar */}
        <div className="w-full bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">{level.name}</div>
              <div className="text-sm font-semibold text-gray-900">{xp} / 100 XP</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${level.color} transition-all duration-300`}
                style={{ width: `${Math.min(100, xp)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              {completed.length}/{lesson.checkpoints.length} checkpoints complete
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-16 md:py-20">
          {/* Article Header */}
          <div className="w-full max-w-3xl mx-auto px-6 md:px-12 mb-16">
            <div className="mb-8 text-xs text-gray-500 bg-gray-50 border border-gray-200 p-3 rounded">
              <strong>Attribution:</strong> {lesson.attribution}{' '}
              {lesson.articleUrl && (
                <a
                  href={lesson.articleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 hover:text-blue-800 underline underline-offset-2"
                >
                  (Original article)
                </a>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">{lesson.articleTitle}</h1>
            <p className="text-gray-600 text-lg">Learn to discuss this topic with confidence</p>
          </div>

          {/* Step 1: Prediction */}
          <PredictionCard
            articleId={lesson.articleId}
            choices={lesson.predictionChoices || DEFAULT_PREDICTION_CHOICES}
          />

          {/* Step 2: Article with Checkpoints */}
          <InteractiveArticleWrapper
            articleId={lesson.articleId}
            onExplainRequest={(text) => {
              setExplainSelection(text);
              setShowExplainModal(true);
            }}
          >
            <ArticleViewer
              paragraphs={lesson.paragraphs}
              keyTerms={lesson.keyTerms}
              checkpoints={lesson.checkpoints}
              onStartCheckpoint={startCheckpoint}
              completedCheckpoints={completed}
              reasoningLinks={lesson.reasoningLinks}
              onOpenReasoningLinks={setReasoningBlock}
            />
          </InteractiveArticleWrapper>

          {/* Prediction Outcome */}
          {predictionChoice && (
            <div className="w-full max-w-3xl mx-auto px-6 mb-12">
              <div className={`border rounded-lg p-6 flex flex-col gap-3 ${predictionWasCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <div className="font-semibold text-gray-900">Prediction result</div>
                </div>
                <div className="text-sm text-gray-800">Your pick: {predictionLabel || 'Not set'}</div>
                <div className="text-sm text-gray-800">Expected outcome: {correctPredictionLabel || 'Defined in lesson'}</div>
                <div className="text-sm font-medium text-gray-900">
                  {predictionWasCorrect ? 'You nailed the setup.' : 'Compare your pick to what actually happened.'}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Reflection */}
          <ReflectionCard articleId={lesson.articleId} />

          {/* XP Summary */}
          <div className="w-full max-w-3xl mx-auto px-6 mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📊</span> Your Progress
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{xp}</div>
                  <div className="text-xs text-gray-600 mt-1">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completed.length}</div>
                  <div className="text-xs text-gray-600 mt-1">Checkpoints Done</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{level.name.split(':')[0]}</div>
                  <div className="text-xs text-gray-600 mt-1">Your Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkpoint Modal */}
      <Modal isOpen={!!activeCheckpoint} onClose={closeCheckpointModal}>
        {activeCheckpoint && (() => {
          const cp = lesson.checkpoints.find((c) => c.id === activeCheckpoint)!;
          return (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🎯</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{cp.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{cp.helperText}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-gray-900 font-semibold">{cp.prompt}</p>
              </div>

              <textarea
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setSubmittedFor(null);
                }}
                className="w-full p-4 border border-gray-300 rounded-lg h-40 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 resize-none"
                placeholder="Type your analysis here..."
              />

              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => submitAnswer(cp.id)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold text-lg transition-all"
                >
                  ✓ Check Answer
                </button>
                <button
                  onClick={() => revealHint(cp.id)}
                  className="px-5 py-3 border-2 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg font-semibold transition-colors"
                >
                  💡 Hint (-5 XP)
                </button>
              </div>

              {hintUsed[cp.id] && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                  <div className="font-semibold text-amber-900 mb-2">💡 Hint</div>
                  <p className="text-amber-800 text-sm">{cp.hint}</p>
                </div>
              )}

              {submittedFor === cp.id && (
                <div className="space-y-4">
                  {feedbackLoading && (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-blue-800 font-medium">Generating interview feedback...</p>
                    </div>
                  )}

                  {feedbackError && !feedbackLoading && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <div className="font-semibold text-amber-900 mb-2">⚠️ Feedback unavailable</div>
                      <p className="text-amber-800 text-sm mb-3">
                        We couldn't generate feedback right now. Here are some general tips:
                      </p>
                      <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
                        <li>Structure your answer clearly with a logical flow</li>
                        <li>Link your points to market or policy implications</li>
                      </ul>
                    </div>
                  )}

                  {feedback && !feedbackLoading && (
                    <>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-lg">
                        <div className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                          🎯 Interview Feedback
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Structure</div>
                            <div className="text-2xl font-bold text-blue-600">{feedback.scores?.structure}/10</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Commercial Awareness</div>
                            <div className="text-2xl font-bold text-blue-600">{feedback.scores?.commercialAwareness}/10</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Clarity</div>
                            <div className="text-2xl font-bold text-blue-600">{feedback.scores?.clarity}/10</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Specificity</div>
                            <div className="text-2xl font-bold text-blue-600">{feedback.scores?.specificity}/10</div>
                          </div>
                        </div>

                        {feedback.strengths?.length > 0 && (
                          <div className="mb-4">
                            <div className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                              <span>✓</span> Strengths
                            </div>
                            <ul className="text-sm text-gray-800 space-y-1">
                              {feedback.strengths.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-600 mt-0.5">•</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {feedback.improvements?.length > 0 && (
                          <div className="mb-4">
                            <div className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                              <span>↑</span> Improvements
                            </div>
                            <ul className="text-sm text-gray-800 space-y-1">
                              {feedback.improvements.map((imp: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-amber-600 mt-0.5">•</span>
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {feedback.missingLinks?.length > 0 && (
                          <div className="mb-4">
                            <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                              <span>🔗</span> Missing Links
                            </div>
                            <ul className="text-sm text-gray-800 space-y-1">
                              {feedback.missingLinks.map((link: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-0.5">•</span>
                                  <span>{link}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 border border-gray-300 p-4 rounded-lg">
                        <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span>💡</span> Better Answer (Suggested)
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed">{feedback.betterAnswer}</p>
                      </div>

                      {feedback.followUps?.length > 0 && (
                        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                          <div className="font-semibold text-indigo-900 mb-2">🤔 Likely Follow-ups</div>
                          <ul className="text-sm text-indigo-800 space-y-1">
                            {feedback.followUps.map((q: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-indigo-600 mt-0.5">•</span>
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={closeCheckpointModal}
                    className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold text-lg transition-colors"
                    disabled={feedbackLoading}
                  >
                    Continue Reading →
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Reasoning Links Modal */}
      <Modal isOpen={!!reasoningBlock} onClose={() => setReasoningBlock(null)}>
        {reasoningBlock && (
          <div className="p-6 md:p-8 max-w-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 font-semibold">Reasoning links</p>
                <h3 className="text-2xl font-bold text-gray-900">Connect macro to markets</h3>
              </div>
              <button onClick={() => setReasoningBlock(null)} className="text-sm text-gray-500 hover:text-gray-700 font-semibold">Close</button>
            </div>
            <p className="text-sm text-gray-700 mb-4">{reasoningBlock.summary}</p>
            <div className="space-y-3">
              {reasoningBlock.links.map((link, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="font-semibold text-gray-900">{link.title}</div>
                  <div className="text-sm text-gray-700 leading-relaxed">{link.prompt}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Completion Modal */}
      <Modal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)}>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Congratulations!</h2>
          <p className="text-lg text-gray-700 mb-6">
            You've completed all checkpoints and earned{' '}
            <span className="font-bold text-blue-600">{xp} XP</span>!
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <p className="text-gray-800 font-medium mb-4">
              If you enjoyed this demo, you'll love the full experience:
            </p>
            <ul className="text-left text-sm text-gray-700 space-y-2 mb-4">
              <li>✓ Daily finance news articles with checkpoints</li>
              <li>✓ Compete in duels against other learners</li>
              <li>✓ Join clans and climb leaderboards</li>
              <li>✓ Track your skill map across markets & sectors</li>
            </ul>
          </div>

          <a
            href={GOOGLE_FORM}
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-bold text-lg mb-3 transition-all"
          >
            Join the Beta →
          </a>

          <button
            onClick={() => setShowCompletionModal(false)}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Interview Explain Modal */}
      <InterviewExplainModal
        isOpen={showExplainModal}
        onClose={() => setShowExplainModal(false)}
        selectedText={explainSelection}
        articleTitle={lesson.articleTitle}
      />
    </>
  );
}
