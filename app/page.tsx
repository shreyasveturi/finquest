'use client';

import Link from 'next/link';
import Button from '../components/Button';
import { GOOGLE_FORM } from '../content/rachelReevesBudget';
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
                <span>New</span>
                <span>•</span>
                <span>Reasoning mode + inline AI explanations</span>
              </div>

              {/* Main Heading */}
              <h1 className={`font-serif text-[2.5rem] md:text-[3rem] font-semibold leading-[1.15] tracking-tight text-white transition-opacity duration-200 ease-out ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
                Regain the ability to think critically
              </h1>

              {/* Subheading */}
              <p className={`text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto transition-opacity duration-200 ease-out ${heroVisible ? 'opacity-100 delay-100' : 'opacity-0'}`}>
                Scio turns real financial news into reasoning drills that train causal thinking, trade-offs, and judgement — the skills interviews actually test.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 justify-center items-center">
                <Link href="/demo">
                  <button className="px-5 py-2.5 bg-neutral-800 hover:opacity-90 text-white font-medium rounded-lg transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform">
                    Try Demo
                  </button>
                </Link>
                <a href={GOOGLE_FORM} target="_blank" rel="noreferrer">
                  <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform">
                    Join Beta List
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* AI Demo Section */}
        <section className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
              See Scio's AI explain the news in real time
            </h2>
            <p className="text-lg text-gray-600">
              Highlight a sentence → get instant, interview-ready insight.
            </p>
          </div>
          
          <div className="aspect-video w-full max-w-3xl mx-auto rounded-2xl border border-neutral-200 shadow-sm overflow-hidden bg-black">
            <video
              src="/Scio Real.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="w-full py-24 md:py-32 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <div className="space-y-16">
              {/* Card 1: Explain */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">📖</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Explain</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      Inline AI explanations. Highlight any sentence and get clear, interview-ready insight into what it means and why it matters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Reason */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">🧠</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Reason</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      Build causal chains before seeing answers. Attempt your reasoning first, then compare against expert analysis to identify gaps and blind spots.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Prove */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">✓</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Prove</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      Short checkpoints that test implications, not recall. Earn XP for reasoning, not for streaks. Prove you can think, not that you can memorise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="w-full py-24 md:py-32 bg-gray-50 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <div className="space-y-8 text-center">
              <h2 className="text-3xl font-semibold text-gray-900">
                Learn differently.
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed mx-auto">
                No fluff. No endless scrolling. No fake streaks. Just deep, focused learning that actually prepares you for interviews and real-world thinking.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <p className="text-sm font-medium text-gray-600">Fast</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🧠</div>
                  <p className="text-sm font-medium text-gray-600">Deep</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-sm font-medium text-gray-600">Focused</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🤖</div>
                  <p className="text-sm font-medium text-gray-600">Intelligent</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-sm font-medium text-gray-600">Classy</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🕊️</div>
                  <p className="text-sm font-medium text-gray-600">Calm</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Differentiator Section */}
        <section className="w-full py-20 md:py-24 bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <div className="space-y-10">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-semibold text-gray-900">How it works (30 seconds)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 space-y-3">
                  <div className="text-2xl font-bold text-blue-600">1</div>
                  <h3 className="text-lg font-semibold text-gray-900">Highlight → Explain</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Select any text in the article and get instant, interview-ready explanations.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 space-y-3">
                  <div className="text-2xl font-bold text-green-600">2</div>
                  <h3 className="text-lg font-semibold text-gray-900">Build reasoning → Compare</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Attempt your reasoning first, then compare against expert analysis.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6 space-y-3">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <h3 className="text-lg font-semibold text-gray-900">Answer checkpoint → Feedback</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Test your understanding with implication-focused checkpoints and get interview feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
              Ready to start learning?
            </h2>

            <p className="text-lg text-gray-700 mb-10 leading-relaxed">
              Try the demo completely free. No sign-up required. See how Scio makes finance real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button variant="primary" className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-base">
                  Try Demo
                </Button>
              </Link>
              <a href={GOOGLE_FORM} target="_blank" rel="noreferrer">
                <Button variant="primary" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base">
                  Join Beta List
                </Button>
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-600">
              Early access • Completely free • No credit card required
            </p>
          </div>
        </section>
      </main>
    </>
  );
}


