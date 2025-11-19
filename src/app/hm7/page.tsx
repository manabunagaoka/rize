'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PitchCard from '@/components/PitchCard';
import TradeLoadingOverlay from '@/components/TradeLoadingOverlay';
import Link from 'next/link';

// HM7 - Harvard Magnificent 7 (Original Index)
const HM7_STORIES = [
  { id: 1, name: 'Meta Platforms, Inc.', founder: 'Mark Zuckerberg', year: '2004', valuation: '$1.5T', marketCap: 1510000000000, ticker: 'META',
    pitch: 'Connects billions of people through social networking, messaging, and immersive digital platforms.',
    funFact: 'Mark Zuckerberg built the first version in his Harvard dorm in 2004.',
    color: 'from-blue-500 to-blue-600' },
  { id: 2, name: 'Microsoft Corporation', founder: 'Bill Gates', year: '1975', valuation: '$3.7T', marketCap: 3670000000000, ticker: 'MSFT',
    pitch: 'Empowers individuals and organizations worldwide with leading software, cloud, devices, and AI solutions.',
    funFact: 'Employees celebrate their tenure with 1 lb of M&Ms for each year worked.',
    color: 'from-green-500 to-green-600' },
  { id: 3, name: 'Airbnb, Inc.', founder: 'Nathan Blecharczyk', year: '2008', valuation: '$72B', marketCap: 72000000000, ticker: 'ABNB',
    pitch: 'Enables travelers to book homes and experiences globally, and empowers hosts to earn income from their spaces.',
    funFact: 'Airbnb\'s name comes from its early "air mattress" business model.',
    color: 'from-pink-500 to-pink-600' },
  { id: 4, name: 'Cloudflare, Inc.', founder: 'Michelle Zatlyn', year: '2009', valuation: '$69B', marketCap: 69000000000, ticker: 'NET',
    pitch: 'Secures and accelerates websites, APIs, and networks for millions of online properties.',
    funFact: 'Cloudflare powers about 20% of all internet traffic.',
    color: 'from-cyan-500 to-cyan-600' },
  { id: 5, name: 'Grab Holdings', founder: 'Anthony Tan', year: '2012', valuation: '$10.1B', marketCap: 10100000000, ticker: 'GRAB',
    pitch: 'Southeast Asia\'s leading app for ride-hailing, food delivery, and digital payments.',
    funFact: 'Grab started as a student project at Harvard Business School.',
    color: 'from-emerald-500 to-emerald-600' },
  { id: 6, name: 'Moderna, Inc.', founder: 'Harvard Faculty', year: '2010', valuation: '$9.7B', marketCap: 9700000000, ticker: 'MRNA',
    pitch: 'Develops messenger RNA-based medicines and vaccines for infectious diseases and beyond.',
    funFact: 'Moderna\'s COVID-19 vaccine was developed in record time and became the second U.S.-approved mRNA vaccine.',
    color: 'from-red-500 to-red-600' },
  { id: 7, name: 'Klaviyo, Inc.', founder: 'Andrew Bialecki', year: '2012', valuation: '$8.2B', marketCap: 8200000000, ticker: 'KVYO',
    pitch: 'AI-first CRM platform that helps e-commerce businesses drive growth by unifying customer data and marketing automation.',
    funFact: 'Klaviyo\'s name comes from the Spanish word "clavija" (mountaineering pin), reflecting their goal to support brands as they climb to success.',
    color: 'from-amber-500 to-amber-600' }
];

const SUCCESS_STORIES = HM7_STORIES;

export default function HM7Page() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [marketCaps, setMarketCaps] = useState<Record<string, any>>({});
  const [storiesWithLiveData, setStoriesWithLiveData] = useState(SUCCESS_STORIES);
  const [showTradeLoading, setShowTradeLoading] = useState(false);

  useEffect(() => {
    // Sync prices on page load
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
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMarketCaps(data);
        
        // Update SUCCESS_STORIES with live market cap data
        const updatedStories = SUCCESS_STORIES.map(story => ({
          ...story,
          marketCap: data[story.ticker]?.marketCap || story.marketCap,
          valuation: data[story.ticker]?.valuationDisplay || story.valuation
        }));
        
        setStoriesWithLiveData(updatedStories);
      }
    } catch (error) {
      console.error('Failed to fetch market caps:', error);
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
    console.log('[HM7] Trade completed, refreshing page data');
    
    // Trigger refresh of all PitchCards by incrementing key
    setRefreshKey(prev => prev + 1);
    
    // No need for page reload - the PitchCard already refreshed with API delay
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-transparent bg-clip-text">
              HM7 Index
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Harvard Magnificent 7 - Tech Giants & Industry Leaders
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              The original seven: From Meta and Microsoft to emerging tech leaders. Combined market value: $5.2+ trillion.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/trade" className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span>Back to Trade</span>
              </Link>
              <Link href="/hm720" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition">
                <span>View HM7 2.0 Index</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* HM7 Companies */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storiesWithLiveData.map((story, index) => (
              <PitchCard
                key={`${story.id}-${refreshKey}`}
                story={story}
                isAuthenticated={!!user}
                rank={index + 1}
                onTradeComplete={handleTradeComplete}
              />
            ))}
          </div>
        </div>
      </div>

        {/* Additional Info */}
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto bg-gray-800/30 border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">About the HM7 Index</h2>
            <p className="text-gray-400 mb-4">
              The Harvard Magnificent 7 (HM7) Index tracks the original tech giants and industry leaders founded by Harvard alumni. 
              From Mark Zuckerberg&apos;s Meta to Bill Gates&apos; Microsoft, these 7 companies represent 
              the foundation of Harvard&apos;s entrepreneurial legacy with over $5.2 trillion in combined market value.
            </p>
            <p className="text-gray-400 mb-4">
              <strong className="text-white">Trade with real stock prices:</strong> All prices are live from 
              the stock market via Finnhub API. When you invest in META, you&apos;re trading at the real 
              Meta Platforms stock price.
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
