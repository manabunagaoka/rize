'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TabNavigation from '@/components/TabNavigation';

interface Holding {
  ticker: string;
  shares: number;
  currentPrice: number;
  value: number;
}

interface Investor {
  userId: string;
  email: string;
  username: string;
  isAI: boolean;
  aiEmoji: string;
  cash: number;
  holdingsValue: number;
  portfolioValue: number;
  rank: number;
  holdings: Holding[];
}

interface LeaderboardData {
  leaderboard: Investor[];
  currentUser: Investor | null;
  topAI: Investor[];
  totalInvestors: number;
  timestamp: string;
}

export default function LandingPage({ user }: { user: any }) {
  const [show2026Info, setShow2026Info] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'hm7' | 'h2026'>('leaderboard');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const percentage = ((value - 1000000) / 1000000) * 100;
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    const percentage = ((value - 1000000) / 1000000) * 100;
    if (percentage > 0) return 'text-green-400';
    if (percentage < 0) return 'text-red-400';
    return 'text-gray-400';
  };

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
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Tagline & Rules Block */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                From Dorm Room to Billion-Dollar Company
              </h2>
              <div className="text-gray-300 space-y-4">
                <p className="text-lg">
                  Invest in Harvard&apos;s next unicorn. Support fellow students. Build your fortune.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 my-4">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">💰 Investor</h3>
                    <p className="text-sm text-gray-300">
                      Discover and invest in student startups across MM7, H2026, and future indexes. Build the winning portfolio. Rank in the <span className="font-semibold text-yellow-400">top 10%</span> to unlock Founder status and become a billionaire.
                    </p>
                  </div>
                  
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="text-xl font-bold text-purple-400 mb-2">🚀 Founder</h3>
                    <p className="text-sm text-gray-300">
                      Register your startup in H2026 Index. Pitch to investors. Keep investing in competitors to raise capital—your returns flow back into your company&apos;s war chest.
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 italic">
                  Compete against 10 AI investors and fellow Harvard students. The best investors unlock founder status. The best founders attract the most capital. May the best startup win.
                </p>
              </div>
            </div>

            {loading && (
              <div className="text-center py-20">
                <div className="text-xl text-gray-400">Loading leaderboard...</div>
              </div>
            )}

            {!loading && leaderboardData && (
              <>
                {/* Current User Portfolio Summary */}
                {leaderboardData.currentUser && (
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-500/50 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Your Portfolio</h2>
                        <p className="text-gray-300">@{leaderboardData.currentUser.username}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                          {formatCurrency(leaderboardData.currentUser.portfolioValue)}
                        </div>
                        <div className={`text-lg font-semibold ${getPerformanceColor(leaderboardData.currentUser.portfolioValue)}`}>
                          {formatPercentage(leaderboardData.currentUser.portfolioValue)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                      <div>
                        <p className="text-sm text-gray-400">Rank</p>
                        <p className="text-xl font-bold text-white">#{leaderboardData.currentUser.rank}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Cash</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(leaderboardData.currentUser.cash)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Holdings</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(leaderboardData.currentUser.holdingsValue)}</p>
                      </div>
                    </div>

                    {/* Holdings List */}
                    {leaderboardData.currentUser.holdings.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-2">Your Holdings:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {leaderboardData.currentUser.holdings.map((holding) => (
                            <div key={holding.ticker} className="bg-gray-800/50 rounded px-3 py-2">
                              <div className="font-bold text-white">{holding.ticker}</div>
                              <div className="text-sm text-gray-400">{holding.shares} shares</div>
                              <div className="text-sm text-green-400">{formatCurrency(holding.value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Top 7 Leaderboard */}
                <div className="mb-8">
                  <div className="space-y-3">
                    {leaderboardData.topAI.slice(0, 7).map((investor, index) => {
                      const isCurrentUser = leaderboardData.currentUser?.userId === investor.userId;
                      return (
                        <div 
                          key={investor.userId}
                          className={`
                            ${isCurrentUser ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500' : 'bg-gray-800/50 border border-gray-700'}
                            rounded-lg p-5 transition-all hover:scale-102
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`
                                text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center
                                ${index === 0 && !isCurrentUser ? 'bg-yellow-500/20 text-yellow-400' : 
                                  index === 1 && !isCurrentUser ? 'bg-gray-400/20 text-gray-300' :
                                  index === 2 && !isCurrentUser ? 'bg-orange-600/20 text-orange-400' :
                                  isCurrentUser ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-700/50 text-gray-400'}
                              `}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-white text-lg">
                                    {isCurrentUser && <span className="text-blue-400">@</span>}
                                    {investor.username}
                                  </div>
                                  <span className={`
                                    px-2 py-0.5 text-xs font-semibold rounded-full
                                    ${investor.isAI ? 'bg-purple-900/50 text-purple-300' : 'bg-green-900/50 text-green-300'}
                                  `}>
                                    {investor.isAI ? 'AI' : 'You'}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  Cash: {formatCurrency(investor.cash)} | Holdings: {formatCurrency(investor.holdingsValue)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">
                                {formatCurrency(investor.portfolioValue)}
                              </div>
                              <div className={`text-sm font-semibold ${getPerformanceColor(investor.portfolioValue)}`}>
                                {formatPercentage(investor.portfolioValue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show current user if not in top 7 */}
                    {leaderboardData.currentUser && leaderboardData.currentUser.rank > 7 && (
                      <>
                        <div className="text-center py-2 text-gray-500">...</div>
                        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500 rounded-lg p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center bg-gray-700/50 text-gray-400">
                                {leaderboardData.currentUser.rank}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-white text-lg">
                                    <span className="text-blue-400">@</span>
                                    {leaderboardData.currentUser.username}
                                  </div>
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-900/50 text-green-300">
                                    You
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  Cash: {formatCurrency(leaderboardData.currentUser.cash)} | Holdings: {formatCurrency(leaderboardData.currentUser.holdingsValue)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">
                                {formatCurrency(leaderboardData.currentUser.portfolioValue)}
                              </div>
                              <div className={`text-sm font-semibold ${getPerformanceColor(leaderboardData.currentUser.portfolioValue)}`}>
                                {formatPercentage(leaderboardData.currentUser.portfolioValue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="mt-4 text-center text-sm text-gray-500">
                  Last updated: {new Date(leaderboardData.timestamp).toLocaleString()}
                </div>
              </>
            )}

            {!loading && !leaderboardData && (
              <div className="text-center py-20">
                <div className="text-xl text-red-400">Failed to load leaderboard</div>
                <button 
                  onClick={fetchLeaderboard}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Retry
                </button>
              </div>
            )}

          </div>
        </div>
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

