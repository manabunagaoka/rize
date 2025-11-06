'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Trade {
  id: number;
  type: 'BUY' | 'SELL';
  investorName: string;
  isAI: boolean;
  ticker: string;
  companyName: string;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  timestamp: string;
}

interface ActivityData {
  recentActivity: Trade[];
  topInvestors: Array<{
    name: string;
    isAI: boolean;
    portfolioValue: number;
    cash: number;
  }>;
  timestamp: string;
}

export default function ActivityTimeline() {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
    // Refresh every 5 minutes
    const interval = setInterval(fetchActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch('/api/trading-activity');
      if (response.ok) {
        const data = await response.json();
        setActivity(data);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
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

  const formatShares = (shares: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(shares);
  };

  const getTimeAgo = (timestamp: string) => {
    // Since we don't have real timestamps yet, return "Recently"
    return 'Recently';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Recent Trading Activity</h2>
        </div>
        <div className="text-gray-400 text-center py-8">Loading activity...</div>
      </div>
    );
  }

  if (!activity || activity.recentActivity.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Recent Trading Activity</h2>
        </div>
        <div className="text-gray-400 text-center py-8">No recent trades</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Recent Trading Activity</h2>
        </div>
        <div className="text-sm text-gray-400">
          Updates every 5 minutes
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activity.recentActivity.map((trade) => (
          <div
            key={trade.id}
            className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Trade Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold ${trade.isAI ? 'text-purple-400' : 'text-blue-400'}`}>
                    {trade.investorName}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{getTimeAgo(trade.timestamp)}</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {trade.type === 'BUY' ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">BOUGHT</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400">
                      <TrendingDown className="w-4 h-4" />
                      <span className="font-medium">SOLD</span>
                    </div>
                  )}
                  
                  <span className="text-white font-medium">
                    {formatShares(trade.shares)} shares
                  </span>
                  
                  <span className="text-gray-400">of</span>
                  
                  <span className="text-blue-400 font-bold">
                    ${trade.ticker}
                  </span>
                  
                  <span className="text-gray-400 text-sm">
                    ({trade.companyName})
                  </span>
                </div>

                <div className="text-sm text-gray-400 mt-1">
                  @ {formatCurrency(trade.pricePerShare)} per share
                  <span className="mx-2">•</span>
                  Total: <span className="text-white font-medium">{formatCurrency(trade.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-center">
        <button
          onClick={fetchActivity}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          Refresh Activity
        </button>
      </div>
    </div>
  );
}
