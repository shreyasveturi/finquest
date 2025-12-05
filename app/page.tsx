'use client';

import Link from 'next/link';
import NavBar from '../components/NavBar';
import Button from '../components/Button';
import { GOOGLE_FORM } from '../content/rachelReevesBudget';

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="w-full bg-slate-50 min-h-screen">
        {/* Hero Section */}
        <section className="w-full bg-slate-50 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Left Column: Text & CTAs */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Turn finance news into interview-ready insight
                </h1>

                <p className="mt-6 text-lg text-slate-700 leading-relaxed">
                  Read real Financial Times articles. Get inline explanations. Answer like an analyst. Earn XP while you learn.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/lesson">
                    <Button variant="primary" className="w-full sm:w-auto text-base px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white">
                      Try Demo →
                    </Button>
                  </Link>
                  <a href={GOOGLE_FORM} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto text-base px-6 py-3 border-emerald-600 text-emerald-600">
                      Join the beta
                    </Button>
                  </a>
                </div>

                <p className="mt-6 text-sm text-slate-600">
                  ✨ Early access • Completely free • No sign-up for demo
                </p>
              </div>

              {/* Right Column: Mock Dashboard */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Rachel Reeves' Budget</h3>
                  <span className="text-3xl">📰</span>
                </div>

                <div className="space-y-5">
                  {/* XP Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Experience</span>
                      <span className="text-sm font-bold text-blue-600">Level 2 • 45 XP</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>

                  {/* Progress Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-600">2/3</div>
                      <div className="text-xs text-slate-600 mt-1">Checkpoints</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-indigo-600">8</div>
                      <div className="text-xs text-slate-600 mt-1">Terms</div>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-slate-700">45%</div>
                      <div className="text-xs text-slate-600 mt-1">Done</div>
                    </div>
                  </div>

                  {/* Sample Checkpoint */}
                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Current checkpoint</p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-sm font-medium text-slate-800">
                        🎯 Why might corporation tax changes affect gilt yields?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full bg-white py-16 md:py-20 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How Scio Helps You Learn</h2>
              <p className="mt-3 text-lg text-slate-600">Three steps to financial literacy mastery</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Read */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                  <span className="text-2xl">📖</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Read</h3>
                <p className="text-slate-700">Curated Financial Times articles on real market events. Hand-picked for learning impact.</p>
              </div>

              {/* Card 2: Explain */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Explain</h3>
                <p className="text-slate-700">Grammarly-style tooltips explain financial terms inline. Context-aware definitions at your fingertips.</p>
              </div>

              {/* Card 3: Gamify */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Gamify</h3>
                <p className="text-slate-700">Answer implication-focused checkpoints and earn XP. Track progress like an analyst.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-blue-600 py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to master finance news?</h2>
            <p className="mt-4 text-lg text-blue-100">Get early access to Scio. No credit card required.</p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/lesson">
                <Button variant="ghost" className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 hover:bg-slate-50 font-semibold">
                  Try Demo
                </Button>
              </Link>
              <a href={GOOGLE_FORM} target="_blank" rel="noreferrer">
                <Button variant="primary" className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white">
                  Join the beta
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}


