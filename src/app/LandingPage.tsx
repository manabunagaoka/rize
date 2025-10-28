'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';

export default function LandingPage({ user }: { user: any }) {
  const [showLegendsInfo, setShowLegendsInfo] = useState(false);
  const [show2026Info, setShow2026Info] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <Header user={user} />

      {/* header is rendered by the shared <Header /> component above */}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            From Dorm Room<br />
            to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">Billion-Dollar Company</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Harvard&apos;s next unicorn is being built right now. Vote on the best student startups and discover the future before everyone else.
          </p>
        </div>
      </section>

      {/* Featured Competitions */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Harvard Legends Competition */}
          <div 
            onClick={() => setShowLegendsInfo(!showLegendsInfo)}
            className="group relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border-2 border-yellow-600/30 hover:border-yellow-500 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <h3 className="text-3xl font-bold text-white mb-3">
              Harvard Legends
            </h3>
            
            <p className="text-gray-300 mb-6">
              Vote on the best pitches from Harvard founders who built billion-dollar companies
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rule</p>
                <p className="text-white font-medium">Vote on the best pitch</p>
              </div>
              
              <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold">
                Active Now
              </div>
            </div>
            
            <div className="mt-6 text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              {showLegendsInfo ? 'Hide Details' : 'View Details'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showLegendsInfo ? "M5 15l7-7 7 7" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
              </svg>
            </div>
            
            {showLegendsInfo && (
              <div className="mt-6 pt-6 border-t border-yellow-600/30">
                <p className="text-gray-300 mb-4">
                  Explore legendary Harvard startups and vote on the best pitches. Learn from founders who built billion-dollar companies.
                </p>
                <Link 
                  href="/competitions?competition=legendary"
                  className="inline-block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-xl transition"
                >
                  Vote Your Favorite →
                </Link>
              </div>
            )}
          </div>

          {/* Harvard Class of 2026 Competition */}
          <div 
            onClick={() => setShow2026Info(!show2026Info)}
            className="group relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border-2 border-blue-600/30 hover:border-blue-500 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <h3 className="text-3xl font-bold text-white mb-3">
              Harvard Class of 2026
            </h3>
            
            <p className="text-gray-300 mb-6">
              Vote for your classmates&apos; startups. Best ideas get featured and investor introductions.
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-white font-medium">Coming Soon</p>
              </div>
              
              <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
                Opening Soon
              </div>
            </div>
            
            <div className="mt-6 text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              {show2026Info ? 'Hide Details' : 'View Details'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={show2026Info ? "M5 15l7-7 7 7" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
              </svg>
            </div>
            
            {show2026Info && (
              <div className="mt-6 pt-6 border-t border-blue-600/30">
                <p className="text-gray-300 mb-4">
                  The Harvard Class of 2026 competition is opening soon. Submit your startup and compete for rankings, features, and investor introductions.
                </p>
                <Link 
                  href="/competitions?competition=harvard-2026-main"
                  className="inline-block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition"
                >
                  Learn More →
                </Link>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 RIZE by Manaboodle · Harvard Edition</p>
        </div>
      </footer>
    </div>
  );
}
