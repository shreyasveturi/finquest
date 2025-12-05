'use client';

import NavBar from '../../components/NavBar';
import Button from '../../components/Button';
import { GOOGLE_FORM } from '../../content/rachelReevesBudget';

export default function About() {
  return (
    <>
      <NavBar />
      <div className="w-full bg-white min-h-screen">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
              Why Scio?
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Students preparing for finance internships are drowning in dry PDFs, 50-page market reports, and technical jargon. They memorize concepts without understanding implications. They can't discuss real market events with confidence.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Scio transforms finance articles into short, interactive learning experiences. Read real news. Get inline explanations. Answer implication questions. Build genuine understanding—not rote memorization.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Designed for students targeting 2026/27 finance internships and spring week programs. Built by people who've sat in those interviews and know what actually matters.
            </p>
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
                    <h3 className="font-semibold text-gray-900 text-lg">Predict First</h3>
                    <p className="text-gray-600 text-sm mt-1">Before reading, write your prediction about what the article will cover. Activate your thinking.</p>
                  </div>
                </div>
              </div>

              {/* Read */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Learn as You Read</h3>
                    <p className="text-gray-600 text-sm mt-1">Interactive explanations, tooltips, and AI insights embedded throughout. Answer checkpoint questions to test your understanding.</p>
                  </div>
                </div>
              </div>

              {/* Reflect */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl">💭</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Prove You Understand</h3>
                    <p className="text-gray-600 text-sm mt-1">Explain the main concept in your own words. Compare your thinking to expert responses. Build retrievable memory.</p>
                  </div>
                </div>
              </div>

              {/* Mastery */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Track Your Mastery</h3>
                    <p className="text-gray-600 text-sm mt-1">Earn XP for deep learning—predictions, reflections, and correct analysis. Watch your understanding grow.</p>
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
                <p className="text-gray-700">Learn from actual Financial Times articles and real market events—not textbooks or simulations.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Learning Over Engagement</h3>
                <p className="text-gray-700">Every feature exists to deepen understanding. No streaks, notifications, or FOMO mechanics that distract from learning.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Minimalist Design</h3>
                <p className="text-gray-700">Calm, focused aesthetic designed to reduce distractions. Read like an interactive notebook, not a gamified app.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Explanations</h3>
                <p className="text-gray-700">Highlight any text to get instant, interview-focused explanations. Understand the "why" and the "so what."</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Feedback</h3>
                <p className="text-gray-700">Compare your analysis to expert responses. Learn how actual analysts think about market events.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Interview Edge</h3>
                <p className="text-gray-700">This isn't just knowledge—it's the ability to discuss finance like you live and breathe it. That's what separates you in interviews.</p>
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
                <div className="font-semibold text-gray-900 mb-2">📅 Daily Learning Runs</div>
                <p className="text-gray-600">New macro + equities articles every day. Build momentum and track your learning progression.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="font-semibold text-gray-900 mb-2">⚔️ Duels</div>
                <p className="text-gray-600">Head-to-head challenges where you answer questions faster and better than your peers.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="font-semibold text-gray-900 mb-2">🏆 Clans & Leaderboards</div>
                <p className="text-gray-600">Compete with your cohort. Join or create a clan, see who's mastering what, climb together.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="font-semibold text-gray-900 mb-2">🗺️ Skill Map</div>
                <p className="text-gray-600">Visualize your mastery across markets, sectors, and concepts. See your growth visually.</p>
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
