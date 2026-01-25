'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <main className="w-full bg-white">
        {/* Hero Section */}
        <section className="relative w-full min-h-[85vh] md:min-h-[80vh] border-b border-gray-200 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-[url('/demo-snapshot.svg')] bg-cover bg-center scale-105"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-900/85 to-gray-900/60" aria-hidden />
          <div className="relative max-w-2xl mx-auto px-8 md:px-12 w-full text-center py-20">
            <div className="space-y-10">
              {/* Pill */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 transition-opacity duration-200 ease-out ${heroVisible ? 'opacity-100 delay-50' : 'opacity-0'}`}>
                <span>Scio v0.1</span>
                <span>•</span>
                <span>Competitive Reasoning Battles</span>
              </div>

              {/* Main Heading */}
              <h1 className={`font-serif text-[2.5rem] md:text-[3rem] font-semibold leading-[1.15] tracking-tight text-white transition-opacity duration-200 ease-out ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
                Test your reasoning under pressure
              </h1>

              {/* Subheading */}
              <p className={`text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto transition-opacity duration-200 ease-out ${heroVisible ? 'opacity-100 delay-100' : 'opacity-0'}`}>
                Compete in real-time 1v1 battles against our adaptive AI. Peer-to-peer matchmaking is coming soon. Earn ELO ratings and climb the leaderboard.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 justify-center items-center">
                <Link href="/play">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform">
                    ⚔️ Start a Match
                  </button>
                </Link>
                <Link href="/admin/metrics">
                  <button className="px-6 py-3 bg-neutral-800 hover:opacity-90 text-white font-semibold rounded-lg transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform">
                    Leaderboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Ranked Battles Section */}
        <section className="w-full bg-blue-50 border-b border-blue-200">
          <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase mb-2">How It Works</p>
                  <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900">
                    Battle in real time
                  </h2>
                </div>
                <p className="text-lg text-neutral-700 leading-relaxed">
                  Join the matchmaking queue and face an opponent instantly. Answer 5 critical reasoning questions in 20-30 seconds each. Get matched fairly based on your skill rating.
                </p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-neutral-700">5 reasoning questions per match</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-neutral-700">20-30 seconds per question</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-neutral-700">Instant feedback after each round</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span className="text-neutral-700">ELO rating system • Leaderboard</span>
                  </li>
                </ul>
                <Link href="/play">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform">
                    Find an Opponent
                  </button>
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
                <div className="space-y-4 text-center">
                  <div className="text-5xl">⚔️</div>
                  <p className="font-semibold text-neutral-900 text-lg">1v1 Reasoning Battle</p>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-600">Average match time</p>
                    <p className="text-2xl font-bold text-neutral-900">3-5 minutes</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-600">Questions</p>
                      <p className="text-xl font-bold text-blue-600">5</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-neutral-600">Time/Q</p>
                      <p className="text-xl font-bold text-green-600">30s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Game Features Section */}
        <section className="w-full py-24 md:py-32 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <div className="space-y-16">
              {/* Card 1: Matchmaking */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">🎯</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Skill-Based Matching</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      Our SBMM system matches you against opponents at your skill level. Fall back to AI opponents if needed (bot won't slow you down).
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Rating System */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">📈</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">ELO Rating System</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      Earn or lose points based on match results. Climb through Bronze, Silver, Gold, Platinum, and Diamond tiers as you improve.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Play Again */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">⚡</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Play Instantly</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      After results, queue for your next match immediately. No waiting, no friction. Just competitive reasoning battles back-to-back.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Preview Section */}
        <section className="w-full py-24 md:py-32 bg-gray-50 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <div className="space-y-8 text-center">
              <h2 className="text-3xl font-semibold text-gray-900">
                Compete globally
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed mx-auto">
                Your performance is tracked in real time. Climb the leaderboard and earn your rank through competitive play.
              </p>

              <Link href="/admin/metrics">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform">
                  View Leaderboard
                </button>
              </Link>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-sm font-medium text-gray-600">Ranked Tiers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-medium text-gray-600">Live Stats</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <p className="text-sm font-medium text-gray-600">Quick Matches</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
              Ready to compete?
            </h2>

            <p className="text-lg text-gray-700 mb-10 leading-relaxed">
              Start a ranked match now. Test your reasoning. Climb the leaderboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/play">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform">
                  ⚔️ Find Match
                </button>
              </Link>
              <Link href="/admin/metrics">
                <button className="px-8 py-3 bg-neutral-800 hover:opacity-90 text-white font-semibold rounded-lg text-base transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform">
                  View Leaderboard
                </button>
              </Link>
            </div>

            <p className="mt-8 text-sm text-gray-600">
              No sign up required
            </p>
          </div>
        </section>
      </main>
    </>
  );
}


