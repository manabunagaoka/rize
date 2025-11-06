'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import InvestorProfileModal from '@/components/InvestorProfileModal';
import ActivityTimeline from '@/components/ActivityTimeline';
import { Crown, Trophy, Award, TrendingUp, TrendingDown, User, Bot, GraduationCap, BarChart3 } from 'lucide-react';

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
  aiStrategy?: string;
  aiCatchphrase?: string;
  aiStatus?: string;
  investorTier?: string;
  founderTier?: string;
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

type FilterType = 'all' | 'students' | 'ai';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
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

  const getPercentile = () => {
    if (!data?.currentUser) return null;
    const percentile = ((data.totalInvestors - data.currentUser.rank + 1) / data.totalInvestors) * 100;
    return Math.round(percentile);
  };

  const getTierBadge = (tier?: string, status?: string) => {
    if (!tier && !status) return null;
    
    const tierStyles: Record<string, string> = {
      'TITAN': 'bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text',
      'ORACLE': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text',
      'ALCHEMIST': 'bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text',
      'UNICORN': 'bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text',
      'PHOENIX': 'bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text',
      'DRAGON': 'bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text',
    };

    const statusStyles: Record<string, string> = {
      'RETIRED': 'text-gray-500 opacity-70',
      'LEGENDARY': 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-transparent bg-clip-text animate-pulse',
      'PAUSED': 'text-gray-600',
    };

    return (
      <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
        {tier && (
          <span className={tierStyles[tier] || 'text-gray-400'}>
            {tier}
          </span>
        )}
        {status && status !== 'ACTIVE' && (
          <span className={statusStyles[status] || 'text-gray-400'}>
            • {status}
          </span>
        )}
      </div>
    );
  };

  const filteredLeaderboard = data?.leaderboard.filter(investor => {
    if (filter === 'students') return !investor.isAI;
    if (filter === 'ai') return investor.isAI;
    return true;
  }) || [];

  const top3 = filteredLeaderboard.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Header user={null} />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-xl text-gray-400">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Header user={null} />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-xl text-red-400">{error || 'Failed to load data'}</div>
          <button 
            onClick={fetchLeaderboard}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={data?.currentUser ? { email: data.currentUser.email, id: data.currentUser.userId, name: data.currentUser.username, classCode: '' } : null} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                  Compete
                </h1>
                <p className="text-gray-400 text-base md:text-lg mb-2">Real-time rankings • 10 AI investors • Live market competition</p>
                <p className="text-gray-500 text-sm md:text-base">
                  Track your rank, view your performance, and compete against AI investors and fellow students. Can you beat the AI?
                </p>
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live • Updated {data ? new Date(data.timestamp).toLocaleTimeString() : '—'}</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-3 py-2 rounded-lg transition-all ${
                  filter === 'all' 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/50' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <User className="inline w-4 h-4 mr-2" /> All
              </button>
              <button 
                onClick={() => setFilter('students')} 
                className={`px-3 py-2 rounded-lg transition-all ${
                  filter === 'students' 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/50' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <GraduationCap className="inline w-4 h-4 mr-2" /> Students
              </button>
              <button 
                onClick={() => setFilter('ai')} 
                className={`px-3 py-2 rounded-lg transition-all ${
                  filter === 'ai' 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/50' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Bot className="inline w-4 h-4 mr-2" /> AI
              </button>
            </div>
          </div>

          {/* Your Rank Card */}
          {data?.currentUser ? (
            <div className="bg-gray-800 border-2 border-blue-500 rounded-2xl p-6 mb-8 hover:border-blue-400 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Your Performance</h2>
                  </div>
                  <p className="text-gray-300">@{data.currentUser.username}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white mb-1">
                    #{data.currentUser.rank}
                  </div>
                  <div className="text-sm text-gray-400">
                    of {data.totalInvestors}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Portfolio Value</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{formatCurrency(data.currentUser.portfolioValue)}</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Performance</p>
                  <div className="flex items-center gap-1">
                    {((data.currentUser.portfolioValue - 1000000) / 1000000) * 100 >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <p className={`text-xl md:text-2xl font-bold ${getPerformanceColor(data.currentUser.portfolioValue)}`}>
                      {formatPercentage(data.currentUser.portfolioValue)}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Cash</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{formatCurrency(data.currentUser.cash)}</p>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Holdings</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{formatCurrency(data.currentUser.holdingsValue)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/50 rounded-2xl p-6 mb-8 text-center">
              <User className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Sign in to compete</h3>
              <p className="text-gray-400 mb-4">Track your rank, view your performance, and compete against AI investors</p>
              <button 
                onClick={() => window.location.href = '/login?redirect_to=/compete'}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-pink-500/30"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="mb-8">
            <ActivityTimeline />
          </div>

          {/* Leaderboard Table */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Investor
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Portfolio Value
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredLeaderboard.map((investor) => {
                    const isCurrentUser = data?.currentUser?.userId === investor.userId;
                    return (
                      <tr 
                        key={investor.userId}
                        onClick={() => setSelectedInvestor(investor)}
                        className={`
                          ${isCurrentUser ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : 'hover:bg-gray-700/30'}
                          transition-colors cursor-pointer
                        `}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xl font-bold text-white">#{investor.rank}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {investor.isAI ? (
                              <Bot className="w-5 h-5 text-purple-400" />
                            ) : (
                              <User className="w-5 h-5 text-green-400" />
                            )}
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                {isCurrentUser && <span className="text-blue-400">● </span>}
                                {investor.username}
                                <span className="text-xs text-gray-500">ⓘ</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-sm text-gray-400">
                                  {investor.isAI ? 'AI Investor' : 'Student'}
                                </div>
                                {getTierBadge(investor.investorTier, investor.aiStatus)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-xl font-bold text-white">
                            {formatCurrency(investor.portfolioValue)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatCurrency(investor.cash)} cash
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {((investor.portfolioValue - 1000000) / 1000000) * 100 >= 0 ? (
                              <TrendingUp className="w-5 h-5 text-green-400" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-400" />
                            )}
                            <div className={`text-xl font-bold ${getPerformanceColor(investor.portfolioValue)}`}>
                              {formatPercentage(investor.portfolioValue)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time prices</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>{data?.totalInvestors} total investors</span>
            </div>
            {data?.currentUser && getPercentile() && (
              <>
                <span>•</span>
                <span>You&apos;re in the top {getPercentile()}%</span>
              </>
            )}
            <span>•</span>
            <span>Updated {new Date(data?.timestamp || '').toLocaleTimeString()}</span>
          </div>

        </div>
      </div>

      {/* Investor Profile Modal */}
      <InvestorProfileModal 
        investor={selectedInvestor} 
        onClose={() => setSelectedInvestor(null)} 
      />
    </div>
  );
}
