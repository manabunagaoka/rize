'use client';

import { X, Bot, User, TrendingUp, Award, BarChart3, DollarSign } from 'lucide-react';
import { useEffect } from 'react';

interface Holding {
  ticker: string;
  shares: number;
  currentPrice: number;
  value: number;
}

interface InvestorProfile {
  userId: string;
  email: string;
  username: string;
  isAI: boolean;
  aiEmoji?: string;
  aiStrategy?: string;
  aiCatchphrase?: string;
  aiStatus?: string;
  investorTier?: string;
  founderTier?: string;
  cash: number;
  holdingsValue: number;
  portfolioValue: number;
  rank: number;
  holdings: Holding[];
  // Human user profile fields
  userBio?: string;
  investmentStyle?: string;
  favoriteCategory?: string;
}

interface InvestorProfileModalProps {
  investor: InvestorProfile | null;
  onClose: () => void;
}

export default function InvestorProfileModal({ investor, onClose }: InvestorProfileModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!investor) return null;

  const getTierGradient = (tier: string) => {
    const gradients: Record<string, string> = {
      'TITAN': 'bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text',
      'ORACLE': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text',
      'ALCHEMIST': 'bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text',
      'UNICORN': 'bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text',
      'PHOENIX': 'bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text',
      'DRAGON': 'bg-gradient-to-r from-red-500 to-pink-500 text-transparent bg-clip-text',
    };
    return gradients[tier] || 'text-gray-400';
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'RETIRED': 'text-gray-500 opacity-70',
      'LEGENDARY': 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-transparent bg-clip-text',
      'PAUSED': 'text-gray-600',
    };
    return styles[status] || 'text-gray-400';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const percentage = ((value - 1000000) / 1000000) * 100;
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    const percentage = ((value - 1000000) / 1000000) * 100;
    if (percentage > 0) return 'text-green-400';
    if (percentage < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getStrategyDescription = (strategy?: string) => {
    const descriptions: Record<string, string> = {
      'CONSERVATIVE': 'Low-risk, steady growth. Prefers established companies with proven track records.',
      'DIVERSIFIED': 'Spreads investments across multiple startups to minimize risk.',
      'ALL_IN': 'High-risk, high-reward. Goes all-in on a few high-conviction picks.',
      'HOLD_FOREVER': 'Buy and hold forever. Never sells, believes in long-term compounding.',
      'TECH_ONLY': 'Only invests in technology companies. Software eats the world.',
      'SAAS_ONLY': 'Subscription business model enthusiast. Recurring revenue is king.',
      'MOMENTUM': 'Chases trending stocks. If it\'s moving up, jump on board!',
      'TREND_FOLLOW': 'Follows market trends and social sentiment.',
      'CONTRARIAN': 'Buys what others fear, sells what others love.',
      'PERFECT_TIMING': 'Tries to time the market perfectly. High precision, high stakes.',
    };
    return strategy ? descriptions[strategy] || 'Custom investment strategy' : '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-700">
          {/* Close Button - positioned to avoid rank number */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
              investor.isAI ? 'bg-purple-600/20 border-2 border-purple-500' : 'bg-green-600/20 border-2 border-green-500'
            }`}>
              {investor.isAI ? (
                investor.aiEmoji || '🤖'
              ) : (
                <User className="w-8 h-8 text-green-400" />
              )}
            </div>

            {/* Name & Type */}
            <div className="flex-1 pr-16">
              <div className="flex items-center gap-2 mb-1">
                {investor.isAI ? (
                  <Bot className="w-5 h-5 text-purple-400" />
                ) : (
                  <User className="w-5 h-5 text-green-400" />
                )}
                <h2 className="text-2xl font-bold text-white">{investor.username}</h2>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-gray-400 text-sm">
                  {investor.isAI ? 'AI Investor' : 'Student Investor'}
                </p>
                {(investor.investorTier || investor.founderTier) && (
                  <>
                    <span className="text-gray-600">•</span>
                    <div className="flex items-center gap-2">
                      {investor.investorTier && (
                        <span className={`text-xs font-bold tracking-wider ${getTierGradient(investor.investorTier)}`}>
                          {investor.investorTier}
                        </span>
                      )}
                      {investor.founderTier && (
                        <span className={`text-xs font-bold tracking-wider ${getTierGradient(investor.founderTier)}`}>
                          {investor.founderTier}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {investor.aiStatus && investor.aiStatus !== 'ACTIVE' && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className={`text-xs font-bold tracking-wider ${getStatusStyle(investor.aiStatus)}`}>
                      {investor.aiStatus}
                    </span>
                  </>
                )}
              </div>
              {investor.isAI && investor.aiCatchphrase && (
                <p className="text-purple-300 italic text-sm">&quot;{investor.aiCatchphrase}&quot;</p>
              )}
              {!investor.isAI && investor.userBio && (
                <p className="text-gray-300 text-sm">{investor.userBio}</p>
              )}
            </div>

            {/* Rank Badge */}
            <div className="text-right">
              <div className="text-4xl font-bold text-white">#{investor.rank}</div>
              <div className="text-sm text-gray-400">Rank</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-8 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(investor.portfolioValue)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Performance</p>
              <div className="flex items-center gap-1">
                <TrendingUp className={`w-5 h-5 ${getPerformanceColor(investor.portfolioValue)}`} />
                <p className={`text-2xl font-bold ${getPerformanceColor(investor.portfolioValue)}`}>
                  {formatPercentage(investor.portfolioValue)}
                </p>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Cash Available</p>
              <p className="text-xl font-bold text-white">{formatCurrency(investor.cash)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Holdings Value</p>
              <p className="text-xl font-bold text-white">{formatCurrency(investor.holdingsValue)}</p>
            </div>
          </div>
        </div>

        {/* Strategy Section */}
        {investor.isAI && investor.aiStrategy && (
          <div className="p-8 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Investment Strategy
            </h3>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-300 font-semibold mb-2">{investor.aiStrategy.replace(/_/g, ' ')}</p>
              <p className="text-gray-300 text-sm">{getStrategyDescription(investor.aiStrategy)}</p>
            </div>
          </div>
        )}

        {/* Human Investor Style */}
        {!investor.isAI && (investor.investmentStyle || investor.favoriteCategory) && (
          <div className="p-8 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Investment Profile
            </h3>
            <div className="space-y-3">
              {investor.investmentStyle && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Investment Style</p>
                  <p className="text-green-300 font-medium">{investor.investmentStyle}</p>
                </div>
              )}
              {investor.favoriteCategory && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">Favorite Category</p>
                  <p className="text-green-300 font-medium">{investor.favoriteCategory}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Holdings Section */}
        {investor.holdings && investor.holdings.length > 0 && (
          <div className="p-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              Current Holdings ({investor.holdings.length})
            </h3>
            <div className="space-y-2">
              {investor.holdings.map((holding) => (
                <div
                  key={holding.ticker}
                  className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-white">{holding.ticker}</p>
                    <p className="text-sm text-gray-400">{holding.shares.toFixed(2)} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatCurrency(holding.value)}</p>
                    <p className="text-sm text-gray-400">${holding.currentPrice.toFixed(2)}/share</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Holdings Message */}
        {(!investor.holdings || investor.holdings.length === 0) && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No holdings yet. All cash position.</p>
          </div>
        )}
      </div>
    </div>
  );
}
