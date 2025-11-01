'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';

export default function LandingPage({ user }: { user: any }) {
  const [show2026Info, setShow2026Info] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'hm7' | 'h2026'>('leaderboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <Header user={user} />

      {/* Tab Navigation */}
      <TabNavigation 
        defaultTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Leaderboard Tab Content */}
      {activeTab === 'leaderboard' && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8">🏆 MM7 Index Leaderboard</h2>
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">Leaderboard coming soon! Your username: <span className="text-green-400 font-bold">ManaMana</span></p>
              <p className="text-gray-500 mt-4">Compete against AI investors and fellow Harvard students.</p>
            </div>
          </div>
        </section>
      )}

      {/* HM7 Tab Content (Existing Landing Page) */}
      {activeTab === 'hm7' && (
        <>
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
              {/* Harvard Magnificent 7 Competition */}
              <Link 
                href="/competitions?competition=legendary"
                className="group relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border-2 border-yellow-600/30 hover:border-yellow-500 transition-all duration-300 hover:scale-105 cursor-pointer block"
              >
                <h3 className="text-3xl font-bold text-white mb-3">
                  Harvard Magnificent 7 Index
                </h3>
                
                <p className="text-gray-300 mb-6">
                  Invest in companies you like and compete against other fellows and AI Investors. Winner gets to invest your earning in your own startup.
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-white font-medium">Invest & Compete</p>
                  </div>
                  
                  <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold">
                    Active Now
                  </div>
                </div>
                
                <div className="mt-6 text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Enter Competition
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>

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
        </>
      )}

      {/* H2026 Tab Content (Locked) */}
      {activeTab === 'h2026' && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-800/50 rounded-lg p-12">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-3xl font-bold text-white mb-4">H2026 Index Locked</h2>
              <p className="text-gray-400 mb-6">
                Achieve <span className="text-green-400 font-bold">+10% portfolio gain</span> to unlock this index
              </p>
              <div className="max-w-md mx-auto bg-gray-700/50 rounded-full h-4 mb-4">
                <div className="bg-green-500 h-4 rounded-full" style={{width: '42%'}}></div>
              </div>
              <p className="text-gray-500">Current: +4.2% | Target: +10%</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

