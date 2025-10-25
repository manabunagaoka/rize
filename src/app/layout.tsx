import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Rize by Manaboodle - Harvard Edition',
  description: 'Rank Harvard\'s greatest startups. Vote on legendary companies. Submit your startup. Compete for top 10.',
  keywords: ['Harvard', 'startups', 'ranking', 'voting', 'student projects', 'entrepreneurship'],
  authors: [{ name: 'Manaboodle' }],
  openGraph: {
    title: 'Rize by Manaboodle - Harvard Edition',
    description: 'Rank Harvard\'s greatest startups and compete for the top 10',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
