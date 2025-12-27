import Link from 'next/link';
import { LESSONS, DEFAULT_LESSON_SLUG } from '@/data/lessons';

export default function DemoSelectorPage() {
  const reeves = LESSONS.find((l) => l.slug === DEFAULT_LESSON_SLUG)!;
  const chip = LESSONS.find((l) => l.slug === 'us-china-chip-trade-practices');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-16 md:py-20 space-y-10">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500 font-semibold">Demo lessons</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">Pick a demo to explore</h1>
          <p className="text-lg text-gray-700">Inline explanations, checkpoints, and macro reasoning links.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href={`/lesson/${reeves.slug}`}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 mb-2">Featured</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">UK Budget: Reeves signals fiscal stance</h3>
            <p className="text-sm text-gray-700">Spending, taxation, and market implications</p>
            <div className="mt-4 inline-flex items-center gap-2 text-blue-700 font-semibold">
              <span>Start</span>
              <span>→</span>
            </div>
          </Link>

          {chip && (
            <Link
              href={`/lesson/${chip.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 mb-2">New</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">US accuses China of unfair chip trade practices</h3>
              <p className="text-sm text-gray-700">Semiconductors, tariffs, and global supply chains</p>
              <div className="mt-4 inline-flex items-center gap-2 text-blue-700 font-semibold">
                <span>Start</span>
                <span>→</span>
              </div>
            </Link>
          )}

          <div className="relative rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-gray-500 cursor-not-allowed group">
            <h3 className="text-xl font-semibold text-gray-700 mb-1">Upload your own document</h3>
            <p className="text-sm text-gray-600">Coming soon</p>
            <div className="mt-4 inline-flex items-center gap-2 text-gray-500 font-semibold">
              <span>Coming soon</span>
            </div>
            <div className="absolute inset-0" title="Coming soon — upload a document and Scio will generate checkpoints and macro reasoning links." />
          </div>
        </div>
      </div>
    </div>
  );
}
