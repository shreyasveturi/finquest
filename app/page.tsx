'use client';

import Link from 'next/link';
import NavBar from '../components/NavBar';
import Button from '../components/Button';
import { GOOGLE_FORM } from '../content/rachelReevesBudget';

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="w-full bg-white">
        {/* Hero Section */}
        <section className="relative w-full min-h-[85vh] md:min-h-[80vh] border-b border-gray-200 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-[url('/demo-snapshot.svg')] bg-cover bg-center scale-105"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-900/85 to-gray-900/60" aria-hidden />
          <div className="relative max-w-2xl mx-auto px-8 md:px-12 w-full text-center text-white py-20">
            <div className="space-y-10">
              {/* Main Heading */}
              <h1 className="font-serif text-[2.5rem] md:text-[3rem] font-semibold leading-[1.15] tracking-tight">
                Turn finance news into interview-ready insight.
              </h1>

              {/* Subheading */}
              <p className="text-base md:text-lg text-neutral-300 leading-relaxed max-w-xl mx-auto">
                Learn to truly understand markets through minimalist, AI-powered articles. No fluff. Just clarity.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 justify-center items-center">
                <Link href="/lesson">
                  <button className="px-5 py-2.5 bg-neutral-800 hover:opacity-90 text-white font-medium rounded-lg transition-opacity">
                    Try Demo
                  </button>
                </Link>
                <a href={GOOGLE_FORM} target="_blank" rel="noreferrer">
                  <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 transition-colors">
                    Join Beta List
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="w-full py-24 md:py-32 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <div className="space-y-16">
              {/* Card 1: Predict First */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">🎯</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Predict First</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      Write your hypothesis before reading. Activate your thinking and anchor your learning before any content exposure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Learn as You Read */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">📖</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Learn as You Read</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      Interactive explanations, tooltips, and AI-powered insights embedded throughout. Highlight any text and get instant, interview-ready explanations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Prove You Understand */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl mt-1">✓</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Prove You Understand</h3>
                    <p className="mt-2 text-lg text-gray-700 leading-relaxed">
                      Checkpoints and reflections measure real comprehension, not just reading speed. Rewrite concepts in your own words and earn XP for genuine understanding.
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
              <Link href="/lesson">
                <Button variant="primary" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base">
                  Try Demo
                </Button>
              </Link>
              <a href={GOOGLE_FORM} target="_blank" rel="noreferrer">
                <Button variant="outline" className="px-8 py-3 border border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold rounded-lg text-base">
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


