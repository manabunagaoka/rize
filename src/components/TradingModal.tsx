'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
    id: number;
    name: string;
    ticker: string;
    currentPrice: number;
  };
  action: 'BUY' | 'SELL';
  balance: number;
  sharesOwned: number;
  onSuccess: () => void;
}

export default function TradingModal({ 
  isOpen, 
  onClose, 
  company, 
  action, 
  balance, 
  sharesOwned,
  onSuccess 
}: TradingModalProps) {
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShares(1);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCost = shares * company.currentPrice;
  const maxAffordable = Math.floor(balance / company.currentPrice);
  const maxSellable = sharesOwned;
  
  // Check if price data is loaded
  const priceLoading = company.currentPrice === 0;

  const handleSubmit = async () => {
    if (priceLoading) {
      setError('Waiting for price data...');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const endpoint = action === 'BUY' ? '/api/invest' : '/api/sell';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pitchId: company.id,
          shares: shares
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Transaction failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = action === 'BUY' 
    ? shares > 0 && shares <= maxAffordable
    : shares > 0 && shares <= maxSellable;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className={`p-6 border-b border-gray-700 ${action === 'BUY' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {action} {company.name}
              </h2>
              <p className="text-gray-400 text-sm">{company.ticker}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Price Loading Warning */}
          {priceLoading && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400">
              ⏳ Loading current price...
            </div>
          )}
          
          {/* Current Price */}
          <div className="bg-gray-900/50 rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-2xl font-bold text-white">
              {priceLoading ? '...' : `$${company.currentPrice.toFixed(2)}`}
            </div>
          </div>

          {/* Shares Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Number of Shares
            </label>
            <input
              type="number"
              min="1"
              max={action === 'BUY' ? maxAffordable : maxSellable}
              value={shares}
              onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-pink-500"
            />
            <div className="mt-2 text-sm text-gray-400">
              {action === 'BUY' 
                ? `Max affordable: ${maxAffordable} shares`
                : `You own: ${maxSellable} shares`
              }
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-gray-900/50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total {action === 'BUY' ? 'Cost' : 'Value'}:</span>
              <span className="text-2xl font-bold text-white">
                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Balance Info */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Your Balance:</span>
            <span className="text-white font-semibold">${balance.toLocaleString()}</span>
          </div>

          {action === 'BUY' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">After Purchase:</span>
              <span className={`font-semibold ${balance - totalCost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(balance - totalCost).toLocaleString()}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading || priceLoading}
              className={`flex-1 font-semibold py-3 rounded-lg transition ${
                action === 'BUY'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Processing...' : priceLoading ? 'Loading...' : `${action} ${shares} Shares`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
