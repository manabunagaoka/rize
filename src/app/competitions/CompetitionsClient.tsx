'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Leaderboard from '@/components/Leaderboard';
import StockPrice from '@/components/StockPrice';
import Header from '@/components/Header';

const SUCCESS_STORIES = [
  { id: 1, name: 'Facebook', founder: 'Mark Zuckerberg', year: '2004', valuation: '$1.2T', ticker: 'META',
    pitch: 'An online directory that connects people through social networks at colleges.',
    funFact: 'Started as "TheFacebook" - exclusive to Harvard students with a .edu email. Expanded to other Ivy League schools within months.',
    color: 'from-blue-500 to-blue-600' },
  { id: 2, name: 'Microsoft', founder: 'Bill Gates & Paul Allen', year: '1975', valuation: '$3.1T', ticker: 'MSFT',
    pitch: 'A computer on every desk and in every home, running our software.',
    funFact: 'Gates wrote a BASIC interpreter for the Altair 8800 in his dorm room. Sold it before even testing on real hardware - it worked.',
    color: 'from-green-500 to-green-600' },
  { id: 3, name: 'Dropbox', founder: 'Drew Houston', year: '2007', valuation: '$10B', ticker: 'DBX',
    pitch: 'Your files, anywhere. One folder that syncs across all your devices.',
    funFact: 'Drew forgot his USB drive on a bus trip and coded the first prototype during the 4-hour ride. Launched at Y Combinator.',
    color: 'from-purple-500 to-purple-600' },
  { id: 4, name: 'Akamai', founder: 'Tom Leighton & Danny Lewin', year: '1998', valuation: '$15B', ticker: 'AKAM',
    pitch: 'Make the internet faster by serving content from servers closer to users.',
    funFact: 'Started as an MIT/Harvard math project. Now delivers 30% of all web traffic globally including Netflix and Spotify.',
    color: 'from-cyan-500 to-cyan-600' },
  { id: 5, name: 'Reddit', founder: 'Steve Huffman & Alexis Ohanian', year: '2005', valuation: '$10B', ticker: 'RDDT',
    pitch: 'The front page of the internet - where communities create and share content.',
    funFact: 'Pitched as "Memepool meets Delicious" at Y Combinator. Built in 3 weeks using Python. Now 500M+ monthly users.',
    color: 'from-orange-500 to-orange-600' },
  { id: 6, name: 'Priceonomics', founder: 'Rohin Dhar', year: '2010', valuation: 'Acquired', ticker: null,
    pitch: 'Data-driven storytelling that helps you make better buying decisions.',
    funFact: 'Started by scraping Craigslist to find fair prices. Pivoted to become a content marketing agency acquired by Content Harmony.',
    color: 'from-yellow-500 to-yellow-600' },
  { id: 7, name: 'Quora', founder: 'Adam D\'Angelo & Charlie Cheever', year: '2009', valuation: '$2B', ticker: null,
    pitch: 'A place to share knowledge and better understand the world.',
    funFact: 'Adam was Facebook\'s first CTO. Built Quora to create higher quality Q&A than Yahoo Answers. 400M+ monthly users.',
    color: 'from-red-500 to-red-600' },
  { id: 8, name: 'Warby Parker', founder: 'Neil Blumenthal & team', year: '2010', valuation: '$3B', ticker: 'WRBY',
    pitch: 'Designer eyewear at a revolutionary price, while leading the way for socially conscious businesses.',
    funFact: 'Started because founder lost his glasses and was shocked by the $500 price. Buy a pair, give a pair model. Now valued at $3B.',
    color: 'from-indigo-500 to-indigo-600' },
  { id: 9, name: 'Typeform', founder: 'Robert Muñoz', year: '2012', valuation: '$935M', ticker: null,
    pitch: 'Forms and surveys that people actually want to fill out.',
    funFact: 'Built because founders hated boring online forms. Made them conversational and beautiful. 150M+ responses collected yearly.',
    color: 'from-pink-500 to-pink-600' },
  { id: 10, name: 'Booking.com', founder: 'Geert-Jan Bruinsma', year: '1996', valuation: '$100B', ticker: 'BKNG',
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
  const [shareCount, setShareCount] = useState<string>('');
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    const comp = searchParams.get('competition') || 'legendary';
    setActiveCompetitionId(comp);
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeCompetitionId === 'legendary') {
        // Fetch competitions data (leaderboard + company rankings)
        const compResponse = await fetch('/api/competitions', {
          credentials: 'include'
        });
        const compData = await compResponse.json();
        
        // Fetch user portfolio if logged in
        if (user) {
          const portfolioResponse = await fetch('/api/portfolio', {
            credentials: 'include'
          });
          const portfolioData = await portfolioResponse.json();
          setUserBalance(portfolioData.balance);
        }
        
        // Map companies with their market data
        const companiesWithData = SUCCESS_STORIES.map(story => {
          const ranking = compData.companies?.find((c: any) => c.pitch_id === story.id);
          return {
            ...story,
            currentPrice: ranking?.current_price || 100,
            totalVolume: ranking?.total_volume || 0,
            uniqueInvestors: ranking?.unique_investors || 0,
            marketRank: ranking?.market_rank || story.id
          };
        });
        
        setCompaniesData(companiesWithData);
        setLeaderboardData(compData.leaderboard || []);
        
        if (!selectedEntryId && companiesWithData.length > 0) {
          const sorted = [...companiesWithData].sort((a, b) => b.totalVolume - a.totalVolume);
          setSelectedEntryId(sorted[0].id);
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

  const handleSelectEntry = (id: number) => {
    setSelectedEntryId(id);
  };

  const handleInvest = async (pitchId: number) => {
    if (!user) {
      alert('Please sign in to invest');
      return;
    }

    const shares = parseInt(shareCount);
    if (!shares || shares <= 0) {
      alert('Please enter a valid number of shares');
      return;
    }

    // Calculate total cost
    const selectedCompany = companiesData.find(c => c.id === pitchId);
    const pricePerShare = selectedCompany?.currentPrice || 100;
    const totalCost = shares * pricePerShare;

    if (userBalance && totalCost > userBalance.available_tokens) {
      alert(`Insufficient MTK balance. You need $${totalCost.toLocaleString()} MTK but only have $${userBalance.available_tokens.toLocaleString()} MTK available.`);
      return;
    }

    setIsInvesting(true);
    try {
      const response = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId, shares }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Success! Purchased ${shares.toLocaleString()} shares at $${pricePerShare.toFixed(2)}/share for a total of $${totalCost.toLocaleString()} MTK`);
        setShareCount('');
        // Refresh data to show updated rankings and balance
        await fetchData();
      } else {
        alert(data.error || 'Failed to process investment');
      }
    } catch (error) {
      console.error('Investment failed:', error);
      alert('Failed to process investment. Please try again.');
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

            {/* MTK Balance Bar (if logged in) */}
            {user && userBalance && (
              <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-1">Your MTK Balance</h3>
                    <p className="text-4xl font-bold text-white">
                      ${userBalance.available_tokens.toLocaleString()} <span className="text-2xl text-gray-400">MTK</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Portfolio Value</p>
                    <p className="text-2xl font-bold text-pink-400">
                      ${userBalance.portfolio_value.toLocaleString()} MTK
                    </p>
                    <p className={`text-sm font-semibold ${userBalance.all_time_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {userBalance.all_time_gain_loss >= 0 ? '+' : ''}${Math.abs(userBalance.all_time_gain_loss).toLocaleString()}
                      ({userBalance.total_invested > 0 ? ((userBalance.all_time_gain_loss / userBalance.total_invested) * 100).toFixed(1) : '0.0'}%)
                    </p>
                  </div>
                </div>
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
                  voteCount: c.totalVolume
                }))}
                onSelectEntry={handleSelectEntry}
                selectedEntryId={selectedEntryId ?? undefined}
              />
            </div>

            {/* Right: Pitch Detail */}
            <div>
              {selectedPitch ? (
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 sticky top-24">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-white mb-2">{selectedPitch.name}</h3>
                    <p className="text-gray-400">{selectedPitch.founder} · {selectedPitch.year}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-2xl font-bold text-pink-400">{selectedPitch.valuation}</p>
                      {selectedPitch.ticker && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{selectedPitch.ticker}</span>
                          <StockPrice ticker={selectedPitch.ticker} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">The Pitch</h4>
                      <p className="text-white text-lg">{selectedPitch.pitch}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Fun Fact</h4>
                      <p className="text-gray-300">{selectedPitch.funFact}</p>
                    </div>

                    {/* Market Data */}
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase mb-1">Price Per Share</p>
                          <p className="text-2xl font-bold text-pink-400">
                            ${selectedPitch.currentPrice?.toFixed(2) || '100.00'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase mb-1">Total Invested</p>
                          <p className="text-2xl font-bold text-white">
                            ${(selectedPitch.totalVolume || 0).toLocaleString()} MTK
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400">
                          {selectedPitch.uniqueInvestors || 0} investor{(selectedPitch.uniqueInvestors || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Investment Interface */}
                    {user ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold text-gray-400 uppercase mb-2 block">
                            Number of Shares
                          </label>
                          <input
                            type="number"
                            value={shareCount}
                            onChange={(e) => setShareCount(e.target.value)}
                            placeholder="Enter number of shares..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                            min="0"
                            step="1"
                          />
                          {shareCount && selectedPitch.currentPrice && (
                            <p className="mt-2 text-sm text-gray-400">
                              Total Cost: <span className="text-pink-400 font-semibold">${(parseInt(shareCount) * selectedPitch.currentPrice).toLocaleString()} MTK</span>
                            </p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setShareCount('100')}
                            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition"
                          >
                            100 shares
                          </button>
                          <button
                            onClick={() => setShareCount('500')}
                            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition"
                          >
                            500 shares
                          </button>
                          <button
                            onClick={() => setShareCount('1000')}
                            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition"
                          >
                            1000 shares
                          </button>
                        </div>

                        <button 
                          onClick={() => handleInvest(selectedPitch.id)}
                          disabled={isInvesting || !shareCount}
                          className={`w-full font-semibold py-4 px-6 rounded-xl transition ${
                            isInvesting || !shareCount
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-pink-500 hover:bg-pink-600 text-white'
                          }`}
                        >
                          {isInvesting ? 'Processing...' : 'Invest Now'}
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

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          const currentIndex = SUCCESS_STORIES.findIndex(s => s.id === selectedEntryId);
                          if (currentIndex > 0) {
                            setSelectedEntryId(SUCCESS_STORIES[currentIndex - 1].id);
                          }
                        }}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => {
                          const currentIndex = SUCCESS_STORIES.findIndex(s => s.id === selectedEntryId);
                          if (currentIndex < SUCCESS_STORIES.length - 1) {
                            setSelectedEntryId(SUCCESS_STORIES[currentIndex + 1].id);
                          }
                        }}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition"
                      >
                        Next →
                      </button>
                    </div>
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
