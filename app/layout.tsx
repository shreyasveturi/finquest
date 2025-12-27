import type { Metadata } from 'next';
import { Geist, Geist_Mono, Merriweather } from 'next/font/google';
import './globals.css';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        <NavBar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
