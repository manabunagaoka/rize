'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PitchCard from '@/components/PitchCard';
import TradeLoadingOverlay from '@/components/TradeLoadingOverlay';
import Link from 'next/link';

// HM7 2.0 - Next Generation Harvard Companies
const HM7_V2_STORIES = [
  { id: 8, name: 'Affirm Holdings', founder: 'Alex Rampell', year: '2012', valuation: '$10.3B', marketCap: 10300000000, ticker: 'AFRM',
    pitch: 'Provides flexible "buy now, pay later" financing to consumers at point of sale.',
    funFact: 'Affirm\'s founders previously built successful companies including PayPal.',
    color: 'from-violet-500 to-violet-600' },
  { id: 9, name: 'Peloton Interactive', founder: 'John Foley', year: '2012', valuation: '$3.1B', marketCap: 3100000000, ticker: 'PTON',
    pitch: 'Combines fitness equipment, live and on-demand classes for immersive home workouts.',
    funFact: 'The company\'s first bike was delivered to customers by Peloton employees personally.',
    color: 'from-orange-500 to-orange-600' },
  { id: 10, name: 'Asana, Inc.', founder: 'Justin Rosenstein', year: '2008', valuation: '$4.7B', marketCap: 4700000000, ticker: 'ASAN',
    pitch: 'Simplifies work management for teams with tasks, projects, and workflow automation.',
    funFact: 'Co-founder Justin Rosenstein also helped create Facebook\'s "Like" button.',
    color: 'from-purple-500 to-purple-600' },
  { id: 11, name: 'Lyft, Inc.', founder: 'Logan Green', year: '2012', valuation: '$3.8B', marketCap: 3800000000, ticker: 'LYFT',
    pitch: 'Offers on-demand shared rides and transportation services in the U.S.',
    funFact: 'Lyft started as Zimride, a rideshare platform for college students.',
    color: 'from-fuchsia-500 to-fuchsia-600' },
  { id: 12, name: 'ThredUp, Inc.', founder: 'James Reinhart', year: '2009', valuation: '$1.0B', marketCap: 1000000000, ticker: 'TDUP',
    pitch: 'Enables users to buy and sell secondhand clothing in an online thrift store.',
    funFact: 'ThredUp started when its co-founder wanted a way to clean out his closet.',
    color: 'from-teal-500 to-teal-600' },
  { id: 13, name: 'Nextdoor Holdings', founder: 'Nirav Tolia', year: '2010', valuation: '$800M', marketCap: 800000000, ticker: 'KIND',
    pitch: 'Connects neighbors and local communities using a private social network.',
    funFact: 'Nextdoor\'s founders launched the platform from a San Francisco apartment.',
    color: 'from-lime-500 to-lime-600' },
  { id: 14, name: 'Rent the Runway', founder: 'Jennifer Hyman', year: '2009', valuation: '$530M', marketCap: 530000000, ticker: 'RENT',
    pitch: 'Provides designer clothing and accessories for rent to women nationwide.',
    funFact: 'Jennifer Hyman pitched the idea to designers before prototyping a website.',
    color: 'from-rose-500 to-rose-600' }
];

const SUCCESS_STORIES = HM7_V2_STORIES;

export default function HM720Page() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [marketCaps, setMarketCaps] = useState<Record<string, any>>({});
  const [storiesWithLiveData, setStoriesWithLiveData] = useState(SUCCESS_STORIES);
  const [showTradeLoading, setShowTradeLoading] = useState(false);

  useEffect(() => {
    syncPrices();
    checkAuth();
    fetchMarketCaps();
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

  const fetchMarketCaps = async () => {
    try {
      const response = await fetch('/api/market-cap', {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMarketCaps(data);
        
        const updatedStories = SUCCESS_STORIES.map(story => ({
          ...story,
          ...(data[story.ticker] || {})
        }));
        setStoriesWithLiveData(updatedStories);
      }
    } catch (error) {
      console.error('Failed to fetch market caps:', error);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
        cache: 'no-store'
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
    console.log('[HM720] Trade completed, refreshing page data');
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Header user={user} />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-xl text-gray-400">Loading HM7 2.0 Index...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={user} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-indigo-500/10" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 text-transparent bg-clip-text">
              HM7 2.0 Index
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Next Generation - Consumer, Fintech & Emerging Leaders
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              The next wave of Harvard innovation: From Affirm and Peloton to emerging consumer brands. Shaping the future of technology and lifestyle.
            </p>
            <Link href="/hm7" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              <span>View HM7 Index</span>
            </Link>
          </div>
        </div>
      </div>

      {/* HM7 2.0 Companies */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storiesWithLiveData.map((story, index) => (
              <PitchCard
                key={`${story.id}-${refreshKey}`}
                story={story}
                isAuthenticated={!!user}
                rank={index + 8}
                onTradeComplete={handleTradeComplete}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto bg-gray-800/30 border border-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">About the HM7 2.0 Index</h2>
          <p className="text-gray-400 mb-4">
            The HM7 2.0 Index represents the next generation of Harvard innovation, featuring companies in consumer technology, 
            financial services, fitness, and social impact. These 7 companies showcase the breadth of Harvard&apos;s 
            entrepreneurial ecosystem beyond traditional tech giants.
          </p>
          <p className="text-gray-400 mb-4">
            <strong className="text-white">Trade with real stock prices:</strong> All prices are live from 
            the stock market via Finnhub API. Experience authentic trading with actual market data.
          </p>
          <p className="text-gray-400">
            Invest your Manaboodle Tokens (MTK) in these companies and compete against 10 AI investors to build 
            the winning portfolio. Every company is 100% Harvard-verified with real founders who attended Harvard.
          </p>
        </div>
      </div>

      {/* Trade Loading Overlay */}
      <TradeLoadingOverlay isVisible={showTradeLoading} message="Processing your trade" />
    </div>
  );
}
