'use client';

import Button from '../../components/Button';
import { GOOGLE_FORM } from '../../content/rachelReevesBudget';

export default function About() {
  return (
    <>
      <div className="w-full bg-white min-h-screen">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
              Why Scio
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Finance candidates consume news without understanding implications. They memorize terms but can’t explain market impact — the exact skill interviews test.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Scio turns real finance articles into structured, interactive learning.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              At the core is an AI engine that explains any sentence inline and ties it back to market impact.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Highlight terms for instant explanations. Answer implication-focused questions. Build the ability to discuss markets with clarity and confidence.
            </p>
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
              src="/Scio.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        {/* Core Benefits Section */}
        <section className="w-full py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-gray-900 mb-12">How Scio Works</h2>
            
            <div className="space-y-8">
              {/* Predict */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Predict</h3>
                    <p className="text-gray-600 text-sm mt-1">Start with a quick prediction to activate prior knowledge.</p>
                  </div>
                </div>
              </div>

              {/* Read */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Learn While Reading</h3>
                    <p className="text-gray-600 text-sm mt-1">Inline explanations and targeted checkpoints guide you through the article’s key mechanics.</p>
                  </div>
                </div>
              </div>

              {/* Reflect */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl">💭</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Demonstrate Understanding</h3>
                    <p className="text-gray-600 text-sm mt-1">Summarize the core idea or choose from expert-aligned interpretations.</p>
                  </div>
                </div>
              </div>

              {/* Mastery */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Track Progress</h3>
                    <p className="text-gray-600 text-sm mt-1">Earn XP for reasoning and accuracy — not streaks.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Scio Different */}
        <section className="w-full py-16 md:py-20 bg-gray-50 border-y border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-gray-900 mb-12">What Makes Scio Different</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Real Finance Content</h3>
                <p className="text-gray-700">Learn directly from live Financial Times articles and current events.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mastery, Not Streaks</h3>
                <p className="text-gray-700">Gamification exists only to deepen understanding. No streaks, guilt loops, or engagement hacks.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Minimalist Design</h3>
                <p className="text-gray-700">A clean, focused reading environment designed for analysis.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Explanations</h3>
                <p className="text-gray-700">Highlight any sentence to get clear, interview-relevant insight into what it means and why it matters.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analyst-Style Reasoning</h3>
                <p className="text-gray-700">Compare your conclusions to expert interpretations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="w-full py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-gray-900 mb-12">Coming Soon</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="font-semibold text-gray-900 mb-2">📅 Daily article-based learning</div>
                <p className="text-gray-600">Fresh finance news pieces turned into interactive lessons.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="font-semibold text-gray-900 mb-2">⚔️ Peer duels</div>
                <p className="text-gray-600">Compete on implication analysis and speed.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="font-semibold text-gray-900 mb-2">🏆 Clans & leaderboards</div>
                <p className="text-gray-600">See who’s progressing fastest and collaborate with your group.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="font-semibold text-gray-900 mb-2">🗺️ Skill map</div>
                <p className="text-gray-600">Track strengths across markets and sectors.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">
              Ready to get your interview edge?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Join our beta and start learning with real market events. No credit card required.
            </p>

            <a href={GOOGLE_FORM} target="_blank" rel="noreferrer">
              <Button variant="primary" className="px-8 py-3 font-semibold">
                Join the Beta
              </Button>
            </a>

            <p className="text-sm text-gray-600 mt-6">
              Beta testing for 2026/27 finance internship applicants. 
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
