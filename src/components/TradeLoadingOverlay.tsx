'use client';

import { useEffect, useState } from 'react';

interface TradeLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function TradeLoadingOverlay({ isVisible, message = 'Processing trade...' }: TradeLoadingOverlayProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 border-2 border-purple-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          {/* Spinning loader */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
          </div>

          {/* Message */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              {message}{dots}
            </h3>
            <p className="text-gray-400 text-sm">
              Updating your portfolio. This may take a few seconds.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
