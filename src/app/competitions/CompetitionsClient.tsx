'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Leaderboard from '@/components/Leaderboard';
import StockPrice from '@/components/StockPrice';
import Header from '@/components/Header';

const SUCCESS_STORIES = [
  { id: 1, name: 'Facebook', founder: 'Mark Zuckerberg', year: '2004', valuation: '$1.2T', marketCap: 1200000000000, ticker: 'META',
    pitch: 'An online directory that connects people through social networks at colleges.',
    funFact: 'Started as "TheFacebook" - exclusive to Harvard students with a .edu email. Expanded to other Ivy League schools within months.',
    color: 'from-blue-500 to-blue-600' },
  { id: 2, name: 'Microsoft', founder: 'Bill Gates & Paul Allen', year: '1975', valuation: '$3.1T', marketCap: 3100000000000, ticker: 'MSFT',
    pitch: 'A computer on every desk and in every home, running our software.',
    funFact: 'Gates wrote a BASIC interpreter for the Altair 8800 in his dorm room. Sold it before even testing on real hardware - it worked.',
    color: 'from-green-500 to-green-600' },
  { id: 3, name: 'Dropbox', founder: 'Drew Houston', year: '2007', valuation: '$10B', marketCap: 10000000000, ticker: 'DBX',
    pitch: 'Your files, anywhere. One folder that syncs across all your devices.',
    funFact: 'Drew forgot his USB drive on a bus trip and coded the first prototype during the 4-hour ride. Launched at Y Combinator.',
    color: 'from-purple-500 to-purple-600' },
  { id: 4, name: 'Akamai', founder: 'Tom Leighton & Danny Lewin', year: '1998', valuation: '$15B', marketCap: 15000000000, ticker: 'AKAM',
    pitch: 'Make the internet faster by serving content from servers closer to users.',
    funFact: 'Started as an MIT/Harvard math project. Now delivers 30% of all web traffic globally including Netflix and Spotify.',
    color: 'from-cyan-500 to-cyan-600' },
  { id: 5, name: 'Reddit', founder: 'Steve Huffman & Alexis Ohanian', year: '2005', valuation: '$10B', marketCap: 10000000000, ticker: 'RDDT',
    pitch: 'The front page of the internet - where communities create and share content.',
    funFact: 'Pitched as "Memepool meets Delicious" at Y Combinator. Built in 3 weeks using Python. Now 500M+ monthly users.',
    color: 'from-orange-500 to-orange-600' },
  { id: 6, name: 'Warby Parker', founder: 'Neil Blumenthal & team', year: '2010', valuation: '$3B', marketCap: 3000000000, ticker: 'WRBY',
    pitch: 'Designer eyewear at a revolutionary price, while leading the way for socially conscious businesses.',
    funFact: 'Started because founder lost his glasses and was shocked by the $500 price. Buy a pair, give a pair model. Now valued at $3B.',
    color: 'from-indigo-500 to-indigo-600' },
  { id: 7, name: 'Booking.com', founder: 'Geert-Jan Bruinsma', year: '1996', valuation: '$100B', marketCap: 100000000000, ticker: 'BKNG',
    pitch: 'Book accommodations anywhere in the world with instant confirmation.',
    funFact: 'Started in Amsterdam, but expanded with Harvard MBA insights. Now books 1.5M room nights per day globally.',
    color: 'from-blue-400 to-blue-500' }
];

export default function CompetitionsClient({ user }: { user: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCompetitionId, setActiveCompetitionId] = useState('legendary');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState<any>(null);
  const [userHoldings, setUserHoldings] = useState<any[]>([]);
  const [shareCount, setShareCount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [isInvesting, setIsInvesting] = useState(false);
  const [realStockPrice, setRealStockPrice] = useState<number | null>(null);

  useEffect(() => {
    const comp = searchParams.get('competition') || 'legendary';
    setActiveCompetitionId(comp);
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeCompetitionId === 'legendary') {
        // First, sync real stock prices into database
        try {
          await fetch('/api/sync-prices', {
            method: 'POST',
            credentials: 'include'
          });
          console.log('✅ Stock prices synced');
        } catch (error) {
          console.error('⚠️ Price sync failed:', error);
        }
        
        // Fetch competitions data (leaderboard + company rankings)
        const compResponse = await fetch('/api/competitions', {
          credentials: 'include'
        });
        const compData = await compResponse.json();
        
        console.log('[CompetitionsClient] API Response:', compData);
        
        // Fetch user portfolio if logged in
        if (user) {
          const portfolioResponse = await fetch('/api/portfolio', {
            credentials: 'include'
          });
          const portfolioData = await portfolioResponse.json();
          setUserBalance(portfolioData.balance);
          setUserHoldings(portfolioData.investments || []);
        }
        
        // Map companies with their market data
        const companiesWithData = SUCCESS_STORIES.map(story => {
          const ranking = compData.companies?.find((c: any) => c.pitch_id === story.id);
          console.log(`[CompetitionsClient] ${story.name}:`, ranking);
          return {
            ...story,
            currentPrice: ranking?.current_price || 100,
            totalVolume: ranking?.total_volume || 0,
            uniqueInvestors: ranking?.unique_investors || 0,
            marketRank: ranking?.market_rank || story.id
          };
        });
        
        // Sort companies by real market cap (highest first)
        const sortedCompanies = companiesWithData.sort((a, b) => b.marketCap - a.marketCap);
        
        setCompaniesData(sortedCompanies);
        setLeaderboardData(compData.leaderboard || []);
        
        if (!selectedEntryId && sortedCompanies.length > 0) {
          setSelectedEntryId(sortedCompanies[0].id);
        }
      } else {
        // For Class of 2026, show empty state
        setLeaderboardData([]);
        setCompaniesData([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCompetitionId, selectedEntryId, user]);

  useEffect(() => {
    fetchData();
  }, [activeCompetitionId, fetchData]);

  // Fetch real stock price when a company is selected
  useEffect(() => {
    async function fetchRealPrice() {
      const selectedPitch = companiesData.find(c => c.id === selectedEntryId);
      if (!selectedPitch || !selectedPitch.ticker) {
        setRealStockPrice(null);
        return;
      }

      try {
        const response = await fetch(`/api/stock/${selectedPitch.ticker}`);
        const data = await response.json();
        if (data.c && data.c > 0) {
          setRealStockPrice(data.c);
        } else {
          setRealStockPrice(null);
        }
      } catch (error) {
        console.error('Failed to fetch real stock price:', error);
        setRealStockPrice(null);
      }
    }

    fetchRealPrice();
  }, [selectedEntryId, companiesData]);

  const handleSelectEntry = (id: number) => {
    setSelectedEntryId(id);
  };

  const handleInvest = async (pitchId: number) => {
    if (!user) {
      return;
    }

    const shares = parseInt(shareCount);
    if (!shares || shares <= 0 || !realStockPrice) {
      return;
    }

    // Calculate total cost using real stock price
    const totalCost = Math.floor(shares * realStockPrice);

    if (transactionType === 'BUY') {
      if (userBalance && totalCost > userBalance.available_tokens) {
        return;
      }
    }

    setIsInvesting(true);
    try {
      const apiEndpoint = transactionType === 'BUY' ? '/api/invest' : '/api/sell';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId, shares }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShareCount('');
        // Refresh data to show updated rankings and balance
        await fetchData();
      }
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsInvesting(false);
    }
  };

  const selectedPitch = companiesData.find(c => c.id === selectedEntryId) || SUCCESS_STORIES.find(s => s.id === selectedEntryId);

  const competitionTitle = activeCompetitionId === 'legendary' 
    ? 'Harvard Legends' 
    : 'Harvard Class of 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header (shared) */}
      <Header user={user} showBack />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading competition...</p>
          </div>
        ) : activeCompetitionId !== 'legendary' ? (
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-4xl font-bold text-white mb-4">Coming Soon</h3>
              <p className="text-xl text-gray-300 mb-8">
                The Harvard Class of 2026 competition will open soon. Submit your startup and compete for investor introductions!
              </p>
              <Link 
                href="/submit"
                className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-xl transition"
              >
                Submit Your Startup
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Rules Box */}
                        {/* Rules Box */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-white mb-3">Harvard Legends Index</h3>
              <p className="text-gray-300 leading-relaxed">
                Harvard Legends Index tracks companies that started at Harvard. 
                Invest in these companies based on their original pitch and fun facts to see how your portfolio grows. 
                Compete against other fellows and AI Investors. We&apos;ve gifted you <span className="text-pink-400 font-bold">$1,000,000 Manaboodle Tokens (MTK)</span> to get started. 
                Have fun, and remember to <a href="https://www.manaboodle.com/signup" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 underline">register YOUR startup</a> for the Manaboodle IPO!
              </p>
            </div>

            {/* Portfolio (if logged in) */}
            {user && userBalance && (
              <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Your Portfolio</h3>
                  <Link 
                    href="/dashboard"
                    className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 px-4 py-2 rounded-lg font-semibold transition border border-pink-500/50 text-sm"
                  >
                    📊 Full Dashboard
                  </Link>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-1">Cash Balance</h3>
                    <p className="text-3xl font-bold text-white">
                      ${userBalance.available_tokens.toLocaleString()} <span className="text-xl text-gray-400">MTK</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Portfolio Value</p>
                    <p className="text-2xl font-bold text-pink-400">
                      ${userBalance.portfolio_value.toLocaleString()}
                    </p>
                    <p className={`text-sm font-semibold ${userBalance.all_time_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {userBalance.all_time_gain_loss >= 0 ? '+' : ''}${Math.abs(userBalance.all_time_gain_loss).toLocaleString()}
                      ({userBalance.total_invested > 0 ? ((userBalance.all_time_gain_loss / userBalance.total_invested) * 100).toFixed(1) : '0.0'}%)
                    </p>
                  </div>
                </div>

                {/* Holdings List */}
                {userHoldings.length > 0 && (
                  <div className="border-t border-pink-500/30 pt-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Your Holdings</h4>
                    <div className="space-y-2">
                      {userHoldings.map((holding) => {
                        const companyNames: { [key: number]: string } = {
                          1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM', 5: 'RDDT', 6: 'WRBY', 7: 'BKNG'
                        };
                        const ticker = companyNames[holding.pitch_id] || `#${holding.pitch_id}`;
                        const gainLoss = holding.unrealized_gain_loss || 0;
                        const isPositive = gainLoss >= 0;
                        
                        return (
                          <div key={holding.pitch_id} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-semibold">{ticker}</span>
                              <span className="text-gray-400 text-sm">{holding.shares_owned.toLocaleString()} shares</span>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">${holding.current_value.toLocaleString()}</div>
                              <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}{gainLoss.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Leaderboard */}
            <div>
              <Leaderboard
                competitionId={activeCompetitionId}
                entries={companiesData.map(c => ({
                  id: c.id,
                  name: c.name,
                  ticker: c.ticker,
                  voteCount: c.marketCap,  // Pass real market cap, not MTK volume
                  currentPrice: c.currentPrice
                }))}
                onSelectEntry={handleSelectEntry}
                selectedEntryId={selectedEntryId ?? undefined}
              />
            </div>

            {/* Right: Pitch Detail */}
            <div>
              {selectedPitch ? (
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 sticky top-24">
                  {/* 1. Company Name */}
                  <h3 className="text-3xl font-bold text-white mb-3">{selectedPitch.name}</h3>
                  
                  {/* 2. Founders Names and Year */}
                  <p className="text-gray-300 text-lg mb-4">{selectedPitch.founder} · {selectedPitch.year}</p>
                  
                  {/* 3. Market Value */}
                  <p className="text-2xl font-bold text-pink-400 mb-4">{selectedPitch.valuation}</p>
                  
                  {/* 4. Ticker Symbol with Live Price */}
                  {selectedPitch.ticker && (
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-lg text-gray-400 font-semibold">{selectedPitch.ticker}</span>
                      <StockPrice ticker={selectedPitch.ticker} />
                    </div>
                  )}
                  
                  <div className="border-t border-gray-700 pt-6 space-y-6">
                    {/* 5. The Pitch */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">The Pitch</h4>
                      <p className="text-white text-lg">{selectedPitch.pitch}</p>
                    </div>

                    {/* 6. Fun Fact */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Fun Fact</h4>
                      <p className="text-gray-300">{selectedPitch.funFact}</p>
                    </div>

                    {/* 7-10. Investment Interface */}
                    {user ? (
                      <div className="space-y-4 pt-4 border-t border-gray-700">
                        {/* 7. BUY / SELL Toggle */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setTransactionType('BUY');
                              setShareCount('');
                            }}
                            className={`py-3 px-4 rounded-lg font-semibold transition ${
                              transactionType === 'BUY'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            BUY
                          </button>
                          <button
                            onClick={() => {
                              setTransactionType('SELL');
                              setShareCount('');
                            }}
                            className={`py-3 px-4 rounded-lg font-semibold transition ${
                              transactionType === 'SELL'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            SELL
                          </button>
                        </div>

                        {/* 10. Number of Shares - Manual Entry Only */}
                        <div>
                          <label className="text-sm font-semibold text-gray-400 uppercase mb-2 block">
                            Number of Shares
                          </label>
                          <input
                            type="number"
                            value={shareCount}
                            onChange={(e) => setShareCount(e.target.value)}
                            placeholder="Enter number of shares..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-pink-500"
                            min="0"
                            step="1"
                          />
                        </div>
                        
                        {/* 11. Preview of Order */}
                        {shareCount && parseInt(shareCount) > 0 && realStockPrice && (
                          <div className="p-4 bg-gray-900/70 rounded-lg border-2 border-pink-500/50">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Order Preview</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Shares:</span>
                                <span className="text-white font-semibold">{parseInt(shareCount).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Price per Share:</span>
                                <span className="text-white font-semibold">${realStockPrice.toFixed(2)}</span>
                              </div>
                              <div className="border-t border-gray-700 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-300 font-semibold">Total:</span>
                                  <span className={`text-xl font-bold ${transactionType === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                    ${Math.floor(parseInt(shareCount) * realStockPrice).toLocaleString()} MTK
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 12. Order Button */}
                        <button 
                          onClick={() => handleInvest(selectedPitch.id)}
                          disabled={isInvesting || !shareCount || parseInt(shareCount) <= 0}
                          className={`w-full font-bold py-4 px-6 rounded-xl transition text-lg ${
                            isInvesting || !shareCount || parseInt(shareCount) <= 0
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : transactionType === 'BUY'
                              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
                              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                          }`}
                        >
                          {isInvesting ? 'Processing...' : `${transactionType} Order`}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 text-center">
                        <p className="text-gray-400 mb-4">Sign in to start investing</p>
                        <Link
                          href={`/login?redirect_to=${encodeURIComponent('/competitions?competition=legendary')}`}
                          className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
                  <p className="text-gray-400">Select a pitch from the leaderboard to view details</p>
                </div>
              )}
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
