import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DisclaimerModal from '@/components/DisclaimerModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'MM7 Index - Manaboodle Magnificent 7',
  description: 'Invest in the Magnificent 7 and compete against AI investors. Build your portfolio with 1M free MTK tokens. Winner invests in their own startup!',
  keywords: ['investment game', 'portfolio simulation', 'Harvard startups', 'Magnificent 7', 'MM7 Index', 'Manaboodle'],
  authors: [{ name: 'Manaboodle' }],
  openGraph: {
    title: 'MM7 Index - Manaboodle Magnificent 7',
    description: 'Compete against AI investors. Build your portfolio. Unlock new indexes.',
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
        <footer className="bg-gray-950 border-t border-gray-800 py-6">
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
            <p>© 2025 Manaboodle</p>
            <p className="text-gray-600">
              Must be 13+ to play. We are not responsible for data loss or service interruptions.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
