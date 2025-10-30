'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Investment {
  pitch_id: number;
  company_name: string;
  shares_owned: number;
  total_invested: number;
  avg_purchase_price: number;
  current_price: number;
  current_value: number;
  unrealized_gain_loss: number;
  gain_loss_percentage: number;
}

interface Balance {
  total_tokens: number;
  available_tokens: number;
  portfolio_value: number;
  all_time_gain_loss: number;
  total_invested: number;
}

interface Transaction {
  id: string;
  pitch_id: number;
  company_name: string;
  transaction_type: 'BUY' | 'SELL';
  shares: number;
  price_per_share: number;
  total_amount: number;
  timestamp: string;
}

const SUCCESS_STORIES = [
  { id: 1, name: 'Facebook', color: 'from-blue-500 to-blue-600' },
  { id: 2, name: 'Microsoft', color: 'from-green-500 to-green-600' },
  { id: 3, name: 'Dropbox', color: 'from-purple-500 to-purple-600' },
  { id: 4, name: 'Akamai', color: 'from-cyan-500 to-cyan-600' },
  { id: 5, name: 'Reddit', color: 'from-orange-500 to-orange-600' },
  { id: 6, name: 'Priceonomics', color: 'from-yellow-500 to-yellow-600' },
  { id: 7, name: 'Quora', color: 'from-red-500 to-red-600' },
  { id: 8, name: 'Warby Parker', color: 'from-indigo-500 to-indigo-600' },
  { id: 9, name: 'Typeform', color: 'from-pink-500 to-pink-600' },
  { id: 10, name: 'Booking.com', color: 'from-blue-400 to-blue-500' }
];

export default function PortfolioClient({ user }: { user: any }) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/portfolio', {
        credentials: 'include'
      });
      const data = await response.json();
      
      setBalance(data.balance);
      setInvestments(data.investments || []);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyColor = (pitchId: number) => {
    return SUCCESS_STORIES.find(s => s.id === pitchId)?.color || 'from-gray-500 to-gray-600';
  };

  const totalWealth = balance ? balance.available_tokens + balance.portfolio_value : 0;
  const gainLossPercentage = balance && balance.total_invested > 0 
    ? ((balance.all_time_gain_loss / balance.total_invested) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={user} showBack />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading portfolio...</p>
          </div>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6">My Portfolio</h1>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Total Wealth Card */}
                <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/30 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Total Wealth</h3>
                  <p className="text-4xl font-bold text-white mb-1">
                    {(totalWealth / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-gray-400">MTK</p>
                </div>

                {/* Available Balance Card */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Available to Invest</h3>
                  <p className="text-4xl font-bold text-white mb-1">
                    {balance ? (balance.available_tokens / 1000).toFixed(0) : '0'}K
                  </p>
                  <p className="text-sm text-gray-400">MTK</p>
                </div>

                {/* Portfolio Value Card */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Portfolio Value</h3>
                  <p className="text-4xl font-bold text-white mb-1">
                    {balance ? (balance.portfolio_value / 1000).toFixed(0) : '0'}K
                  </p>
                  <p className="text-sm text-gray-400">MTK</p>
                </div>
              </div>

              {/* Gain/Loss Summary */}
              {balance && balance.total_invested > 0 && (
                <div className="mt-6 bg-gray-800 border border-gray-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">All-Time Performance</h3>
                      <p className="text-gray-300">
                        Total Invested: <span className="font-semibold text-white">{(balance.total_invested / 1000).toFixed(0)}K MTK</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${balance.all_time_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {balance.all_time_gain_loss >= 0 ? '+' : ''}{(balance.all_time_gain_loss / 1000).toFixed(1)}K
                      </p>
                      <p className={`text-lg font-semibold ${balance.all_time_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(gainLossPercentage) >= 0 ? '+' : ''}{gainLossPercentage}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Holdings */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6">Current Holdings</h2>
              
              {investments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-6">You haven&apos;t made any investments yet</p>
                  <Link
                    href="/competitions?competition=legendary"
                    className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition"
                  >
                    Start Investing
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div
                      key={investment.pitch_id}
                      className="bg-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-pink-500/30 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getCompanyColor(investment.pitch_id)} flex items-center justify-center text-2xl font-bold`}>
                              {investment.company_name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{investment.company_name}</h3>
                              <p className="text-sm text-gray-400">
                                {investment.shares_owned.toFixed(2)} shares @ avg ${investment.avg_purchase_price.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 mb-1">Invested</p>
                              <p className="text-white font-semibold">{(investment.total_invested / 1000).toFixed(1)}K MTK</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Current Price</p>
                              <p className="text-white font-semibold">${investment.current_price.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Current Value</p>
                              <p className="text-white font-semibold">{(investment.current_value / 1000).toFixed(1)}K MTK</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Gain/Loss</p>
                              <p className={`font-bold ${investment.unrealized_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {investment.unrealized_gain_loss >= 0 ? '+' : ''}{(investment.unrealized_gain_loss / 1000).toFixed(1)}K
                                <span className="text-xs ml-1">
                                  ({investment.gain_loss_percentage >= 0 ? '+' : ''}{investment.gain_loss_percentage.toFixed(1)}%)
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/competitions?competition=legendary`}
                          className="ml-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Invest More
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex gap-4">
              <Link
                href="/competitions?competition=legendary"
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition"
              >
                View All Companies
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 RIZE by Manaboodle · Harvard Edition</p>
        </div>
      </footer>
    </div>
  );
}
