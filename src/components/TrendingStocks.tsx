'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface StockActivity {
  ticker: string;
  companyName: string;
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  netVolume: number;
  lastPrice: number;
  tradeCount: number;
}

export default function TrendingStocks() {
  const [trending, setTrending] = useState<StockActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingStocks();
    const interval = setInterval(fetchTrendingStocks, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchTrendingStocks = async () => {
    try {
      const response = await fetch(`/api/trending-stocks?t=${Date.now()}`);
      const data = await response.json();
      setTrending(data.trending || []);
    } catch (error) {
      console.error('Error fetching trending stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trending || trending.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center">
        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No trading activity yet today</p>
      </div>
    );
  }

  const maxVolume = Math.max(...trending.map(s => s.totalVolume));

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🔥 Trending Stocks</h2>
        <div className="text-sm text-gray-400">Last 7 days</div>
      </div>

      <div className="space-y-4">
        {trending.map((stock, index) => {
          const barWidth = (stock.totalVolume / maxVolume) * 100;
          const netDirection = stock.netVolume > 0 ? 'buy' : stock.netVolume < 0 ? 'sell' : 'neutral';
          
          return (
            <div key={stock.ticker} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-purple-400">#{index + 1}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white">{stock.ticker}</span>
                      {netDirection === 'buy' && <TrendingUp className="w-5 h-5 text-green-400" />}
                      {netDirection === 'sell' && <TrendingDown className="w-5 h-5 text-red-400" />}
                    </div>
                    <div className="text-sm text-gray-400">{stock.companyName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {stock.totalVolume.toLocaleString()} shares
                  </div>
                  <div className="text-sm text-gray-400">{stock.tradeCount} trades</div>
                </div>
              </div>

              {/* Visual bar chart */}
              <div className="relative h-8 bg-gray-800 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/30 to-green-400/30"
                  style={{ width: `${(stock.buyVolume / maxVolume) * 100}%` }}
                />
                <div 
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-500/30 to-red-400/30"
                  style={{ width: `${(stock.sellVolume / maxVolume) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-green-400">
                    {stock.buyVolume > 0 && `BUY ${stock.buyVolume.toLocaleString()}`}
                  </span>
                  <span className="text-xs font-semibold text-red-400">
                    {stock.sellVolume > 0 && `SELL ${stock.sellVolume.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/30 rounded"></div>
            <span className="text-gray-400">Buying Pressure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500/30 rounded"></div>
            <span className="text-gray-400">Selling Pressure</span>
          </div>
        </div>
        <div className="text-gray-500">Updates every minute</div>
      </div>
    </div>
  );
}
