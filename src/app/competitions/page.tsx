'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CompetitionSidebar from '@/components/CompetitionSidebar';
import Leaderboard from '@/components/Leaderboard';

// Auth check hook
function useAuth() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Try to fetch user data from vote API (which checks auth)
        const response = await fetch('/api/vote-pitch');
        const data = await response.json();
        
        if (data.error === 'Not authenticated') {
          router.push('/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    }
    
    checkAuth();
  }, [router]);

  return { isChecking, isAuthenticated };
}

// Legendary Harvard startups data
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

function CompetitionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isChecking, isAuthenticated } = useAuth();
  const [activeCompetitionId, setActiveCompetitionId] = useState<string>('legendary');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Get competition from URL or default to legendary
  useEffect(() => {
    const comp = searchParams.get('competition') || 'legendary';
    setActiveCompetitionId(comp);
  }, [searchParams]);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      if (activeCompetitionId === 'legendary') {
        // Fetch legendary pitch rankings
        const response = await fetch('/api/vote-pitch');
        const data = await response.json();
        
        // Map SUCCESS_STORIES with vote counts
        const entries = SUCCESS_STORIES.map(story => {
          const ranking = data.rankings?.find((r: any) => r.pitch_id === story.id);
          return {
            id: story.id,
            name: story.name,
            voteCount: ranking?.vote_count || 0
          };
        });
        
        setLeaderboardData(entries);
        
        // Auto-select #1 if nothing selected
        if (!selectedEntryId && entries.length > 0) {
          const sorted = [...entries].sort((a, b) => b.voteCount - a.voteCount);
          setSelectedEntryId(sorted[0].id);
        }
      } else {
        // Fetch student startups for class competitions
        // TODO: Implement when we have student submissions
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCompetitionId, selectedEntryId]);

  // Fetch leaderboard data when competition changes
  useEffect(() => {
    fetchLeaderboard();
  }, [activeCompetitionId, fetchLeaderboard]);

  const handleSelectCompetition = (id: string) => {
    router.push(`/?competition=${id}`);
    setActiveCompetitionId(id);
    setSelectedEntryId(undefined);
  };

  const handleSelectEntry = (id: number) => {
    setSelectedEntryId(id);
  };

  const selectedPitch = SUCCESS_STORIES.find(s => s.id === selectedEntryId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Competition Header/Dropdown */}
      <CompetitionSidebar
        activeCompetitionId={activeCompetitionId}
        onSelectCompetition={handleSelectCompetition}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading competition...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Leaderboard */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {activeCompetitionId === 'legendary' ? '🏆 Legendary Pitches' : '🎓 Student Startups'}
              </h2>
              <Leaderboard
                competitionId={activeCompetitionId}
                entries={leaderboardData}
                onSelectEntry={handleSelectEntry}
                selectedEntryId={selectedEntryId}
              />
              
              {activeCompetitionId !== 'legendary' && leaderboardData.length === 0 && (
                <div className="mt-8 text-center">
                  <Link
                    href="/submit"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Submit Your Startup
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Selected Pitch Detail */}
            <div>
              {selectedPitch ? (
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 sticky top-8">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-white mb-2">{selectedPitch.name}</h3>
                    <p className="text-gray-400">{selectedPitch.founder} • {selectedPitch.year}</p>
                    <p className="text-2xl font-bold text-pink-500 mt-2">{selectedPitch.valuation}</p>
                  </div>

                  {/* Original Pitch */}
                  <div className="mb-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                    <p className="text-sm text-gray-400 mb-3 font-semibold">ORIGINAL PITCH</p>
                    <p className="text-white text-lg leading-relaxed">&ldquo;{selectedPitch.pitch}&rdquo;</p>
                  </div>

                  {/* Fun Fact */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-2 font-semibold">💡 FUN FACT</p>
                    <p className="text-gray-300 leading-relaxed">{selectedPitch.funFact}</p>
                  </div>

                  {/* Stock Price */}
                  {selectedPitch.ticker && (
                    <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">Stock: {selectedPitch.ticker}</p>
                      {/* TODO: Add StockPrice component */}
                    </div>
                  )}

                  {/* Vote Button */}
                  <button className={`w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r ${selectedPitch.color} text-white hover:opacity-90 transition-opacity`}>
                    Vote for This Pitch
                  </button>

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => {
                        const currentIndex = SUCCESS_STORIES.findIndex(s => s.id === selectedEntryId);
                        if (currentIndex > 0) {
                          setSelectedEntryId(SUCCESS_STORIES[currentIndex - 1].id);
                        }
                      }}
                      disabled={SUCCESS_STORIES.findIndex(s => s.id === selectedEntryId) === 0}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      disabled={SUCCESS_STORIES.findIndex(s => s.id === selectedEntryId) === SUCCESS_STORIES.length - 1}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
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
    </div>
  );
}

export default function CompetitionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading competitions...</p>
        </div>
      </div>
    }>
      <CompetitionsPageContent />
    </Suspense>
  );
}
