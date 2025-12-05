'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-slate-900">
                Fin<span className="text-emerald-600">quest</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/lesson" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition">
                Demo
              </Link>
              <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition">
                About
              </Link>
              <a
                href="https://forms.gle/zh4w6jL81stBqf8q6"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
              >
                Join the beta
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link
                href="/lesson"
                className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Demo
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                About
              </Link>
              <a
                href="https://forms.gle/zh4w6jL81stBqf8q6"
                target="_blank"
                rel="noreferrer"
                className="block w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition text-center"
              >
                Join the beta
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <div className="space-y-6 lg:space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    Turn finance news into <span className="text-emerald-600">interview-ready</span> insight.
                  </h1>
                  <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                    Scio transforms real Financial Times articles into gamified practice runs. Learn like you're interviewing at a top finance firm — with instant feedback, XP rewards, and skills that matter.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    href="/lesson"
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition text-center"
                  >
                    Try the Budget Demo
                  </Link>
                  <a
                    href="https://forms.gle/zh4w6jL81stBqf8q6"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 border-2 border-slate-300 text-slate-900 rounded-lg font-semibold hover:bg-slate-50 transition text-center"
                  >
                    Join the beta
                  </a>
                </div>
              </div>

              {/* Right Column - Dashboard Illustration */}
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl shadow-lg overflow-hidden border border-slate-100">
                  {/* Mock Dashboard */}
                  <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-700">Rachel Reeves' Budget</div>
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          3/3 Complete
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    {/* XP Display */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                        <div className="text-xs text-slate-500 font-medium uppercase">XP Earned</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">60</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                        <div className="text-xs text-slate-500 font-medium uppercase">Level</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">Analyst</div>
                      </div>
                    </div>

                    {/* Checkpoint Cards */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Checkpoints</div>
                      {[
                        'Why raise taxes over cuts?',
                        'Market reaction to yields',
                        'Fiscal drag explained'
                      ].map((checkpoint, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-700">{checkpoint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating accent elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-50" />
                <div className="absolute -bottom-12 -left-6 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                How Scio helps you learn
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                A three-step process designed to build real analyst skills
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Read real articles</h3>
                <p className="text-slate-600 leading-relaxed">
                  Get access to real Financial Times and industry articles. Learn from primary sources instead of textbooks.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Get inline explanations</h3>
                <p className="text-slate-600 leading-relaxed">
                  Hover over key financial terms to see plain-English definitions. Understand context without leaving the article.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Answer gamified questions</h3>
                <p className="text-slate-600 leading-relaxed">
                  Tackle implication-focused prompts that demand deeper thinking. Earn XP, compete with peers, and level up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-12 md:py-16 bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <p className="text-slate-600 font-medium text-sm md:text-base">
                Built for students aiming at finance internships and spring weeks. Already testing with undergraduates at top universities.
              </p>

              {/* Partner Logos Placeholder */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                {['Goldman', 'JP Morgan', 'Morgan Stanley', 'McKinsey'].map((name) => (
                  <div key={name} className="px-6 py-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-slate-400">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl border border-emerald-200 shadow-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Want early access?</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto">
                We're inviting a small, hand-picked group of students to shape the beta. Spot limited. Join now to get in.
              </p>

              <a
                href="https://forms.gle/zh4w6jL81stBqf8q6"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition text-lg"
              >
                Join the beta (2 min)
              </a>

              <p className="text-sm text-slate-500 mt-6">
                No commitment. We'll email you when we're ready to onboard.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-600 space-y-4 md:space-y-0">
              <div>© 2025 Scio. All rights reserved.</div>
              <div className="flex gap-6">
                <a href="/about" className="hover:text-slate-900 transition">
                  About
                </a>
                <a href="/" className="hover:text-slate-900 transition">
                  Home
                </a>
                <a href="https://forms.gle/zh4w6jL81stBqf8q6" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
