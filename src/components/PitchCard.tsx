'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import StockPrice from '@/components/StockPrice';
import TradingModal from '@/components/TradingModal';

interface PitchCardProps {
  story: {
    id: number;
    name: string;
    founder: string;
    year: string;
    pitch: string;
    funFact: string;
    valuation: string;
    ticker: string | null;
    color: string;
  };
  isAuthenticated: boolean;
  rank: number;
  onTradeComplete?: () => void;
}

export default function PitchCard({ story, isAuthenticated, rank, onTradeComplete }: PitchCardProps) {
  const [sharesOwned, setSharesOwned] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Always fetch current market price first
    fetchMarketPrice();
    
    if (isAuthenticated) {
      fetchPortfolioData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, story.id]);

  const handleManualRefresh = async () => {
    if (!story.ticker || refreshing) return;
    setRefreshing(true);
    try {
      const response = await fetch(`/api/stock/${story.ticker}?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.c && data.c > 0) {
          setCurrentPrice(data.c);
          // Increment refresh key to force StockPrice component to re-fetch
          setRefreshKey(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const fetchMarketPrice = async () => {
    try {
      // If we have a ticker, fetch real-time price directly
      if (story.ticker) {
        const response = await fetch(`/api/stock/${story.ticker}`);
        
        if (!response.ok) {
          console.error('Stock price fetch failed:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log(`Stock price for ${story.ticker}:`, data);
        
        if (data.c && data.c > 0) {
          setCurrentPrice(data.c);
          console.log(`Set current price for ${story.name}: $${data.c}`);
        } else {
          console.warn(`No valid price for ${story.ticker}`);
        }
      } else {
        // No ticker, set a default price (for non-public companies)
        setCurrentPrice(100);
      }
    } catch (error) {
      console.error('Failed to fetch market price:', error);
    }
  };

  const fetchPortfolioData = async () => {
    try {
      // Add timestamp to bypass cache
      const response = await fetch(`/api/portfolio?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        console.warn('Portfolio API returned error:', response.status);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      // Find investment for this company
      const investment = data.investments?.find((inv: any) => inv.pitch_id === story.id);
      setSharesOwned(investment?.shares_owned || 0);
      // Don't override currentPrice here - it's fetched from market data
      setBalance(data.balance?.available_tokens || 0);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect_to=/hm7';
      return;
    }
    setTradeAction('BUY');
    setShowModal(true);
  };

  const handleSell = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect_to=/hm7';
      return;
    }
    setTradeAction('SELL');
    setShowModal(true);
  };

  const handleTradeSuccess = async () => {
    // Immediately fetch updated portfolio data with cache bypass
    await fetchPortfolioData();
    
    // Refresh the price too
    await fetchMarketPrice();
    
    if (onTradeComplete) {
      onTradeComplete();
    }
    
    // Don't do full page reload - we already updated the data above
  };

  return (
    <>
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-pink-500 transition-all duration-300 relative">
        {/* Header with Ticker/Name and Valuation */}
        <div className="flex justify-between items-start mb-4">
          <div>
            {story.ticker && (
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold mb-1">{story.ticker}</h2>
                <button
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="p-1.5 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                  title="Refresh price"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
            <h3 className="text-base text-gray-300 mb-2">{story.name}</h3>
            <p className="text-gray-400 text-sm">{story.founder} • {story.year}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-pink-500">{story.valuation}</p>
            {story.ticker && <StockPrice key={refreshKey} ticker={story.ticker} />}
          </div>
        </div>
        
        {/* Elevator Pitch */}
        <div className="mb-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400 mb-2 font-semibold">ORIGINAL PITCH</p>
          <p className="text-white leading-relaxed">&ldquo;{story.pitch}&rdquo;</p>
        </div>
        
        {/* Fun Fact */}
        <div className="mb-4">
          <p className="text-gray-300 text-sm leading-relaxed">{story.funFact}</p>
        </div>
        
        {/* Portfolio Info */}
        {isAuthenticated && !loading && sharesOwned > 0 && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-400 text-sm font-semibold">Your Position:</span>
              <span className="text-white font-bold">{sharesOwned} shares</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-blue-400 text-sm">Value:</span>
              <span className="text-white font-semibold">
                ${(sharesOwned * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
        
        {/* Trading Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleBuy}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all bg-green-500 hover:bg-green-600 text-white ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Loading...' : !isAuthenticated ? 'Login to Buy' : 'BUY'}
          </button>
          
          <button 
            onClick={handleSell}
            disabled={loading || (!isAuthenticated || sharesOwned === 0)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              isAuthenticated && sharesOwned > 0
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Loading...' : !isAuthenticated ? 'Login to Sell' : 'SELL'}
          </button>
        </div>
      </div>

      {/* Trading Modal */}
      {isAuthenticated && (
        <TradingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          company={{
            id: story.id,
            name: story.name,
            ticker: story.ticker || '',
            currentPrice: currentPrice
          }}
          action={tradeAction}
          balance={balance}
          sharesOwned={sharesOwned}
          onSuccess={handleTradeSuccess}
        />
      )}
    </>
  );
}
