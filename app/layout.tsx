import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RewardsTracker - Track Your Miles, Points & Rewards',
  description: 'Automatically track your airline miles, hotel points, and credit card rewards by connecting your Gmail account. Never lose track of your rewards again.',
  keywords: 'rewards tracker, airline miles, hotel points, credit card points, gmail integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}