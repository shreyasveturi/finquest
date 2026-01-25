'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@/components/Button';

interface Question {
  id: string;
  prompt: string;
  options: string[];
  type: string;
  difficulty: string;
}

interface Round {
  id: string;
  roundIndex: number;
  questionId: string;
  question: Question;
  playerAAnswer?: number;
  playerBAnswer?: number;
  correctIndex: number;
  endedAt?: string | null;
}

interface Match {
  id: string;
  rounds: Round[];
  isBotMatch: boolean;
  currentRoundIndex?: number;
  roundStartAt?: number | null;
  roundDurationMs?: number;
  roundStatus?: 'active' | 'timeout' | 'ended';
  serverNow?: number;
}

export default function MatchPage() {
  const params = useParams();
  const rawMatchId = params?.matchId;
  const matchId = Array.isArray(rawMatchId) ? rawMatchId[0] : rawMatchId;
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(25000);
  const [inputsLocked, setInputsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const finalizeInFlight = useRef(false);

  // Normalize question options from JSON string to array
  const normalizeRounds = useCallback((rounds: any[]) => {
    return rounds.map((r: any) => {
      const opts = (() => {
        if (Array.isArray(r.question?.options)) return r.question.options;
        if (typeof r.question?.options === 'string') {
          try {
            const parsed = JSON.parse(r.question.options);
            if (Array.isArray(parsed)) return parsed;
          } catch {}
        }
        return [] as string[];
      })();

      return {
        ...r,
        question: r.question ? {
          ...r.question,
          options: opts,
          prompt: r.question.prompt || '',
          type: r.question.type || 'multiple-choice',
          difficulty: r.question.difficulty || 'medium',
        } : null,
      };
    });
  }, []);

  // Fetch match data
  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) {
        router.replace('/play');
        return;
      }
      try {
        const clientId = localStorage.getItem('scio_client_id');
        const res = await fetch(`/api/match/${matchId}?clientId=${clientId}`);
        const data = await res.json();
        if (data?.error || !Array.isArray(data?.rounds)) {
          setLoading(false);
          return;
        }
        const normalizedRounds = normalizeRounds(data.rounds);

        const m: Match = { ...data, rounds: normalizedRounds };
        setMatch(m);
        // Derive timer from server state
        const serverNow = m.serverNow ?? Date.now();
        const startAt = m.roundStartAt ?? serverNow;
        const duration = m.roundDurationMs ?? 25000;
        const remaining = Math.max(0, startAt + duration - serverNow);
        setTimeRemainingMs(remaining);
        setInputsLocked(remaining <= 0 || m.roundStatus === 'timeout' || m.roundStatus === 'ended');
        setCurrentRoundIndex(m.currentRoundIndex ?? 0);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch match:', err);
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, router, normalizeRounds]);

  const handleSubmit = useCallback(async (answerOverride?: number) => {
    if (!match || !matchId) return;

    const answer = answerOverride !== undefined ? answerOverride : selectedAnswer;
    if (answer === null) return;

    setIsSubmitting(true);
    const round = match.rounds[currentRoundIndex];

    try {
      const clientId = localStorage.getItem('scio_client_id');

      const res = await fetch(`/api/match/${matchId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: round.id,
          playerAnswer: answer,
          clientId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Submit failed:', data);
        setIsSubmitting(false);
        return;
      }

      console.log('Submit response:', data);

      if (data.matchComplete) {
        console.log('Match complete, setting result:', data);
        setMatchResult(data);
      } else {
        // Refetch match to get authoritative next round and timing
        const clientId2 = localStorage.getItem('scio_client_id');
        const res2 = await fetch(`/api/match/${matchId}?clientId=${clientId2}`);
        const fresh = await res2.json();
        if (!res2.ok || fresh?.error) {
          console.error('Failed to refetch match');
        } else {
          const normalizedRounds = normalizeRounds(fresh.rounds);
          const m: Match = { ...fresh, rounds: normalizedRounds };
          setMatch(m);
          setCurrentRoundIndex(m.currentRoundIndex ?? currentRoundIndex);
          const serverNow = m.serverNow ?? Date.now();
          const startAt = m.roundStartAt ?? serverNow;
          const duration = m.roundDurationMs ?? 25000;
          const remaining = Math.max(0, startAt + duration - serverNow);
          setTimeRemainingMs(remaining);
          setInputsLocked(remaining <= 0 || m.roundStatus === 'timeout' || m.roundStatus === 'ended');
          setSelectedAnswer(null);
        }
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [match, matchId, currentRoundIndex, selectedAnswer, normalizeRounds]);

  // Server-driven timer; finalize on expiry, no auto-submission
  useEffect(() => {
    if (!match || matchResult) return;

    const tickInterval = setInterval(() => {
      setTimeRemainingMs(prev => {
        const next = Math.max(0, prev - 250);
        if (next === 0) {
          setInputsLocked(true);
        }
        return next;
      });
    }, 250);

    return () => clearInterval(tickInterval);
  }, [match, matchResult]);

  // When timer hits 0, call finalize once and poll until round ends
  useEffect(() => {
    const doFinalize = async () => {
      if (!match || !matchId) return;
      if (finalizeInFlight.current) return;
      finalizeInFlight.current = true;
      try {
        const clientId = localStorage.getItem('scio_client_id');
        const res = await fetch(`/api/match/${matchId}/finalize-round`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error('Finalize failed:', data);
          finalizeInFlight.current = false;
          return;
        }

        if (data.matchComplete) {
          setTimeout(() => setMatchResult(data), 900);
          return;
        }

        // Poll for round end
        const poll = async () => {
          const clientId2 = localStorage.getItem('scio_client_id');
          const r = await fetch(`/api/match/${matchId}?clientId=${clientId2}`);
          const fresh = await r.json();
          if (!r.ok || fresh?.error) {
            setTimeout(poll, 400);
            return;
          }
          if (fresh.roundStatus === 'ended') {
            // Transition to next round after brief delay
            setTimeout(() => {
              const normalizedRounds = normalizeRounds(fresh.rounds);
              const m: Match = { ...fresh, rounds: normalizedRounds };
              setMatch(m);
              setCurrentRoundIndex(m.currentRoundIndex ?? currentRoundIndex);
              const serverNow = m.serverNow ?? Date.now();
              const startAt = m.roundStartAt ?? serverNow;
              const duration = m.roundDurationMs ?? 25000;
              const remaining = Math.max(0, startAt + duration - serverNow);
              setTimeRemainingMs(remaining);
              setInputsLocked(remaining <= 0 || m.roundStatus === 'timeout' || m.roundStatus === 'ended');
              setSelectedAnswer(null);
              finalizeInFlight.current = false;
            }, 900);
          } else {
            setTimeout(poll, 400);
          }
        };
        poll();
      } catch (e) {
        console.error('Finalize error:', e);
        finalizeInFlight.current = false;
      }
    };

    if (timeRemainingMs === 0 && match && !matchResult) {
      doFinalize();
    }
  }, [timeRemainingMs, match, matchId, matchResult, currentRoundIndex]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading match...</div>;
  }

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Match not found</p>
          <Button onClick={() => router.push('/play')}>Back to Queue</Button>
        </div>
      </div>
    );
  }

  if (matchResult) {
    // Match results screen
    const { playerAScore, playerBScore, winner, playerANewRating, playerBNewRating } = matchResult;
    const userIsPlayerA = match.rounds[0] && match.rounds[0].playerAAnswer !== null;
    const userWon = (userIsPlayerA && winner === 'playerA') || (!userIsPlayerA && winner === 'playerB');

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className={`text-6xl font-bold ${userWon ? 'text-green-600' : 'text-red-600'}`}>
            {userWon ? '🎉 Victory!' : winner === 'draw' ? '⚖️ Draw!' : '😔 Defeat'}
          </div>

          <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>You</span>
              <span className="text-neutral-600">
                {userIsPlayerA ? playerAScore : playerBScore}/5
              </span>
            </div>
            <div className="w-full bg-neutral-200 h-1 rounded"></div>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{match.isBotMatch ? 'Bot' : 'Opponent'}</span>
              <span className="text-neutral-600">
                {userIsPlayerA ? playerBScore : playerAScore}/5
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-neutral-600">New Rating</p>
            <p className="text-2xl font-bold text-blue-600">
              {userIsPlayerA ? playerANewRating : playerBNewRating}
            </p>
          </div>

          <Button
            onClick={() => router.push('/play')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  // Active match round
  const round = match.rounds[currentRoundIndex];
  if (!round?.question) {
    return <div className="flex items-center justify-center min-h-screen">Loading round...</div>;
  }

  const question = round.question;
  const options = Array.isArray(question.options) ? question.options : [];

  // Defensive: If options are missing, show error
  if (options.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-semibold">Question data missing</p>
          <p className="text-sm text-neutral-600">Unable to load answer options. Please refresh.</p>
          <Button onClick={() => router.push('/play')}>Back to Play</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-neutral-50 border-b p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <p className="text-sm font-semibold text-neutral-600">
            Round {currentRoundIndex + 1} of 5
          </p>
          <div className={`text-lg font-bold ${timeRemainingMs <= 5000 ? 'text-red-600' : 'text-blue-600'}`}>
            {Math.ceil(timeRemainingMs / 1000)}s
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-neutral-100 h-1">
        <div
          className="bg-blue-600 h-full transition-all"
          style={{ width: `${((currentRoundIndex + 1) / match.rounds.length) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-blue-600 uppercase">{question.type}</p>
            <h2 className="text-2xl font-bold text-neutral-900">{question.prompt}</h2>
            <p className="text-sm text-neutral-600 capitalize">
              Difficulty: {question.difficulty}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => !inputsLocked && setSelectedAnswer(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-neutral-300'
                    }`}
                  >
                    {selectedAnswer === index && <span className="text-white text-sm">✓</span>}
                  </div>
                  <span className="text-neutral-900 font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Submit button */}
          <Button
            onClick={() => handleSubmit()}
            disabled={inputsLocked || selectedAnswer === null || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white font-semibold py-3"
          >
            {isSubmitting ? 'Submitting...' : currentRoundIndex === match.rounds.length - 1 ? 'Finish Match' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
}
