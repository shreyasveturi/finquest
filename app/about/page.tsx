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
              Why Scio exists
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Finance interviews test your ability to think, not your ability to memorise answers. Yet most learning tools — especially AI — train the opposite.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Scio is built on a simple principle: <strong>attempt first, feedback second.</strong>
            </p>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="w-full py-16 md:py-20 bg-gray-50 border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">The Problem</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Critical thinking is eroding</h3>
                <p className="text-gray-700">
                  GenAI tools like ChatGPT excel at generating answers instantly. This is convenient — but it's broken the learning loop. Candidates copy-paste instead of reason. They memorise opinions instead of building arguments. They trade thinking for speed.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Interviews punish this</h3>
                <p className="text-gray-700">
                  Finance interviews don't test your ability to regurgitate takes. They test your ability to:
                </p>
                <ul className="mt-2 ml-4 space-y-1 text-gray-700">
                  <li>• Map second-order effects (shock → mechanism → impact)</li>
                  <li>• Weigh trade-offs and identify winners/losers</li>
                  <li>• Articulate uncertainty and conditions</li>
                  <li>• Defend your reasoning under pressure</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  If you've only consumed answers, you'll freeze under questioning.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Scio's antidote</h3>
                <p className="text-gray-700">
                  Force yourself to think before you see answers. Build reasoning chains. Compare your logic to expert analysis. Fail fast, learn deeply. This is how interview-ready thinking develops.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scio's Principle Section */}
        <section className="w-full py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">Scio's Principle</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
                <div className="text-lg font-bold text-blue-900 mb-2">Attempt First</div>
                <p className="text-sm text-blue-800">
                  Always reason before revealing. No answer peeking. Effort is the point.
                </p>
              </div>

              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6">
                <div className="text-lg font-bold text-indigo-900 mb-2">Feedback Second</div>
                <p className="text-sm text-indigo-800">
                  Compare your logic to expert reasoning. Identify gaps, not errors. Learn diagnostic thinking.
                </p>
              </div>

              <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
                <div className="text-lg font-bold text-purple-900 mb-2">Judgement Over Memorisation</div>
                <p className="text-sm text-purple-800">
                  Build the ability to reason under uncertainty. No memorised answers. Real thinking.
                </p>
              </div>
            </div>
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
        <section className="w-full py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">What Makes Scio Different</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Real articles, real markets</h3>
                <p className="text-gray-700">Learn from live Financial Times reporting and current events, not synthetic cases.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mechanism-first reasoning</h3>
                <p className="text-gray-700">We force you to build transmission channels (how does shock travel?) before discussing impact. This is how analysts think.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Multi-agent trade-offs</h3>
                <p className="text-gray-700">Every lesson maps winners and losers across stakeholder groups. Finance is about distribution, not just direction.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Uncertainty and conditions</h3>
                <p className="text-gray-700">We highlight what you don't know and what you'd need to watch. No false certainty.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">No answer dumping</h3>
                <p className="text-gray-700">We never auto-generate your reasoning. You build it. Feedback compares your logic to expert thinking — it doesn't rewrite your answer.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Minimum viable features</h3>
                <p className="text-gray-700">No gamification hacks, streaks, or engagement tricks. Just learning that actually works.</p>
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
              Ready to think differently?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Try the demo completely free. See how Scio trains reasoning, not answers.
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
