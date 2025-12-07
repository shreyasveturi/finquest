import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono, Merriweather } from 'next/font/google';
import './globals.css';
import { GOOGLE_FORM } from '../content/rachelReevesBudget';
import Footer from '../components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const merriweather = Merriweather({
  variable: '--font-merriweather',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
});

export const metadata: Metadata = {
  title: 'Scio — Gamified finance-news learning',
  description:
    'Turn finance articles into short interactive learning runs for internship prep. Try the Budget Demo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable} antialiased min-h-screen bg-white text-neutral-900 flex flex-col w-full`}>
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
