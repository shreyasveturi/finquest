import { ARTICLE_URL } from '../content/rachelReevesBudget';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold mb-4">Finquest</h4>
            <p className="text-sm">Learn finance news through real articles and interactive checkpoints.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/lesson" className="hover:text-white transition">Try Demo</a></li>
              <li><a href="https://forms.gle/zh4w6jL81stBqf8q6" target="_blank" rel="noreferrer" className="hover:text-white transition">Join Beta</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white transition">About</a></li>
              <li><a href="https://www.ft.com/content/f8a8ad84-e351-4c7b-aa90-e5ce2bf665b4" target="_blank" rel="noreferrer" className="hover:text-white transition">FT Attribution</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Learn</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white transition">How it Works</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-sm">
          <p className="mb-2">© 2025 Finquest. Educational tool for learning market concepts.</p>
          <p className="text-xs">Not affiliated with the Financial Times or UK Government. For educational use only.</p>
        </div>
      </div>
    </footer>
  );
}
