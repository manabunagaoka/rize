import { getUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import StockPrice from '@/components/StockPrice';
import PitchCard from '@/components/PitchCard';

// Success stories - All 10 Harvard legendary startups for voting
const SUCCESS_STORIES = [
  {
    id: 1,
    name: 'Facebook',
    founder: 'Mark Zuckerberg',
    year: '2004',
    pitch: 'An online directory that connects people through social networks at colleges.',
    funFact: 'Started as "TheFacebook" - exclusive to Harvard students with a .edu email. Expanded to other Ivy League schools within months.',
    valuation: '$1.2T',
    ticker: 'META',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'Microsoft',
    founder: 'Bill Gates & Paul Allen',
    year: '1975',
    pitch: 'A computer on every desk and in every home, running our software.',
    funFact: 'Gates wrote a BASIC interpreter for the Altair 8800 in his dorm room. Sold it before even testing on real hardware - it worked.',
    valuation: '$3.1T',
    ticker: 'MSFT',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    name: 'Dropbox',
    founder: 'Drew Houston',
    year: '2007',
    pitch: 'Your files, anywhere. One folder that syncs across all your devices.',
    funFact: 'Drew forgot his USB drive on a bus trip and coded the first prototype during the 4-hour ride. Launched at Y Combinator.',
    valuation: '$10B',
    ticker: 'DBX',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 4,
    name: 'Akamai',
    founder: 'Tom Leighton & Danny Lewin',
    year: '1998',
    pitch: 'Make the internet faster by serving content from servers closer to users.',
    funFact: 'Started as an MIT/Harvard math project. Now delivers 30% of all web traffic globally including Netflix and Spotify.',
    valuation: '$15B',
    ticker: 'AKAM',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 5,
    name: 'Reddit',
    founder: 'Steve Huffman & Alexis Ohanian',
    year: '2005',
    pitch: 'The front page of the internet - where communities create and share content.',
    funFact: 'Pitched as "Memepool meets Delicious" at Y Combinator. Built in 3 weeks using Python. Now 500M+ monthly users.',
    valuation: '$10B',
    ticker: 'RDDT',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 6,
    name: 'Priceonomics',
    founder: 'Rohin Dhar',
    year: '2010',
    pitch: 'Data-driven storytelling that helps you make better buying decisions.',
    funFact: 'Started by scraping Craigslist to find fair prices. Pivoted to become a content marketing agency acquired by Content Harmony.',
    valuation: 'Acquired',
    ticker: null,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 7,
    name: 'Quora',
    founder: 'Adam D\'Angelo & Charlie Cheever',
    year: '2009',
    pitch: 'A place to share knowledge and better understand the world.',
    funFact: 'Adam was Facebook\'s first CTO. Built Quora to create higher quality Q&A than Yahoo Answers. 400M+ monthly users.',
    valuation: '$2B',
    ticker: null,
    color: 'from-red-500 to-red-600'
  },
  {
    id: 8,
    name: 'Warby Parker',
    founder: 'Neil Blumenthal & team',
    year: '2010',
    pitch: 'Designer eyewear at a revolutionary price, while leading the way for socially conscious businesses.',
    funFact: 'Started because founder lost his glasses and was shocked by the $500 price. Buy a pair, give a pair model. Now valued at $3B.',
    valuation: '$3B',
    ticker: 'WRBY',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 9,
    name: 'Typeform',
    founder: 'Robert Muñoz',
    year: '2012',
    pitch: 'Forms and surveys that people actually want to fill out.',
    funFact: 'Built because founders hated boring online forms. Made them conversational and beautiful. 150M+ responses collected yearly.',
    valuation: '$935M',
    ticker: null,
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 10,
    name: 'Booking.com',
    founder: 'Geert-Jan Bruinsma',
    year: '1996',
    pitch: 'Book accommodations anywhere in the world with instant confirmation.',
    funFact: 'Started in Amsterdam, but expanded with Harvard MBA insights. Now books 1.5M room nights per day globally.',
    valuation: '$100B',
    ticker: 'BKNG',
    color: 'from-blue-400 to-blue-500'
  }
];

// Fetch student startups from project_rankings view
async function getStudentStartups() {
  try {
    const { data, error } = await supabase
      .from('project_rankings')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading student startups:', error);
    return [];
  }
}

// Get total vote count for social proof
async function getTotalVotes() {
  try {
    const { count, error } = await supabase
      .from('project_votes')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error loading vote count:', error);
    return 0;
  }
}

export default async function HomePage() {
  const user = await getUser();
  const studentStartups = await getStudentStartups();
  const totalVotes = await getTotalVotes();
  
  // Get pitch rankings to sort SUCCESS_STORIES by vote count
  const { data: rankings } = await supabase
    .from('legendary_pitch_rankings')
    .select('*');
  
  // Create a map of pitch_id -> vote_count and rank for display
  const voteMap = new Map(rankings?.map(r => [r.pitch_id, r.vote_count]) || []);
  
  // Sort SUCCESS_STORIES by vote count (descending), then by id (ascending) for ties
  const sortedStories = [...SUCCESS_STORIES].sort((a, b) => {
    const votesA = voteMap.get(a.id) || 0;
    const votesB = voteMap.get(b.id) || 0;
    if (votesB !== votesA) return votesB - votesA; // Higher votes first
    return a.id - b.id; // If tied, sort by id
  });
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RIZE</h1>
              <p className="text-xs text-gray-400">by Manaboodle</p>
            </div>
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">Hi, {user.name}</span>
              <Link 
                href="/vote"
                className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition"
              >
                Vote Now
              </Link>
            </div>
          ) : (
            <Link 
              href="/login"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            From Dorm Room<br />
            to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">Billion-Dollar Company</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Harvard&apos;s next unicorn is being built right now. Vote on the best student startups and discover the future before everyone else.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={user ? "/vote" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-pink-700 transition shadow-xl"
            >
              {user ? "Start Voting →" : "Sign In to Vote →"}
            </Link>
            <Link 
              href={user ? "/submit" : "/login"}
              className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold text-lg hover:bg-gray-700 transition border-2 border-gray-700"
            >
              Submit Your Startup
            </Link>
          </div>
        </div>
      </section>

      {/* Legendary Pitches - Vote for Inspiration */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-3">
              Vote on Legendary Pitches
            </h3>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Which elevator pitch inspires you most? Vote on pitches from Harvard founders who turned dorm room ideas into billion-dollar companies.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {sortedStories.map((story, index) => (
              <PitchCard 
                key={story.id} 
                story={story} 
                isAuthenticated={!!user}
                rank={index + 1}
              />
            ))}
          </div>
          
          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">
              Inspired? Ready to craft your own legendary pitch?
            </p>
            <Link
              href="/submit"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
            >
              Submit Your Startup
            </Link>
          </div>
        </div>
      </section>

      {/* Class of 2026 Rankings */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <p className="text-green-400 text-sm font-semibold">
                LIVE RANKINGS
              </p>
            </div>
            <h3 className="text-4xl font-bold text-white mb-3">
              Class of 2026 Startups
            </h3>
            <p className="text-gray-400 text-lg mb-6">
              Student startups competing for the top spot
            </p>
          </div>
          
          {studentStartups.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
              <h4 className="text-2xl font-bold text-white mb-3">
                Be the First to Submit
              </h4>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                No startups submitted yet. Be the first to showcase your project to the Harvard community!
              </p>
              <Link 
                href={user ? "/submit" : "/login"}
                className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition"
              >
                {user ? "Submit Your Startup" : "Sign In to Submit"}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {studentStartups.map((startup: any, index: number) => (
                <div 
                  key={startup.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-pink-500/50 transition-all"
                >
                  <div className="flex items-start gap-6">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">#{index + 1}</span>
                      </div>
                    </div>
                    
                    {/* Startup Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-2xl font-bold text-white mb-1">
                            {startup.startup_name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {startup.founders} {startup.user_class && `• ${startup.user_class}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-pink-500/20 px-3 py-1 rounded-full">
                          <span className="text-2xl">⭐</span>
                          <span className="text-xl font-bold text-pink-400">
                            {startup.overall_score > 0 ? startup.overall_score.toFixed(1) : 'New'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-3">
                        {startup.elevator_pitch}
                      </p>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                          {startup.category}
                        </span>
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                          {startup.stage}
                        </span>
                        {startup.traction_value && (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                            {startup.traction_value}
                          </span>
                        )}
                        <span className="text-gray-400 text-sm">
                          {startup.vote_count} {startup.vote_count === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Vote Button */}
                    <Link 
                      href={user ? "/vote" : "/login"}
                      className="flex-shrink-0 px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition"
                    >
                      Vote
                    </Link>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-8">
                <Link 
                  href="/leaderboard"
                  className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition border-2 border-gray-700"
                >
                  View Full Leaderboard →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to join the competition?
          </h3>
          <p className="text-gray-300 text-lg mb-8">
            {user 
              ? "Start voting on startups to unlock submission."
              : "Sign in with your Harvard account to vote and submit."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={user ? "/vote" : "/login"}
              className="px-8 py-4 bg-pink-500 text-white rounded-lg font-semibold text-lg hover:bg-pink-600 transition"
            >
              {user ? "Start Voting" : "Sign In"}
            </Link>
            {user && (
              <Link 
                href="/submit"
                className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold text-lg hover:bg-gray-700 transition border-2 border-gray-700"
              >
                Submit Startup
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400 text-sm">
          <p>© 2025 RIZE by Manaboodle • Harvard Edition • Class of 2026</p>
        </div>
      </footer>
    </main>
  );
}
