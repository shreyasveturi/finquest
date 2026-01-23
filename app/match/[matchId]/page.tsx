'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
}

interface Match {
  id: string;
  rounds: Round[];
  isBotMatch: boolean;
}

export default function MatchPage({ params }: { params: { matchId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch match data
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/match/${params.matchId}`);
        const data = await res.json();
        setMatch(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch match:', err);
        setLoading(false);
      }
    };

    fetchMatch();
  }, [params.matchId]);

  // Timer
  useEffect(() => {
    if (!match || currentRoundIndex >= match.rounds.length || matchResult) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit if time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [match, currentRoundIndex, matchResult]);

  const handleSubmit = async () => {
    if (selectedAnswer === null || !match) return;

    setIsSubmitting(true);
    const round = match.rounds[currentRoundIndex];

    try {
      const res = await fetch(`/api/match/${params.matchId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: round.id,
          playerAnswer: selectedAnswer,
        }),
      });

      const data = await res.json();

      if (data.matchComplete) {
        // Match finished
        setMatchResult(data);
      } else {
        // Move to next round
        if (currentRoundIndex < match.rounds.length - 1) {
          setCurrentRoundIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setTimeRemaining(30);
        }
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-neutral-50 border-b p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <p className="text-sm font-semibold text-neutral-600">
            Round {currentRoundIndex + 1} of 5
          </p>
          <div className={`text-lg font-bold ${timeRemaining <= 5 ? 'text-red-600' : 'text-blue-600'}`}>
            {timeRemaining}s
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
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(index)}
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
            onClick={handleSubmit}
            disabled={selectedAnswer === null || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white font-semibold py-3"
          >
            {isSubmitting ? 'Submitting...' : currentRoundIndex === match.rounds.length - 1 ? 'Finish Match' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
}
