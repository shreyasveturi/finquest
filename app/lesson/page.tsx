"use client";
import React, { useEffect, useMemo, useState } from 'react';
import ArticleViewer from '../../components/ArticleViewer';
import Modal from '../../components/Modal';
import PredictionCard from '../../components/PredictionCard';
import ReflectionCard from '../../components/ReflectionCard';
import InteractiveArticleWrapper from '../../components/InteractiveArticleWrapper';
import InterviewExplainModal from '../../components/InterviewExplainModal';
import { DEFAULT_CHOICES as DEFAULT_PREDICTION_CHOICES, PREDICTION_CORRECT_ID } from '../../components/PredictionCard';
import {
  ARTICLE_PARAGRAPHS,
  KEY_TERMS,
  CHECKPOINTS,
  ARTICLE_TITLE,
  ARTICLE_SOURCE,
  ARTICLE_URL,
  GOOGLE_FORM,
} from '../../content/rachelReevesBudget';
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
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [explainSelection, setExplainSelection] = useState('');
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [predictionChoice, setPredictionChoice] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scio_xp');
      const comp = localStorage.getItem('scio_completed');
      const hints = localStorage.getItem('scio_hints');
      const prediction = localStorage.getItem('scio_prediction_rachel-reeves-budget');
      if (raw) setXp(parseInt(raw, 10) || 0);
      if (comp) setCompleted(JSON.parse(comp));
      if (hints) setHintUsed(JSON.parse(hints));
      if (prediction) setPredictionChoice(prediction);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scio_xp', String(xp));
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('scio_completed', JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem('scio_hints', JSON.stringify(hintUsed));
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
    if (!trimmed) return;

    if (!completedSet.has(id)) {
      setXp((v) => Math.min(100, v + 20));
      const newCompleted = [...completed, id];
      setCompleted(newCompleted);

      if (newCompleted.length === CHECKPOINTS.length) {
        setTimeout(() => {
          setShowCompletionModal(true);
          setActiveCheckpoint(null);
        }, 1500);
      }
    }
    setSubmittedFor(id);
  }

  function closeCheckpointModal() {
    setActiveCheckpoint(null);
    setAnswer('');
    setSubmittedFor(null);
  }

  const level = getLevel(xp);
  const predictionLabel = DEFAULT_PREDICTION_CHOICES.find((c) => c.id === predictionChoice)?.label;
  const correctPredictionLabel = DEFAULT_PREDICTION_CHOICES.find((c) => c.id === PREDICTION_CORRECT_ID)?.label;
  const predictionWasCorrect = predictionChoice === PREDICTION_CORRECT_ID;

  return (
    <>
      <NavBar />
      <div className="w-full bg-white min-h-screen">
        {/* Sticky XP Bar */}
        <div className="w-full bg-white border-b border-gray-200 sticky top-16 z-30 backdrop-blur-sm bg-white/95">
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
              {completed.length}/{CHECKPOINTS.length} checkpoints complete
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-16 md:py-20">
          {/* Article Header */}
          <div className="w-full max-w-3xl mx-auto px-6 md:px-12 mb-16">
            <div className="mb-8 text-xs text-gray-500 bg-gray-50 border border-gray-200 p-3 rounded">
              <strong>Attribution:</strong> Based on Financial Times article "{ARTICLE_TITLE}" ({ARTICLE_SOURCE}).
              Authors: George Parker, Sam Fleming, Delphine Strauss, Ian Smith.
              <a href={ARTICLE_URL} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-1">
                Read original
              </a>
              . Used for educational purposes.
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">{ARTICLE_TITLE}</h1>
            <p className="text-gray-600 text-lg">Learn to discuss this topic with confidence</p>
          </div>

          {/* Step 1: Prediction */}
          <PredictionCard articleId="rachel-reeves-budget" />

          {/* Step 2: Article with Checkpoints */}
          <InteractiveArticleWrapper
            articleId="rachel-reeves-budget"
            onExplainRequest={(text) => {
              setExplainSelection(text);
              setShowExplainModal(true);
            }}
          >
            <ArticleViewer
              paragraphs={ARTICLE_PARAGRAPHS}
              keyTerms={KEY_TERMS}
              checkpoints={CHECKPOINTS}
              onStartCheckpoint={startCheckpoint}
              completedCheckpoints={completed}
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
          <ReflectionCard articleId="rachel-reeves-budget" />

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
        {activeCheckpoint && (
          (() => {
            const cp = CHECKPOINTS.find((c) => c.id === activeCheckpoint)!;
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
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                      <div className="font-semibold text-emerald-900 mb-2">✓ Feedback</div>
                      <p className="text-emerald-800 text-sm">
                        {answer.trim().length < 30
                          ? 'Try to go deeper: mention at least one of [tax revenues / productivity / market confidence].'
                          : 'Great effort! Compare your answer to the expert response below.'}
                      </p>
                    </div>

                    <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg">
                      <div className="font-semibold text-gray-900 mb-2">Expert Response</div>
                      <p className="text-gray-800 text-sm italic">{cp.modelAnswer}</p>
                    </div>

                    <button
                      onClick={closeCheckpointModal}
                      className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold text-lg transition-colors"
                    >
                      Continue Reading →
                    </button>
                  </div>
                )}
              </div>
            );
          })()
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
        articleTitle={ARTICLE_TITLE}
      />
    </>
  );
}
