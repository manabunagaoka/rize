'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  company_name: string;
  ticker: string;
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
  const [data, setData] = useState<PortfolioData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
  }, []);

  async function fetchPortfolio() {
    try {
      const response = await fetch('/api/portfolio', {
        credentials: 'include'
      });
      const portfolioData = await response.json();
      setData(portfolioData);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    try {
      const response = await fetch('/api/transactions', {
        credentials: 'include'
      });
      const result = await response.json();
      setTransactions(result.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
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
  const gainLossPercent = data.balance.total_invested > 0 
    ? ((totalGainLoss / data.balance.total_invested) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-4 gap-6">
          {/* Net Account Value (Total) */}
          <div>
            <div className="text-sm font-semibold uppercase opacity-75 mb-1">Net Account Value</div>
            <div className="text-3xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-xs opacity-75 mt-1">Cash + Holdings</div>
          </div>
          
          {/* Days Gain (placeholder - will need to track daily change) */}
          <div>
            <div className="text-sm font-semibold uppercase opacity-75 mb-1">Days Gain</div>
            <div className="text-3xl font-bold text-gray-300">
              $0
            </div>
            <div className="text-xs opacity-75 mt-1">Today's change</div>
          </div>
          
          {/* Total Gain (All-Time P&L) */}
          <div>
            <div className="text-sm font-semibold uppercase opacity-75 mb-1">Total Gain</div>
            <div className={`text-3xl font-bold flex items-center gap-2 ${totalGainLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {totalGainLoss >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {totalGainLoss >= 0 ? '+' : '-'}${Math.abs(totalGainLoss).toLocaleString()}
            </div>
            <div className="text-sm opacity-90 mt-1">
              {totalGainLoss >= 0 ? '+' : '-'}{Math.abs(parseFloat(gainLossPercent)).toFixed(2)}%
            </div>
          </div>

          {/* MTK Balance */}
          <div>
            <div className="text-sm font-semibold uppercase opacity-75 mb-1">MTK Balance</div>
            <div className="text-3xl font-bold">
              ${data.balance.available_tokens.toLocaleString()}
            </div>
            <div className="text-xs opacity-75 mt-1">Available to trade</div>
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
                        <h4 className="text-lg font-semibold text-white">{company?.name || `Company #${inv.pitch_id}`}</h4>
                        <span className="text-sm text-gray-400">{company?.ticker}</span>
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
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {tx.transaction_type}
                        </span>
                        <h4 className="text-base font-semibold text-white">{tx.company_name}</h4>
                        <span className="text-sm text-gray-400">{tx.ticker}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div>
                          <span className="opacity-75">Shares: </span>
                          <span className="text-white font-medium">{tx.shares.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="opacity-75">Price: </span>
                          <span className="text-white font-medium">${tx.price_per_share.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="opacity-75">{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${isBuy ? 'text-red-400' : 'text-green-400'}`}>
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
    </div>
  );
}
