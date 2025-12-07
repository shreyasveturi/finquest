import Link from 'next/link';
import { GOOGLE_FORM } from '../content/rachelReevesBudget';

export default function NavBar() {
  return (
    <nav className="w-full bg-white border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-3 md:py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="font-serif text-lg md:text-xl font-semibold text-neutral-900">
          Scio
        </Link>

        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          <Link
            href="/about"
            className="text-sm md:text-base text-neutral-700 hover:text-neutral-900 transition-all duration-150 ease-out hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="/lesson"
            className="text-sm md:text-base text-white bg-neutral-900 px-4 py-1.5 rounded-lg hover:opacity-90 transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform"
          >
            Try lesson
          </Link>
          <a
            href={GOOGLE_FORM}
            target="_blank"
            rel="noreferrer"
            className="text-sm md:text-base bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-150 ease-out active:scale-[0.98] active:transition-transform"
          >
            Join beta
          </a>
        </div>
      </div>
    </nav>
  );
}
