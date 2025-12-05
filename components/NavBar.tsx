import Link from 'next/link';
import { GOOGLE_FORM } from '../content/rachelReevesBudget';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Scio
        </Link>

        {/* Right: Nav Links + CTA */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex gap-6">
            <Link href="/lesson" className="text-sm text-slate-700 hover:text-slate-900 transition">
              Demo
            </Link>
            <Link href="/about" className="text-sm text-slate-700 hover:text-slate-900 transition">
              About
            </Link>
          </div>

          <a
            href={GOOGLE_FORM}
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Join the beta
          </a>
        </div>
      </div>
    </nav>
  );
}
