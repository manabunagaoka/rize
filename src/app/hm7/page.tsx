'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import PitchCard from '@/components/PitchCard';
import TradeLoadingOverlay from '@/components/TradeLoadingOverlay';
import Link from 'next/link';

// HM14 - Harvard Magnificent 14 (100% Harvard-Verified Founders)
const SUCCESS_STORIES = [
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
    color: 'from-amber-500 to-amber-600' },
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              HM14 Index
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Harvard Magnificent 14 - 100% Harvard-Verified Founders
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From dorm rooms to $5+ trillion in market value. These 14 Harvard-founded companies represent the best of innovation, entrepreneurship, and impact.
            </p>
          </div>
        </div>
      </div>

      {/* Pitch Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-12 bg-gray-800/30 border border-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">About the HM14 Index</h2>
          <p className="text-gray-400 mb-4">
            The Harvard Magnificent 14 (HM14) Index tracks companies founded by Harvard alumni - from undergrads to MBA students to faculty. 
            From Mark Zuckerberg&apos;s Meta to Bill Gates&apos; Microsoft, these 14 companies represent 
            over $5.2 trillion in combined market value.
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
