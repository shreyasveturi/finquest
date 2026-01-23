import type { Metadata } from 'next';
import { Geist, Geist_Mono, Merriweather } from 'next/font/google';
import './globals.css';
import { ClientLayout } from './client-layout';

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
  title: 'Scio — Competitive Reasoning Battles',
  description: 'Test your reasoning under pressure in real-time 1v1 battles. Earn ELO ratings and climb the leaderboard.',
};

const fontClasses = `${geistSans.variable} ${geistMono.variable} ${merriweather.variable}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <ClientLayout fontClasses={fontClasses}>{children}</ClientLayout>
    </html>
  );
}
