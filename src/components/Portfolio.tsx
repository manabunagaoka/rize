'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface Investment {
  pitch_id: number;
  shares_owned: number;
  total_invested: number;
  avg_purchase_price: number;
  current_value: number;
  unrealized_gain_loss: number;
  current_price: number;
}

interface Transaction {
  id: string;
  pitch_id: number;
  transaction_type: 'BUY' | 'SELL';
  shares: number;
  price_per_share: number;
  total_amount: number;
  timestamp: string;
  ticker: string;
}

interface NewsPost {
  id: string;
  title: string;
  content: string;
  type: 'IPO' | 'ADMIN' | 'MARKET';
  created_at: string;
  published: boolean;
}

interface PortfolioData {
  balance: {
    total_tokens: number;
    available_tokens: number;
    portfolio_value: number;
    all_time_gain_loss: number;
    total_invested: number;
  };
  investments: Investment[];
}

// Company names mapping
const COMPANY_NAMES: { [key: number]: { name: string; ticker: string } } = {
  1: { name: 'Facebook', ticker: 'META' },
  2: { name: 'Microsoft', ticker: 'MSFT' },
  3: { name: 'Dropbox', ticker: 'DBX' },
  4: { name: 'Akamai', ticker: 'AKAM' },
  5: { name: 'Reddit', ticker: 'RDDT' },
  6: { name: 'Warby Parker', ticker: 'WRBY' },
  7: { name: 'Booking.com', ticker: 'BKNG' },
};

export default function Portfolio() {
  const pathname = usePathname();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
    fetchNews();
  }, []);

  // Refresh when pathname changes
  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
  }, [pathname]);

  // Refresh data when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPortfolio();
        fetchTransactions();
      }
    };
    
    const handleFocus = () => {
      fetchPortfolio();
      fetchTransactions();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  async function fetchPortfolio() {
    try {
      const response = await fetch(`/api/portfolio?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      const portfolioData = await response.json();
      console.log('[Portfolio/Manage] API Response:', {
        timestamp: portfolioData._timestamp,
        cash: portfolioData.balance?.available_tokens,
        holdings: portfolioData.balance?.portfolio_value,
        total: (portfolioData.balance?.available_tokens || 0) + (portfolioData.balance?.portfolio_value || 0),
        investments: portfolioData.investments?.length
      });
      setData(portfolioData);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchPortfolio();
    await fetchTransactions();
    setTimeout(() => setRefreshing(false), 500);
  }

  async function fetchTransactions() {
    try {
      const response = await fetch(`/api/transactions?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result = await response.json();
      console.log('[Portfolio] Transactions fetched:', result.transactions?.length || 0);
      setTransactions(result.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  }

  async function fetchNews() {
    try {
      const response = await fetch('/api/news', {
        credentials: 'include'
      });
      const result = await response.json();
      setNews(result.news || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-700 rounded-xl"></div>
        <div className="h-64 bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-400">
        Failed to load portfolio
      </div>
    );
  }

  const totalValue = data.balance.available_tokens + data.balance.portfolio_value;
  const totalGainLoss = data.balance.all_time_gain_loss;
  // Calculate percentage gain from starting balance (1M MTK) to match Compete page
  const gainLossPercent = ((totalValue - 1000000) / 1000000 * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Your Portfolio</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh portfolio"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-semibold">Refresh</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {/* Portfolio Value (Total) */}
          <div>
            <div className="text-sm font-semibold uppercase opacity-75 mb-1">Portfolio Value</div>
            <div className="text-3xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-xs opacity-75 mt-1">Cash + Holdings</div>
          </div>
          
          {/* Performance (% gain from starting $1M) */}
          <div>
            <div className="text-sm font-semibold uppercase opacity-75 mb-1">Performance</div>
            <div className={`text-3xl font-bold flex items-center gap-2 ${parseFloat(gainLossPercent) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {parseFloat(gainLossPercent) >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {parseFloat(gainLossPercent) >= 0 ? '+' : ''}{gainLossPercent}%
            </div>
            <div className="text-sm opacity-90 mt-1">vs starting balance</div>
          </div>
          
          {/* Cash */}
          <div>
            <div className="text-sm font-semibold uppercase opacity-75 mb-1">Cash</div>
            <div className="text-3xl font-bold">
              ${data.balance.available_tokens.toLocaleString()}
            </div>
            <div className="text-xs opacity-75 mt-1">Available to trade</div>
          </div>

          {/* Holdings */}
          <div>
            <div className="text-sm font-semibold uppercase opacity-75 mb-1">Holdings</div>
            <div className="text-3xl font-bold">
              ${data.balance.portfolio_value.toLocaleString()}
            </div>
            <div className="text-xs opacity-75 mt-1">Invested value</div>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Portfolio</h3>
        </div>

        {data.investments && data.investments.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {data.investments.map((inv) => {
              const company = COMPANY_NAMES[inv.pitch_id];
              const gainLoss = inv.unrealized_gain_loss;
              const gainLossPercent = inv.total_invested > 0 
                ? ((gainLoss / inv.total_invested) * 100).toFixed(2)
                : '0.00';
              const isPositive = gainLoss >= 0;

              return (
                <div key={inv.pitch_id} className="px-6 py-5 hover:bg-gray-700/30 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{company?.ticker || `PITCH${inv.pitch_id}`}</h4>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div>
                          <span className="opacity-75">Shares: </span>
                          <span className="text-white font-medium">{inv.shares_owned.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="opacity-75">Avg Price: </span>
                          <span className="text-white font-medium">${inv.avg_purchase_price.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="opacity-75">Current Price: </span>
                          <span className="text-white font-medium">${inv.current_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-1">
                        ${inv.current_value.toLocaleString()}
                      </div>
                      <div className={`flex items-center justify-end gap-1 text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isPositive ? '+' : ''}{gainLoss.toLocaleString()} MTK ({gainLossPercent}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="text-lg">No investments yet</p>
            <p className="text-sm mt-2">Start investing in the Magnificent 7 to build your portfolio!</p>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Transactions</h3>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {transactions.slice(0, 10).map((tx) => {
              const isBuy = tx.transaction_type === 'BUY';
              const date = new Date(tx.timestamp);
              
              return (
                <div key={tx.id} className="px-6 py-4 hover:bg-gray-700/30 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold ${isBuy ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {tx.transaction_type}
                        </span>
                        <h4 className="text-base font-semibold text-white">{tx.ticker}</h4>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div>
                          <span className="text-white font-medium">
                            {isBuy ? '+' : '-'}{tx.shares.toLocaleString()} shares
                          </span>
                          <span className="opacity-75"> at ${tx.price_per_share.toFixed(2)}</span>
                        </div>
                        <div className="opacity-75">
                          {date.toLocaleDateString()} {date.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {isBuy ? '-' : '+'}${tx.total_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm mt-2">Your trading history will appear here</p>
          </div>
        )}
      </div>

      {/* News */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">News</h3>
        </div>

        {news && news.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {news.map((post) => {
              const date = new Date(post.created_at);
              const typeBadgeColor = 
                post.type === 'IPO' ? 'bg-purple-500/20 text-purple-400' :
                post.type === 'MARKET' ? 'bg-blue-500/20 text-blue-400' :
                'bg-pink-500/20 text-pink-400';
              
              return (
                <div key={post.id} className="px-6 py-5 hover:bg-gray-700/30 transition">
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${typeBadgeColor}`}>
                      {post.type}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">{post.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{post.content}</p>
                      <p className="text-xs text-gray-500">
                        {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="text-lg">No news yet</p>
            <p className="text-sm mt-2">Market updates and IPO announcements will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
