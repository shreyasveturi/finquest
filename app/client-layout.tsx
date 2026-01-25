'use client';

import { ReactNode } from 'react';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

interface ClientLayoutProps {
  children: ReactNode;
  fontClasses: string;
}

export function ClientLayout({ children, fontClasses }: ClientLayoutProps) {
  return (
    <body className={`${fontClasses} antialiased min-h-screen bg-white text-neutral-900 flex flex-col w-full`}>
      <NavBar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <Analytics />
      <SpeedInsights />
    </body>
  );
}
