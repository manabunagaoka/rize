'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PitchCard from '@/components/PitchCard';
import Link from 'next/link';

const SUCCESS_STORIES = [
  { id: 1, name: 'Facebook', founder: 'Mark Zuckerberg', year: '2004', valuation: '$1.2T', marketCap: 1200000000000, ticker: 'META',
    pitch: 'An online directory that connects people through social networks at colleges.',
    funFact: 'Started as "TheFacebook" - exclusive to Harvard students with a .edu email. Expanded to other Ivy League schools within months.',
    color: 'from-blue-500 to-blue-600' },
  { id: 2, name: 'Microsoft', founder: 'Bill Gates & Paul Allen', year: '1975', valuation: '$3.1T', marketCap: 3100000000000, ticker: 'MSFT',
    pitch: 'A computer on every desk and in every home, running our software.',
    funFact: 'Gates wrote a BASIC interpreter for the Altair 8800 in his dorm room. Sold it before even testing on real hardware - it worked.',
    color: 'from-green-500 to-green-600' },
  { id: 3, name: 'Dropbox', founder: 'Drew Houston', year: '2007', valuation: '$10B', marketCap: 10000000000, ticker: 'DBX',
    pitch: 'Your files, anywhere. One folder that syncs across all your devices.',
    funFact: 'Drew forgot his USB drive on a bus trip and coded the first prototype during the 4-hour ride. Launched at Y Combinator.',
    color: 'from-purple-500 to-purple-600' },
  { id: 4, name: 'Akamai', founder: 'Tom Leighton & Danny Lewin', year: '1998', valuation: '$15B', marketCap: 15000000000, ticker: 'AKAM',
    pitch: 'Make the internet faster by serving content from servers closer to users.',
    funFact: 'Started as an MIT/Harvard math project. Now delivers 30% of all web traffic globally including Netflix and Spotify.',
    color: 'from-cyan-500 to-cyan-600' },
  { id: 5, name: 'Reddit', founder: 'Steve Huffman & Alexis Ohanian', year: '2005', valuation: '$10B', marketCap: 10000000000, ticker: 'RDDT',
    pitch: 'The front page of the internet - where communities create and share content.',
    funFact: 'Pitched as "Memepool meets Delicious" at Y Combinator. Built in 3 weeks using Python. Now 500M+ monthly users.',
    color: 'from-orange-500 to-orange-600' },
  { id: 6, name: 'Warby Parker', founder: 'Neil Blumenthal & team', year: '2010', valuation: '$3B', marketCap: 3000000000, ticker: 'WRBY',
    pitch: 'Designer eyewear at a revolutionary price, while leading the way for socially conscious businesses.',
    funFact: 'Started because founder lost his glasses and was shocked by the $500 price. Buy a pair, give a pair model. Now valued at $3B.',
    color: 'from-indigo-500 to-indigo-600' },
  { id: 7, name: 'Booking.com', founder: 'Geert-Jan Bruinsma', year: '1996', valuation: '$100B', marketCap: 100000000000, ticker: 'BKNG',
    pitch: 'Book accommodations anywhere in the world with instant confirmation.',
    funFact: 'Started in Amsterdam, but expanded with Harvard MBA insights. Now books 1.5M room nights per day globally.',
    color: 'from-blue-400 to-blue-500' }
];

export default function HM7Page() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Sync prices on page load
    syncPrices();
    checkAuth();
  }, []);

  const syncPrices = async () => {
    try {
      await fetch('/api/sync-prices', {
        method: 'POST',
        credentials: 'include'
      });
      console.log('✅ Stock prices synced');
    } catch (error) {
      console.error('⚠️ Price sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    }
  };

  const handleTradeComplete = () => {
    // Trigger refresh of all PitchCards
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Header user={user} />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-xl text-gray-400">Loading HM7 Index...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={user} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              HM7 Index
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Harvard Magnificent 7 - Legendary Unicorns
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From dorm rooms to billion-dollar empires. These 7 Harvard-founded companies changed the world. 
              Now it&apos;s your turn to invest in the next generation.
            </p>
          </div>
        </div>
      </div>

      {/* Pitch Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUCCESS_STORIES.map((story, index) => (
            <PitchCard
              key={`${story.id}-${refreshKey}`}
              story={story}
              isAuthenticated={!!user}
              rank={index + 1}
              onTradeComplete={handleTradeComplete}
            />
          ))}
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-12 bg-gray-800/30 border border-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">About the HM7 Index</h2>
          <p className="text-gray-400 mb-4">
            The Harvard Magnificent 7 (HM7) Index tracks legendary companies founded by Harvard alumni. 
            From Mark Zuckerberg&apos;s Facebook to Bill Gates&apos; Microsoft, these companies represent 
            over $4.5 trillion in combined market value.
          </p>
          <p className="text-gray-400 mb-4">
            <strong className="text-white">Trade with real stock prices:</strong> All prices are live from 
            the stock market via Finnhub API. When you invest in META, you&apos;re trading at the real 
            Facebook stock price.
          </p>
          <p className="text-gray-400">
            Invest your Manaboodle Tokens (MTK) in these companies and compete against AI investors to build 
            the winning portfolio. Learn from the legends while building your fortune.
          </p>
        </div>
      </div>
    </div>
  );
}
