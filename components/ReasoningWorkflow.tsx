'use client';

import React, { useState } from 'react';
import Modal from './Modal';

type WorkflowStep = 'inputs' | 'channels' | 'stakeholders' | 'compare' | 'interview';

interface ReasoningWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  expertReasoning: {
    shock: string;
    channel: string;
    impact: string;
    channels: string[];
    winners: string[];
    losers: string[];
  };
  articleTitle: string;
}

const AVAILABLE_CHANNELS = [
  'Inflation / prices',
  'Supply chains',
  'Retaliation / geopolitics',
  'Investment / capex',
  'Sentiment / risk premium',
  'Regulation / national security',
];

const STAKEHOLDER_OPTIONS = [
  'US consumers',
  'US chipmakers',
  'Chinese firms',
  'Global manufacturers',
];

export default function ReasoningWorkflow({
  isOpen,
  onClose,
  onComplete,
  expertReasoning,
  articleTitle,
}: ReasoningWorkflowProps) {
  const [step, setStep] = useState<WorkflowStep>('inputs');
  const [shock, setShock] = useState('');
  const [channelInput, setChannelInput] = useState('');
  const [impact, setImpact] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [losers, setLosers] = useState<string[]>([]);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [completed, setCompleted] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!shock.trim()) newErrors.shock = 'Shock is required';
    if (!channelInput.trim()) newErrors.channel = 'Channel is required';
    if (!impact.trim()) newErrors.impact = 'Impact is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateChannels = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (selectedChannels.length === 0) {
      newErrors.channels = 'Select at least one channel';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStakeholders = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (winners.length === 0) newErrors.winners = 'Select at least one winner';
    if (losers.length === 0) newErrors.losers = 'Select at least one loser';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels((prev) => {
      if (prev.includes(channel)) {
        return prev.filter((c) => c !== channel);
      } else if (prev.length < 2) {
        return [...prev, channel];
      }
      return prev;
    });
  };

  const handleStakeholderToggle = (stakeholder: string, type: 'winner' | 'loser') => {
    if (type === 'winner') {
      setWinners((prev) =>
        prev.includes(stakeholder)
          ? prev.filter((w) => w !== stakeholder)
          : [...prev, stakeholder]
      );
    } else {
      setLosers((prev) =>
        prev.includes(stakeholder)
          ? prev.filter((l) => l !== stakeholder)
          : [...prev, stakeholder]
      );
    }
  };

  const handleNext = (nextStep: WorkflowStep) => {
    if (step === 'inputs' && !validateInputs()) return;
    if (step === 'channels' && !validateChannels()) return;
    if (step === 'stakeholders' && !validateStakeholders()) return;
    setErrors({});
    setStep(nextStep);
  };

  const handleSubmit = () => {
    setCompleted(true);
    setStep('compare');
  };

  const handleInterviewComplete = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 md:p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 font-semibold">
            Reasoning Links Workflow
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Build Your Reasoning
          </h2>
          <p className="text-gray-600 mt-2">
            Attempt first. Compare second.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-1 mb-2">
            {(['inputs', 'channels', 'stakeholders', 'compare', 'interview'] as const).map(
              (s) => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    ['inputs', 'channels', 'stakeholders', 'compare', 'interview'].indexOf(s) <=
                    ['inputs', 'channels', 'stakeholders', 'compare', 'interview'].indexOf(step)
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                />
              )
            )}
          </div>
          <p className="text-xs text-gray-600">
            Step {['inputs', 'channels', 'stakeholders', 'compare', 'interview'].indexOf(step) + 1} of 5
          </p>
        </div>

        {/* Step 1: Inputs */}
        {step === 'inputs' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Step 1: Your Reasoning</h3>
              <p className="text-sm text-gray-700 mb-4">
                Complete these three fields based on the article. Be concise—1–2 lines each.
              </p>

              <div className="space-y-4">
                {/* Shock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    What changed? (Shock)
                  </label>
                  <textarea
                    value={shock}
                    onChange={(e) => setShock(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm h-16 resize-none ${
                      errors.shock
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Describe the key event or change in the news..."
                  />
                  {errors.shock && (
                    <p className="text-red-600 text-xs mt-1">{errors.shock}</p>
                  )}
                </div>

                {/* Channel Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    How does it transmit? (Channel)
                  </label>
                  <textarea
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm h-16 resize-none ${
                      errors.channel
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Explain the mechanism or path from event to market impact..."
                  />
                  {errors.channel && (
                    <p className="text-red-600 text-xs mt-1">{errors.channel}</p>
                  )}
                </div>

                {/* Impact */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Who / what is affected? (Impact)
                  </label>
                  <textarea
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm h-16 resize-none ${
                      errors.impact
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="List affected parties, sectors, or asset classes..."
                  />
                  {errors.impact && (
                    <p className="text-red-600 text-xs mt-1">{errors.impact}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleNext('channels')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Next: Select Channels →
            </button>
          </div>
        )}

        {/* Step 2: Channels */}
        {step === 'channels' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Step 2: Transmission Channels</h3>
              <p className="text-sm text-gray-700 mb-4">
                Select 1–2 channels through which the shock transmits to markets:
              </p>

              <div className="space-y-2">
                {AVAILABLE_CHANNELS.map((channel) => (
                  <label
                    key={channel}
                    className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: selectedChannels.includes(channel)
                        ? '#2563eb'
                        : '#e5e7eb',
                      backgroundColor: selectedChannels.includes(channel)
                        ? '#eff6ff'
                        : 'white',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel)}
                      onChange={() => handleChannelToggle(channel)}
                      className="w-5 h-5 accent-blue-600"
                      disabled={
                        selectedChannels.length >= 2 &&
                        !selectedChannels.includes(channel)
                      }
                    />
                    <span className="font-medium text-gray-900">{channel}</span>
                  </label>
                ))}
              </div>

              {errors.channels && (
                <p className="text-red-600 text-sm mt-3">{errors.channels}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('inputs')}
                className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => handleNext('stakeholders')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Next: Winners/Losers →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Winners/Losers */}
        {step === 'stakeholders' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Step 3: Winners & Losers</h3>
              <p className="text-sm text-gray-700 mb-4">
                Tag at least one winner and one loser:
              </p>

              <div className="space-y-6">
                {/* Winners */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🟢</span> Winners
                  </h4>
                  <div className="space-y-2">
                    {STAKEHOLDER_OPTIONS.map((stakeholder) => (
                      <label
                        key={stakeholder}
                        className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                        style={{
                          borderColor: winners.includes(stakeholder)
                            ? '#059669'
                            : '#e5e7eb',
                          backgroundColor: winners.includes(stakeholder)
                            ? '#ecfdf5'
                            : 'white',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={winners.includes(stakeholder)}
                          onChange={() => handleStakeholderToggle(stakeholder, 'winner')}
                          className="w-5 h-5 accent-emerald-600"
                        />
                        <span className="font-medium text-gray-900">{stakeholder}</span>
                      </label>
                    ))}
                  </div>
                  {errors.winners && (
                    <p className="text-red-600 text-sm mt-2">{errors.winners}</p>
                  )}
                </div>

                {/* Losers */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔴</span> Losers
                  </h4>
                  <div className="space-y-2">
                    {STAKEHOLDER_OPTIONS.map((stakeholder) => (
                      <label
                        key={stakeholder}
                        className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                        style={{
                          borderColor: losers.includes(stakeholder)
                            ? '#dc2626'
                            : '#e5e7eb',
                          backgroundColor: losers.includes(stakeholder)
                            ? '#fef2f2'
                            : 'white',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={losers.includes(stakeholder)}
                          onChange={() => handleStakeholderToggle(stakeholder, 'loser')}
                          className="w-5 h-5 accent-red-600"
                        />
                        <span className="font-medium text-gray-900">{stakeholder}</span>
                      </label>
                    ))}
                  </div>
                  {errors.losers && (
                    <p className="text-red-600 text-sm mt-2">{errors.losers}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('channels')}
                className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
              >
                Submit & Compare →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Compare */}
        {step === 'compare' && completed && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Step 4: Compare Your Reasoning</h3>
              <p className="text-sm text-gray-700 mb-4">
                See how your analysis stacks up against Scio's expert reasoning:
              </p>

              <div className="space-y-6">
                {/* Shock */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">Your Shock</h4>
                    <p className="text-sm text-blue-800">{shock}</p>
                  </div>
                  <div className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-bold text-indigo-900 mb-2">Scio's Shock</h4>
                    <p className="text-sm text-indigo-800">{expertReasoning.shock}</p>
                  </div>
                </div>

                {/* Channel */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">Your Channel</h4>
                    <p className="text-sm text-blue-800">{channelInput}</p>
                  </div>
                  <div className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-bold text-indigo-900 mb-2">Scio's Channel</h4>
                    <p className="text-sm text-indigo-800">{expertReasoning.channel}</p>
                  </div>
                </div>

                {/* Impact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">Your Impact</h4>
                    <p className="text-sm text-blue-800">{impact}</p>
                  </div>
                  <div className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-bold text-indigo-900 mb-2">Scio's Impact</h4>
                    <p className="text-sm text-indigo-800">{expertReasoning.impact}</p>
                  </div>
                </div>

                {/* Channels Analysis */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-3">Channel Coverage</h4>
                  <div className="text-sm text-purple-800 space-y-1">
                    <p>
                      <strong>You selected:</strong> {selectedChannels.join(', ')}
                    </p>
                    <p>
                      <strong>Scio identified:</strong> {expertReasoning.channels.join(', ')}
                    </p>
                    {expertReasoning.channels.some((c) => !selectedChannels.includes(c)) && (
                      <div className="mt-2 p-2 bg-white rounded border border-purple-200">
                        <p className="text-xs font-semibold text-purple-900">
                          💡 Missing channels:
                        </p>
                        <ul className="mt-1 space-y-1">
                          {expertReasoning.channels
                            .filter((c) => !selectedChannels.includes(c))
                            .map((c) => (
                              <li key={c} className="text-xs text-purple-700">
                                • {c}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stakeholders Analysis */}
                <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4">
                  <h4 className="font-bold text-pink-900 mb-3">Stakeholder Analysis</h4>
                  <div className="text-sm text-pink-800 space-y-2">
                    <div>
                      <p>
                        <strong>You tagged:</strong> Winners ({winners.length}), Losers ({losers.length})
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Scio tagged:</strong> Winners ({expertReasoning.winners.length}), Losers (
                        {expertReasoning.losers.length})
                      </p>
                    </div>
                    {(expertReasoning.winners.some((w) => !winners.includes(w)) ||
                      expertReasoning.losers.some((l) => !losers.includes(l))) && (
                      <div className="mt-2 p-2 bg-white rounded border border-pink-200 space-y-1">
                        {expertReasoning.winners.some((w) => !winners.includes(w)) && (
                          <div>
                            <p className="text-xs font-semibold text-pink-900">
                              Missing winners:
                            </p>
                            <ul className="mt-1 space-y-1">
                              {expertReasoning.winners
                                .filter((w) => !winners.includes(w))
                                .map((w) => (
                                  <li key={w} className="text-xs text-pink-700">
                                    • {w}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                        {expertReasoning.losers.some((l) => !losers.includes(l)) && (
                          <div>
                            <p className="text-xs font-semibold text-pink-900">
                              Missing losers:
                            </p>
                            <ul className="mt-1 space-y-1">
                              {expertReasoning.losers
                                .filter((l) => !losers.includes(l))
                                .map((l) => (
                                  <li key={l} className="text-xs text-pink-700">
                                    • {l}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('interview')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Next: Build Interview Answer →
            </button>
          </div>
        )}

        {/* Step 5: Interview Output */}
        {step === 'interview' && completed && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Step 5: Interview Answer</h3>
              <p className="text-sm text-gray-700 mb-4">
                Build a 25-second interview answer using this scaffold:
              </p>

              <div className="space-y-4">
                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Position (1 sentence)
                  </label>
                  <textarea
                    value={interviewAnswer}
                    onChange={(e) => setInterviewAnswer(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-16 resize-none"
                    placeholder="State your overall take on the situation..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 space-y-3">
                  <p>
                    <strong>Two mechanisms:</strong> Use your channels (
                    {selectedChannels.join(', ')}) to explain how the shock travels.
                  </p>
                  <p>
                    <strong>One trade-off or caveat:</strong> What's the downside or risk to your
                    position?
                  </p>
                  <p>
                    <strong>What you'd watch:</strong> What indicators or data would you monitor to
                    validate your view?
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleInterviewComplete}
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
            >
              Complete Workflow ✓
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
