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
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<number[]>([]);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const comp = searchParams.get('competition') || 'legendary';
    setActiveCompetitionId(comp);
  }, [searchParams]);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      if (activeCompetitionId === 'legendary') {
        const response = await fetch('/api/vote-pitch', {
          credentials: 'include'
        });
        const data = await response.json();
        
        // Get user votes if authenticated
        if (data.userVotes !== undefined) {
          setUserVotes(data.userVotes);
        }
        
        const entries = SUCCESS_STORIES.map(story => {
          const ranking = data.rankings?.find((r: any) => r.pitch_id === story.id);
          return {
            id: story.id,
            name: story.name,
            voteCount: ranking?.vote_count || 0
          };
        });
        
        setLeaderboardData(entries);
        
        if (!selectedEntryId && entries.length > 0) {
          const sorted = [...entries].sort((a, b) => b.voteCount - a.voteCount);
          setSelectedEntryId(sorted[0].id);
        }
      } else {
        // For Class of 2026, show empty state
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCompetitionId, selectedEntryId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeCompetitionId, fetchLeaderboard]);

  const handleSelectEntry = (id: number) => {
    setSelectedEntryId(id);
  };

  const handleVote = async (pitchId: number) => {
    setIsVoting(true);
    try {
      const response = await fetch('/api/vote-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update user votes
        setUserVotes(data.userVotes || []);
        
        // Update leaderboard with new rankings
        if (data.rankings && activeCompetitionId === 'legendary') {
          const entries = SUCCESS_STORIES.map(story => {
            const ranking = data.rankings.find((r: any) => r.pitch_id === story.id);
            return {
              id: story.id,
              name: story.name,
              voteCount: ranking?.vote_count || 0
            };
          });
          setLeaderboardData(entries);
        }
      } else {
        alert(data.error || data.message || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Vote failed:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const selectedPitch = SUCCESS_STORIES.find(s => s.id === selectedEntryId);

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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Leaderboard */}
            <div>
              <Leaderboard
                competitionId={activeCompetitionId}
                entries={leaderboardData}
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

                    <button 
                      onClick={() => handleVote(selectedPitch.id)}
                      disabled={isVoting}
                      className={`w-full font-semibold py-4 px-6 rounded-xl transition ${
                        userVotes.includes(selectedPitch.id)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-pink-500 hover:bg-pink-600 text-white'
                      } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isVoting ? 'Voting...' : userVotes.includes(selectedPitch.id) ? 'Voted!' : 'Vote for This Pitch'}
                    </button>

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
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 RIZE by Manaboodle · Harvard Edition</p>
        </div>
      </footer>
    </div>
  );
}
