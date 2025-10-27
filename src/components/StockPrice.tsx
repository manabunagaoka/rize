'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockPriceProps {
  ticker: string;
}

interface StockData {
  price: number;
  change: number;
  changePercent: number;
}

export default function StockPrice({ ticker }: StockPriceProps) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const response = await fetch(`/api/stock/${ticker}`);
        const apiData = await response.json();
        
        // Transform Finnhub response to our format
        setData({
          price: apiData.c,
          change: apiData.d,
          changePercent: apiData.dp
        });
      } catch (error) {
        console.error('Error fetching stock price:', error);
        // Keep loading state on error
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-gray-700 animate-pulse rounded" />
      </div>
    );
  }

  if (!data) return null;

  const isPositive = data.change >= 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-bold text-white">
        ${data.price.toFixed(2)}
      </span>
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span className="font-semibold text-xs">
          {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
