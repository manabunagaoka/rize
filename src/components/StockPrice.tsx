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
    // Using Alpha Vantage free API (requires API key)
    // Alternative: Finnhub.io, IEX Cloud, or Yahoo Finance API
    // For now, we'll use mock data to avoid API key requirements
    
    // TODO: Replace with real API call when you have an API key
    // Example: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=YOUR_KEY
    
    const mockData: { [key: string]: StockData } = {
      'META': { price: 497.43, change: 5.23, changePercent: 1.06 },
      'MSFT': { price: 415.89, change: -2.15, changePercent: -0.51 },
      'DBX': { price: 24.67, change: 0.43, changePercent: 1.77 }
    };

    // Simulate API delay
    setTimeout(() => {
      setData(mockData[ticker] || null);
      setLoading(false);
    }, 500);
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
