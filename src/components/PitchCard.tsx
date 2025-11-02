'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolioData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch('/api/portfolio', {
        credentials: 'include'
      });
      const data = await response.json();
      
      // Find investment for this company
      const investment = data.investments?.find((inv: any) => inv.pitch_id === story.id);
      setSharesOwned(investment?.shares_owned || 0);
      setCurrentPrice(investment?.current_price || 0);
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

  const handleTradeSuccess = () => {
    fetchPortfolioData();
    if (onTradeComplete) {
      onTradeComplete();
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-pink-500 transition-all duration-300 relative">
        {/* Ranking Badge */}
        <div className={`absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
          rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
          rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
          rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900' :
          'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200'
        }`}>
          #{rank}
        </div>
        
        {/* Header with Name and Valuation */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">{story.name}</h3>
            <p className="text-gray-400 text-sm">{story.founder} • {story.year}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-pink-500">{story.valuation}</p>
            {story.ticker && <StockPrice ticker={story.ticker} />}
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
            {loading ? 'Loading...' : 'BUY'}
          </button>
          
          <button 
            onClick={handleSell}
            disabled={loading || sharesOwned === 0}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              sharesOwned > 0
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Loading...' : 'SELL'}
          </button>
        </div>
      </div>

      {/* Trading Modal */}
      {isAuthenticated && currentPrice > 0 && (
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
