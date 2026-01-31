'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@/components/Button';
import { apiFetch } from '@/lib/apiFetch';

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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(25000);
  const [isLocked, setIsLocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingAgain, setIsPlayingAgain] = useState(false);
  
  // Phase 0: Refs for forced commitment
  const roundStartAtRef = useRef<number | null>(null);
  const firstCommitAtRef = useRef<number | null>(null);
  const committedOptionRef = useRef<number | null>(null);
  const finalizedRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const pendingSubmissionRef = useRef<{
    selectedIndex: number;
    responseTimeMs: number;
    timeToFirstCommitMs: number | null;
    timeExpired: boolean;
  } | null>(null);

  // Handle Play Again button: start new match directly
  const handlePlayAgain = useCallback(async () => {
    setIsPlayingAgain(true);
    try {
      const clientId = localStorage.getItem('scio_client_id');
      const username = localStorage.getItem('scio_username') || 'Player';

      console.log('[PlayAgain] Starting new bot match...');
      const { data, requestId } = await apiFetch<{ matchId: string; requestId: string }>(
        '/api/bot-match/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, username }),
        }
      );

      console.log(`[PlayAgain] ✓ Match created: ${data.matchId} (req: ${requestId})`);

      // Route directly to new match (no loading screen)
      router.replace(`/match/${data.matchId}`);
    } catch (error) {
      console.error('[PlayAgain] ✗ Failed to start new match:', error);
      alert('Failed to start new match. Please try again.');
      setIsPlayingAgain(false);
    }
  }, [router]);

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
    const fetchMatch = async (retryCount = 0) => {
      if (!matchId) {
        router.replace('/play');
        return;
      }
      try {
        const clientId = localStorage.getItem('scio_client_id');
        const endpoint = `/api/match/${matchId}?clientId=${clientId}`;
        console.log(`[MatchPage] Fetching match ${matchId}`);

        const { data, requestId } = await apiFetch<any>(endpoint);

        console.log(`[MatchPage] ✓ Fetched match (req: ${requestId}) rounds=${data?.rounds?.length}`);

        if (!Array.isArray(data?.rounds)) {
          console.warn(`[MatchPage] No rounds in response`);
          if (retryCount === 0) {
            console.log(`[MatchPage] Retrying after 300ms...`);
            await new Promise((resolve) => setTimeout(resolve, 300));
            return fetchMatch(1);
          }
          setLoading(false);
          return;
        }

        const normalizedRounds = normalizeRounds(data.rounds);

        const m: Match = { ...data, rounds: normalizedRounds };
        setMatch(m);
        setSubmitError(null);
        
        // Phase 0: Initialize round timing
        const serverNow = m.serverNow ?? Date.now();
        const startAt = m.roundStartAt ?? serverNow;
        const duration = m.roundDurationMs ?? 25000;
        const remaining = Math.max(0, startAt + duration - serverNow);
        
        roundStartAtRef.current = startAt;
        setTimeRemainingMs(remaining);
        setCurrentRoundIndex(m.currentRoundIndex ?? 0);
        
        // Reset round state
        setSelectedOption(null);
        setIsLocked(remaining <= 0 || m.roundStatus === 'timeout' || m.roundStatus === 'ended');
        setShowFeedback(false);
        firstCommitAtRef.current = null;
        committedOptionRef.current = null;
        finalizedRef.current = false;
        
        setLoading(false);
      } catch (err) {
        console.error('[MatchPage] ✗ Failed to fetch match:', err);
        if (err instanceof Error && err.message.includes('MATCH_NOT_FOUND') && retryCount === 0) {
          console.log(`[MatchPage] Retrying after 300ms...`);
          await new Promise((resolve) => setTimeout(resolve, 300));
          return fetchMatch(1);
        }
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, router, normalizeRounds]);

  const submitRound = useCallback(async (payload: {
    selectedIndex: number;
    responseTimeMs: number;
    timeToFirstCommitMs: number | null;
    timeExpired: boolean;
  }) => {
    if (!match || !matchId) return;
    const round = match.rounds[currentRoundIndex];
    const clientId = localStorage.getItem('scio_client_id');
    if (!clientId) return;

    pendingSubmissionRef.current = payload;
    setIsSubmitting(true);
    setSubmitError(null);

    const selectedIndex = payload.selectedIndex;
    const selectedOptionValue = selectedIndex >= 0 ? round.question?.options?.[selectedIndex] ?? null : null;
    const correct = selectedIndex >= 0 && selectedIndex === round.correctIndex;

    try {
      // 1) Log round metrics
      const logRes = await fetch('/api/round/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          matchId,
          roundIndex: round.roundIndex,
          questionId: round.questionId,
          selectedOption: selectedOptionValue,
          correct,
          responseTimeMs: payload.responseTimeMs,
          timeToFirstCommitMs: payload.timeToFirstCommitMs,
          timeExpired: payload.timeExpired,
        }),
      });

      if (!logRes.ok) {
        const logErr = await logRes.json();
        setSubmitError(logErr?.error?.message || 'Failed to log round');
        setIsSubmitting(false);
        return;
      }

      // 2) Submit gameplay answer (use -1 for no selection)
      const submitRes = await fetch(`/api/match/${matchId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: round.id,
          playerAnswer: selectedIndex >= 0 ? selectedIndex : -1,
          clientId,
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        setSubmitError(submitData?.error || 'Failed to submit round');
        setIsSubmitting(false);
        return;
      }

      const isLastRound = currentRoundIndex === match.rounds.length - 1;
      
      // Phase 0: Auto-advance with delay to show feedback
      if (isLastRound) {
        // Wait briefly then complete match
        await new Promise((resolve) => setTimeout(resolve, 600));
        
        const completeRes = await fetch('/api/match/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            matchId,
            resultA: 'UNKNOWN',
          }),
        });
        const completeData = await completeRes.json();
        if (!completeRes.ok) {
          setSubmitError(completeData?.error?.message || 'Failed to complete match');
          setIsSubmitting(false);
          return;
        }
        
        // Navigate to results page with match ID
        router.push(`/match/${matchId}/results`);
        return;
      }

      // Not last round - auto-advance after brief delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Refetch match to load next round
      const res2 = await fetch(`/api/match/${matchId}?clientId=${clientId}`);
      const fresh = await res2.json();
      if (!res2.ok || fresh?.error) {
        setSubmitError('Failed to load next round');
        setIsSubmitting(false);
        return;
      }

      const normalizedRounds = normalizeRounds(fresh.rounds);
      const m: Match = { ...fresh, rounds: normalizedRounds };
      setMatch(m);
      
      const nextRoundIndex = m.currentRoundIndex ?? currentRoundIndex + 1;
      setCurrentRoundIndex(nextRoundIndex);
      
      const serverNow = m.serverNow ?? Date.now();
      const startAt = m.roundStartAt ?? serverNow;
      const duration = m.roundDurationMs ?? 25000;
      const remaining = Math.max(0, startAt + duration - serverNow);
      
      roundStartAtRef.current = startAt;
      setTimeRemainingMs(remaining);
      setIsLocked(remaining <= 0 || m.roundStatus === 'timeout' || m.roundStatus === 'ended');
      
      // Reset for next round
      setSelectedOption(null);
      setShowFeedback(false);
      firstCommitAtRef.current = null;
      committedOptionRef.current = null;
      finalizedRef.current = false;
      pendingSubmissionRef.current = null;
    } catch (err) {
      console.error('Failed to submit round:', err);
      setSubmitError('Failed to submit round');
    } finally {
      setIsSubmitting(false);
    }
  }, [match, matchId, currentRoundIndex, normalizeRounds, router]);

  const finalizeRound = useCallback((reason: 'commit' | 'timeout') => {
    if (!match || !matchId) return;
    if (finalizedRef.current) return; // Prevent duplicate finalization
    
    finalizedRef.current = true;

    const now = Date.now();
    const startAt = roundStartAtRef.current ?? now;
    const roundDuration = match.roundDurationMs ?? 25000;
    
    let responseTimeMs: number;
    let selectedIndex: number;
    let timeExpired: boolean;

    if (reason === 'timeout') {
      // Timer expired
      selectedIndex = committedOptionRef.current !== null ? committedOptionRef.current : -1;
      timeExpired = committedOptionRef.current === null;
      responseTimeMs = committedOptionRef.current !== null 
        ? Math.max(0, (firstCommitAtRef.current || now) - startAt)
        : roundDuration;
    } else {
      // User committed
      selectedIndex = committedOptionRef.current !== null ? committedOptionRef.current : -1;
      timeExpired = false;
      responseTimeMs = Math.max(0, now - startAt);
    }

    const timeToFirstCommitMs = firstCommitAtRef.current
      ? Math.max(0, firstCommitAtRef.current - startAt)
      : null;

    submitRound({
      selectedIndex,
      responseTimeMs,
      timeToFirstCommitMs,
      timeExpired,
    });
  }, [match, matchId, submitRound]);

  // Phase 0: Timer countdown with auto-timeout
  useEffect(() => {
    if (!match || matchResult || roundStartAtRef.current === null) return;
    if (finalizedRef.current) return;

    const duration = match.roundDurationMs ?? 25000;
    
    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    timerIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, roundStartAtRef.current! + duration - Date.now());
      setTimeRemainingMs(remaining);
      
      if (remaining === 0 && !finalizedRef.current) {
        setIsLocked(true);
        finalizeRound('timeout');
      }
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [match, matchResult, finalizeRound]);

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
    const { playerAScore, playerBScore, winner, ratingAfterA } = matchResult;
    const userIsPlayerA = true;
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
                {userIsPlayerA ? playerAScore : playerBScore}/{match.rounds.length}
              </span>
            </div>
            <div className="w-full bg-neutral-200 h-1 rounded"></div>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{match.isBotMatch ? 'Bot' : 'Opponent'}</span>
              <span className="text-neutral-600">
                {userIsPlayerA ? playerBScore : playerAScore}/{match.rounds.length}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-neutral-600">New Rating</p>
            <p className="text-2xl font-bold text-blue-600">
              {ratingAfterA}
            </p>
          </div>

          <Button
            disabled={isPlayingAgain}
            onClick={handlePlayAgain}
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
            Round {currentRoundIndex + 1} of {match.rounds.length}
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
            {options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === round.correctIndex;
              const showCorrectness = showFeedback && isLocked;
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    // Phase 0: Forced commitment - instant lock on first click
                    if (finalizedRef.current || isLocked || isSubmitting) return;
                    
                    // Record first commit time
                    if (!firstCommitAtRef.current) {
                      firstCommitAtRef.current = Date.now();
                    }
                    
                    // Commit this option
                    committedOptionRef.current = index;
                    setSelectedOption(index);
                    setIsLocked(true);
                    setShowFeedback(true);
                    
                    // Stop the timer
                    if (timerIntervalRef.current) {
                      clearInterval(timerIntervalRef.current);
                      timerIntervalRef.current = null;
                    }
                    
                    // Immediately finalize
                    finalizeRound('commit');
                  }}
                  disabled={isLocked || isSubmitting}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isLocked && showCorrectness
                      ? isSelected && isCorrect
                        ? 'border-green-600 bg-green-50'
                        : isSelected && !isCorrect
                        ? 'border-red-600 bg-red-50'
                        : isCorrect
                        ? 'border-green-400 bg-green-50'
                        : 'border-neutral-200 bg-white'
                      : isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  } ${isLocked || isSubmitting ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isLocked && showCorrectness
                          ? isSelected && isCorrect
                            ? 'border-green-600 bg-green-600'
                            : isSelected && !isCorrect
                            ? 'border-red-600 bg-red-600'
                            : isCorrect
                            ? 'border-green-600 bg-green-600'
                            : 'border-neutral-300'
                          : isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-neutral-300'
                      }`}
                    >
                      {isLocked && showCorrectness ? (
                        isSelected && isCorrect ? (
                          <span className="text-white text-sm">✓</span>
                        ) : isSelected && !isCorrect ? (
                          <span className="text-white text-sm">✗</span>
                        ) : isCorrect ? (
                          <span className="text-white text-sm">✓</span>
                        ) : null
                      ) : isSelected ? (
                        <span className="text-white text-sm">✓</span>
                      ) : null}
                    </div>
                    <span className="text-neutral-900 font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="mb-2">{submitError}</p>
              <Button
                onClick={() => {
                  const pending = pendingSubmissionRef.current;
                  if (pending) {
                    finalizedRef.current = false;
                    submitRound(pending);
                  }
                }}
                className="w-full"
                variant="outline"
              >
                Retry submit
              </Button>
            </div>
          )}

          {/* Phase 0: Show lock status and submitting indicator */}
          {isLocked && isSubmitting && (
            <div className="text-center">
              <p className="text-sm text-neutral-600 animate-pulse">
                Submitting answer...
              </p>
            </div>
          )}
          
          {isLocked && !isSubmitting && !submitError && (
            <div className="text-center">
              <p className="text-sm text-neutral-500">
                {selectedOption !== null 
                  ? selectedOption === round.correctIndex 
                    ? '✓ Correct!' 
                    : '✗ Incorrect'
                  : '⏱ Time expired'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
