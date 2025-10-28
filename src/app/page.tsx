import { getUser } from '@/lib/auth';import { getUser } from '@/lib/auth';

import Link from 'next/link';import { supabase } from '@/lib/supabase';

import Link from 'next/link';

export default async function HomePage() {import StockPrice from '@/components/StockPrice';

  const user = await getUser();import PitchCard from '@/components/PitchCard';



  return (// Success stories - All 10 Harvard legendary startups for voting

    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">const SUCCESS_STORIES = [

      {/* Header */}  {

      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">    id: 1,

        <div className="container mx-auto px-4 py-4 flex justify-between items-center">    name: 'Facebook',

          <Link href="/" className="flex items-center gap-3">    founder: 'Mark Zuckerberg',

            <div>    year: '2004',

              <h1 className="text-2xl font-bold">RIZE</h1>    pitch: 'An online directory that connects people through social networks at colleges.',

              <p className="text-xs text-gray-400">Harvard Edition</p>    funFact: 'Started as "TheFacebook" - exclusive to Harvard students with a .edu email. Expanded to other Ivy League schools within months.',

            </div>    valuation: '$1.2T',

          </Link>    ticker: 'META',

              color: 'from-blue-500 to-blue-600'

          {user ? (  },

            // Hamburger menu when logged in  {

            <div className="relative group">    id: 2,

              <button className="p-2 hover:bg-gray-800 rounded-lg transition">    name: 'Microsoft',

                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">    founder: 'Bill Gates & Paul Allen',

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />    year: '1975',

                </svg>    pitch: 'A computer on every desk and in every home, running our software.',

              </button>    funFact: 'Gates wrote a BASIC interpreter for the Altair 8800 in his dorm room. Sold it before even testing on real hardware - it worked.',

                  valuation: '$3.1T',

              {/* Dropdown menu */}    ticker: 'MSFT',

              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">    color: 'from-green-500 to-green-600'

                <div className="py-2">  },

                  <div className="px-4 py-2 border-b border-gray-700">  {

                    <p className="text-sm text-gray-400">Signed in as</p>    id: 3,

                    <p className="text-sm font-medium truncate">{user.email}</p>    name: 'Dropbox',

                  </div>    founder: 'Drew Houston',

                      year: '2007',

                  <a    pitch: 'Your files, anywhere. One folder that syncs across all your devices.',

                    href="https://www.manaboodle.com/academic-portal"    funFact: 'Drew forgot his USB drive on a bus trip and coded the first prototype during the 4-hour ride. Launched at Y Combinator.',

                    target="_blank"    valuation: '$10B',

                    rel="noopener noreferrer"    ticker: 'DBX',

                    className="block px-4 py-2 text-sm hover:bg-gray-700 transition"    color: 'from-purple-500 to-purple-600'

                  >  },

                    Manaboodle Account  {

                  </a>    id: 4,

                      name: 'Akamai',

                  <Link    founder: 'Tom Leighton & Danny Lewin',

                    href="/submit"    year: '1998',

                    className="block px-4 py-2 text-sm hover:bg-gray-700 transition"    pitch: 'Make the internet faster by serving content from servers closer to users.',

                  >    funFact: 'Started as an MIT/Harvard math project. Now delivers 30% of all web traffic globally including Netflix and Spotify.',

                    Submit Startup    valuation: '$15B',

                  </Link>    ticker: 'AKAM',

                      color: 'from-cyan-500 to-cyan-600'

                  <Link  },

                    href="/api/logout"  {

                    className="block px-4 py-2 text-sm hover:bg-gray-700 transition text-red-400"    id: 5,

                  >    name: 'Reddit',

                    Log Out    founder: 'Steve Huffman & Alexis Ohanian',

                  </Link>    year: '2005',

                </div>    pitch: 'The front page of the internet - where communities create and share content.',

              </div>    funFact: 'Pitched as "Memepool meets Delicious" at Y Combinator. Built in 3 weeks using Python. Now 500M+ monthly users.',

            </div>    valuation: '$10B',

          ) : (    ticker: 'RDDT',

            <Link    color: 'from-orange-500 to-orange-600'

              href="/login"  },

              className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition"  {

            >    id: 6,

              Sign In    name: 'Priceonomics',

            </Link>    founder: 'Rohin Dhar',

          )}    year: '2010',

        </div>    pitch: 'Data-driven storytelling that helps you make better buying decisions.',

      </header>    funFact: 'Started by scraping Craigslist to find fair prices. Pivoted to become a content marketing agency acquired by Content Harmony.',

    valuation: 'Acquired',

      {/* Hero Section */}    ticker: null,

      <section className="container mx-auto px-4 py-20 text-center">    color: 'from-yellow-500 to-yellow-600'

        <div className="max-w-5xl mx-auto">  },

          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">  {

            From Dorm Room<br />    id: 7,

            to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">Billion-Dollar Company</span>    name: 'Quora',

          </h2>    founder: 'Adam D\'Angelo & Charlie Cheever',

          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">    year: '2009',

            Harvard&apos;s next unicorn is being built right now. Vote on the best student startups and discover the future before everyone else.    pitch: 'A place to share knowledge and better understand the world.',

          </p>    funFact: 'Adam was Facebook\'s first CTO. Built Quora to create higher quality Q&A than Yahoo Answers. 400M+ monthly users.',

        </div>    valuation: '$2B',

      </section>    ticker: null,

    color: 'from-red-500 to-red-600'

      {/* Featured Competitions */}  },

      <section className="container mx-auto px-4 pb-20">  {

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">    id: 8,

              name: 'Warby Parker',

          {/* Harvard Legends Competition */}    founder: 'Neil Blumenthal & team',

          <Link     year: '2010',

            href="/competitions?competition=legendary"    pitch: 'Designer eyewear at a revolutionary price, while leading the way for socially conscious businesses.',

            className="group relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border-2 border-yellow-600/30 hover:border-yellow-500 transition-all duration-300 hover:scale-105"    funFact: 'Started because founder lost his glasses and was shocked by the $500 price. Buy a pair, give a pair model. Now valued at $3B.',

          >    valuation: '$3B',

            <div className="absolute top-4 right-4 text-4xl">🏆</div>    ticker: 'WRBY',

                color: 'from-indigo-500 to-indigo-600'

            <h3 className="text-3xl font-bold text-white mb-3">  },

              Harvard Legends  {

            </h3>    id: 9,

                name: 'Typeform',

            <p className="text-gray-300 mb-6">    founder: 'Robert Muñoz',

              Vote on the best pitches from Harvard founders who built billion-dollar companies    year: '2012',

            </p>    pitch: 'Forms and surveys that people actually want to fill out.',

                funFact: 'Built because founders hated boring online forms. Made them conversational and beautiful. 150M+ responses collected yearly.',

            <div className="flex items-center justify-between">    valuation: '$935M',

              <div>    ticker: null,

                <p className="text-sm text-gray-400">Rule</p>    color: 'from-pink-500 to-pink-600'

                <p className="text-white font-medium">Vote on the best pitch</p>  },

              </div>  {

                  id: 10,

              <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold">    name: 'Booking.com',

                Active Now    founder: 'Geert-Jan Bruinsma',

              </div>    year: '1996',

            </div>    pitch: 'Book accommodations anywhere in the world with instant confirmation.',

                funFact: 'Started in Amsterdam, but expanded with Harvard MBA insights. Now books 1.5M room nights per day globally.',

            <div className="mt-6 text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">    valuation: '$100B',

              View Rankings    ticker: 'BKNG',

              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">    color: 'from-blue-400 to-blue-500'

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />  }

              </svg>];

            </div>

          </Link>// Fetch student startups from project_rankings view

async function getStudentStartups() {

          {/* Harvard Class of 2026 Competition */}  try {

          <Link     const { data, error } = await supabase

            href={user ? "/competitions?competition=harvard-2026-main" : "/login"}      .from('project_rankings')

            className="group relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border-2 border-blue-600/30 hover:border-blue-500 transition-all duration-300 hover:scale-105"      .select('*')

          >      .limit(5);

            <div className="absolute top-4 right-4 text-4xl">🎓</div>    

                if (error) throw error;

            <h3 className="text-3xl font-bold text-white mb-3">    return data || [];

              Harvard Class of 2026  } catch (error) {

            </h3>    console.error('Error loading student startups:', error);

                return [];

            <p className="text-gray-300 mb-6">  }

              Vote for your classmates&apos; startups. Best ideas get featured and investor introductions.}

            </p>

            // Get total vote count for social proof

            <div className="flex items-center justify-between">async function getTotalVotes() {

              <div>  try {

                <p className="text-sm text-gray-400">Status</p>    const { count, error } = await supabase

                <p className="text-white font-medium">Coming Soon</p>      .from('project_votes')

              </div>      .select('*', { count: 'exact', head: true });

                  

              <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">    if (error) throw error;

                Opening Soon    return count || 0;

              </div>  } catch (error) {

            </div>    console.error('Error loading vote count:', error);

                return 0;

            <div className="mt-6 text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">  }

              {user ? "View Competition" : "Sign Up to Enter"}}

              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />export default async function HomePage() {

              </svg>  const user = await getUser();

            </div>  const studentStartups = await getStudentStartups();

          </Link>  const totalVotes = await getTotalVotes();

  

        </div>  // Get pitch rankings to sort SUCCESS_STORIES by vote count

      </section>  const { data: rankings } = await supabase

    .from('legendary_pitch_rankings')

      {/* Footer */}    .select('*');

      <footer className="border-t border-gray-800 py-8">  

        <div className="container mx-auto px-4 text-center text-gray-500">  // Create a map of pitch_id -> vote_count and rank for display

          <p>&copy; 2025 RIZE - Harvard Edition. Built with ❤️ at Harvard.</p>  const voteMap = new Map(rankings?.map(r => [r.pitch_id, r.vote_count]) || []);

        </div>  

      </footer>  // Sort SUCCESS_STORIES by vote count (descending), then by id (ascending) for ties

    </div>  const sortedStories = [...SUCCESS_STORIES].sort((a, b) => {

  );    const votesA = voteMap.get(a.id) || 0;

}    const votesB = voteMap.get(b.id) || 0;

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
