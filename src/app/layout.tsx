import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DisclaimerModal from '@/components/DisclaimerModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Rize by Manaboodle - Investment Game',
  description: 'Educational investment simulation. Build your portfolio with 1M free MTK tokens. Compete against AI investors. Learn investment strategies.',
  keywords: ['investment game', 'portfolio simulation', 'Harvard startups', 'educational finance', 'MTK tokens'],
  authors: [{ name: 'Manaboodle' }],
  openGraph: {
    title: 'Rize by Manaboodle - Investment Game',
    description: 'Build your portfolio with 1M free tokens. Compete against 10 AI investors.',
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
        <DisclaimerModal />
        {children}
        <footer className="bg-gray-950 border-t border-gray-800 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-xs space-y-2">
            <p className="text-yellow-400 font-semibold">
              ⚠️ MTK has no real value. For educational and entertainment purposes only.
            </p>
            <div className="flex justify-center gap-6">
              <a href="/terms" className="hover:text-pink-400 transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-pink-400 transition-colors">Privacy Policy</a>
              <a href="https://www.manaboodle.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                Manaboodle
              </a>
            </div>
            <p>© 2025 Manaboodle. RIZE is an educational simulation platform.</p>
            <p className="text-gray-600">
              Must be 13+ to play. We are not responsible for data loss or service interruptions.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
