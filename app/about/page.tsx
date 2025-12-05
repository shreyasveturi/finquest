'use client';

import NavBar from '../../components/NavBar';
import Button from '../../components/Button';
import { GOOGLE_FORM } from '../../content/rachelReevesBudget';

export default function About() {
  return (
    <>
      <NavBar />
      <div className="w-full bg-slate-50 min-h-screen">
        {/* Hero Section */}
        <section className="w-full bg-slate-50 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Why Scio?
              </h1>

              <p className="mt-6 text-lg text-slate-700 leading-relaxed">
                Students preparing for finance internships are drowning in dry PDFs, 50-page market reports, and technical jargon. They memorize concepts without understanding implications. They can't discuss real market events like the budget with confidence.
              </p>

              <p className="mt-4 text-lg text-slate-700 leading-relaxed">
                Scio transforms finance articles into short, interactive learning runs. Read real news. Get inline explanations. Answer implication questions. Earn XP. No rote memorization—just thinking like an analyst.
              </p>

              <p className="mt-4 text-lg text-slate-700 leading-relaxed">
                Designed for students targeting 2026/27 finance internships and spring week programs. Built by people who've sat in those interviews and know what actually matters.
              </p>
            </div>
          </div>
        </section>

        {/* Two-Column Section */}
        <section className="w-full bg-white py-16 md:py-20 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* Left: Benefits */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Core Benefits</h2>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="text-2xl text-emerald-600">✓</span>
                    <div>
                      <div className="font-semibold text-slate-900">Real articles from the FT</div>
                      <p className="text-sm text-slate-600 mt-1">Learn from actual market events, not textbooks.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-2xl text-emerald-600">✓</span>
                    <div>
                      <div className="font-semibold text-slate-900">Grammarly-style explanations</div>
                      <p className="text-sm text-slate-600 mt-1">Every financial term explained inline with context.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-2xl text-emerald-600">✓</span>
                    <div>
                      <div className="font-semibold text-slate-900">Implication-focused questions</div>
                      <p className="text-sm text-slate-600 mt-1">Answer like an analyst, not from memory.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-2xl text-emerald-600">✓</span>
                    <div>
                      <div className="font-semibold text-slate-900">Gamified learning</div>
                      <p className="text-sm text-slate-600 mt-1">Earn XP, track progress, see yourself improve.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-2xl text-emerald-600">✓</span>
                    <div>
                      <div className="font-semibold text-slate-900">Model answers included</div>
                      <p className="text-sm text-slate-600 mt-1">Compare your thinking to expert responses.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Right: Future Features */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Coming Soon</h2>
                <div className="space-y-5">
                  <div>
                    <div className="font-semibold text-slate-900">📅 Daily Learning Runs</div>
                    <p className="text-sm text-slate-700 mt-2">New macro + equities articles every day. Build streaks and unlock levels.</p>
                  </div>
                  <div>
                      <div className="font-semibold text-slate-900">⚔️ Duels</div>
                    <p className="text-sm text-slate-700 mt-2">"Clash Royale" style challenges: answer faster and better than your opponents.</p>
                  </div>
                  <div>
                      <div className="font-semibold text-slate-900">🏆 Clans & Leaderboards</div>
                    <p className="text-sm text-slate-700 mt-2">Compete with your cohort. See who's climbing the ranks.</p>
                  </div>
                  <div>
                      <div className="font-semibold text-slate-900">🗺️ Skill Map</div>
                    <p className="text-sm text-slate-700 mt-2">Visualize your mastery across markets, sectors, and concepts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full bg-blue-600 py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Want to help shape the beta?</h2>
            <p className="mt-4 text-lg text-blue-100">We're looking for early testers who are serious about finance internship prep.</p>

            <div className="mt-8">
              <a href={GOOGLE_FORM} target="_blank" rel="noreferrer">
                <Button variant="ghost" className="px-8 py-3 bg-white text-blue-600 hover:bg-slate-50 font-semibold">
                  Join the beta
                </Button>
              </a>
            </div>

            <p className="mt-6 text-sm text-blue-100">No credit card needed. Testing with a small group for 2026/27 applicants.</p>
          </div>
        </section>
      </div>
    </>
  );
}
