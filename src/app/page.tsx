import { getUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Success stories - hardcoded legendary Harvard startups
const SUCCESS_STORIES = [
  {
    name: 'Facebook',
    founder: 'Mark Zuckerberg',
    year: '2004',
    valuation: '$1.2T',
    logo: '👥'
  },
  {
    name: 'Microsoft',
    founder: 'Bill Gates',
    year: '1975',
    valuation: '$3.1T',
    logo: '💻'
  },
  {
    name: 'Dropbox',
    founder: 'Drew Houston',
    year: '2007',
    valuation: '$10B',
    logo: '📦'
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
          <div className="inline-block mb-6 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full">
            <p className="text-pink-400 text-sm font-semibold">
              🔥 {totalVotes} votes cast this week
            </p>
          </div>
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

      {/* Success Stories */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-3">
              🏆 Harvard Success Stories
            </h3>
            <p className="text-gray-400 text-lg">
              All started in Harvard dorm rooms
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {SUCCESS_STORIES.map((story) => (
              <div 
                key={story.name}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 hover:border-pink-500/50 transition-all hover:scale-105"
              >
                <div className="text-6xl mb-4">{story.logo}</div>
                <h4 className="text-2xl font-bold text-white mb-2">{story.name}</h4>
                <p className="text-gray-400 text-sm mb-4">
                  {story.founder} &apos;{story.year.slice(-2)}
                </p>
                <div className="text-3xl font-bold text-pink-400">
                  {story.valuation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Class of 2026 Rankings */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <p className="text-green-400 text-sm font-semibold">
                🔴 LIVE RANKINGS
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
              <div className="text-6xl mb-4">🚀</div>
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
