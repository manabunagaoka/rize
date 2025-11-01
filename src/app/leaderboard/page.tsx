'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

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

export default function LeaderboardPage() {
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <Header user={null} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">MM7 Index Leaderboard</h1>
            <p className="text-gray-400">
              Compete against AI investors and fellow Harvard students
            </p>
          </div>

          {/* Current User Portfolio Summary */}
          {data.currentUser && (
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-500/50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Your Portfolio</h2>
                  <p className="text-gray-300">@{data.currentUser.username}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(data.currentUser.portfolioValue)}
                  </div>
                  <div className={`text-lg font-semibold ${getPerformanceColor(data.currentUser.portfolioValue)}`}>
                    {formatPercentage(data.currentUser.portfolioValue)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <p className="text-sm text-gray-400">Rank</p>
                  <p className="text-xl font-bold text-white">#{data.currentUser.rank}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Cash</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(data.currentUser.cash)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Holdings</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(data.currentUser.holdingsValue)}</p>
                </div>
              </div>

              {/* Holdings List */}
              {data.currentUser.holdings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Your Holdings:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {data.currentUser.holdings.map((holding) => (
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

          {/* Top AI Investors Section */}
          {data.topAI.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Top AI Investors (Benchmark)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.topAI.map((investor) => (
                  <div 
                    key={investor.userId}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-white">#{investor.rank} {investor.username}</div>
                      <div className="text-sm text-gray-500">AI</div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {formatCurrency(investor.portfolioValue)}
                    </div>
                    <div className={`text-sm font-semibold ${getPerformanceColor(investor.portfolioValue)}`}>
                      {formatPercentage(investor.portfolioValue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Full Rankings</h3>
              <p className="text-sm text-gray-400">Total Investors: {data.totalInvestors}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Investor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Portfolio Value
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.leaderboard.map((investor) => {
                    const isCurrentUser = data.currentUser?.userId === investor.userId;
                    return (
                      <tr 
                        key={investor.userId}
                        className={`
                          ${isCurrentUser ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : 'hover:bg-gray-800/30'}
                          transition-colors
                        `}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-white">#{investor.rank}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">
                            {isCurrentUser && <span className="text-blue-400">@</span>}
                            {investor.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            px-2 py-1 text-xs font-semibold rounded-full
                            ${investor.isAI ? 'bg-purple-900/50 text-purple-300' : 'bg-green-900/50 text-green-300'}
                          `}>
                            {investor.isAI ? 'AI' : 'Human'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-lg font-bold text-white">
                            {formatCurrency(investor.portfolioValue)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Cash: {formatCurrency(investor.cash)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-lg font-bold ${getPerformanceColor(investor.portfolioValue)}`}>
                            {formatPercentage(investor.portfolioValue)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>

        </div>
      </div>
    </div>
  );
}
