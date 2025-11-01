'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

interface Pitch {
  id: string;
  name: string;
  description: string;
  currentPrice: number;
  priceChange: number;
  availableSupply: number;
}

export default function HM7Page() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitches = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Later we'll fetch from API
      const mockPitches: Pitch[] = [
        {
          id: '1',
          name: 'EduTech AI',
          description: 'Revolutionizing education with AI-powered personalized learning',
          currentPrice: 115.30,
          priceChange: 15.3,
          availableSupply: 500
        },
        {
          id: '2',
          name: 'HealthOS',
          description: 'Digital health platform connecting students with campus wellness resources',
          currentPrice: 110.70,
          priceChange: 10.7,
          availableSupply: 750
        },
        {
          id: '3',
          name: 'ClimateDAO',
          description: 'Blockchain-based carbon credit marketplace for campus sustainability',
          currentPrice: 108.90,
          priceChange: 8.9,
          availableSupply: 600
        },
        {
          id: '4',
          name: 'StudyBuddy',
          description: 'AI-powered study group matching and collaboration platform',
          currentPrice: 105.20,
          priceChange: 5.2,
          availableSupply: 800
        },
        {
          id: '5',
          name: 'CampusEats',
          description: 'Student-run food delivery optimizing dining hall efficiency',
          currentPrice: 102.80,
          priceChange: 2.8,
          availableSupply: 650
        },
        {
          id: '6',
          name: 'ResearchHub',
          description: 'Connecting undergrads with research opportunities and lab positions',
          currentPrice: 98.50,
          priceChange: -1.5,
          availableSupply: 700
        },
        {
          id: '7',
          name: 'DormSwap',
          description: 'Peer-to-peer marketplace for textbooks, furniture, and dorm essentials',
          currentPrice: 95.40,
          priceChange: -4.6,
          availableSupply: 550
        }
      ];
      setPitches(mockPitches);
    } catch (err) {
      console.error('Error fetching pitches:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Header user={null} />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-xl text-gray-400">Loading HM7 Index...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={null} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              HM7 Index
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Harvard Magnificent 7 - Elite Student Ventures
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Invest in the next generation of Harvard unicorns. These 7 student-led startups represent the future of innovation.
            </p>
          </div>
        </div>
      </div>

      {/* Pitch Cards */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map((pitch, index) => (
            <div 
              key={pitch.id} 
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'bg-gray-700/50 text-gray-400'}
                  `}>
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-white">{pitch.name}</h3>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 min-h-[40px]">{pitch.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Current Price</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(pitch.currentPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">24h Change</span>
                  <span className={`text-sm font-semibold ${pitch.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(pitch.priceChange)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Available Shares</span>
                  <span className="text-sm font-medium text-white">{pitch.availableSupply}</span>
                </div>
              </div>

              <Link
                href={`/vote?pitch=${pitch.id}`}
                className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition text-center"
              >
                Invest Now
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-12 bg-gray-800/30 border border-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">About HM7 Index</h2>
          <p className="text-gray-400 mb-4">
            The Harvard Magnificent 7 (HM7) Index tracks the top 7 student startups currently being built by Harvard students. 
            These companies are selected based on innovation, market potential, and team strength.
          </p>
          <p className="text-gray-400">
            Invest your Manaboodle Tokens (MTK) in these startups and compete against AI investors and fellow students to build 
            the winning portfolio. The best investors earn exclusive titles and unlock the ability to register their own startup 
            in future indexes.
          </p>
        </div>
      </div>
    </div>
  );
}
