import { getUser } from '@/lib/auth';
import { getTopStartups } from '@/lib/db-helpers';
import { redirect } from 'next/navigation';
import type { TopStartup } from '@/lib/supabase';

export default async function VotePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Try to get startups, but don't fail if database is not connected
  let startups: TopStartup[] = [];
  try {
    startups = await getTopStartups();
  } catch (error) {
    console.error('Error loading startups for vote page:', error);
    // Continue rendering page even if database fails
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RIZE</h1>
                <p className="text-xs text-gray-500">by Manaboodle</p>
              </div>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Welcome, {user.name || user.email}</span>
            <a 
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Vote on Harvard&apos;s<br />
              <span className="text-pink-500">Legendary Startups</span>
            </h2>
            <p className="text-xl text-gray-600">
              Rate each company on 5 key criteria. Your votes shape the leaderboard.
            </p>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center mb-8">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Voting Interface Coming Soon!</h3>
            <p className="text-blue-700 mb-6">
              We&apos;re building the voting UI where you&apos;ll rate startups on:
            </p>
            <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-blue-900">⭐ Market Opportunity</span>
                <p className="text-sm text-gray-600">Size and potential of the market</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-blue-900">💡 Innovation</span>
                <p className="text-sm text-gray-600">Uniqueness and creativity</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-blue-900">⚙️ Execution Difficulty</span>
                <p className="text-sm text-gray-600">Technical and operational challenges</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-semibold text-blue-900">📈 Scalability</span>
                <p className="text-sm text-gray-600">Ability to grow exponentially</p>
              </div>
              <div className="bg-white p-3 rounded-lg md:col-span-2">
                <span className="font-semibold text-blue-900">🌍 Social Impact</span>
                <p className="text-sm text-gray-600">Positive effect on society</p>
              </div>
            </div>
          </div>

          {/* Startup Preview */}
          {startups.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Get Ready to Rate These Legends:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {startups.slice(0, 6).map((startup) => (
                  <div key={startup.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl font-bold text-pink-500">#{startup.rank}</span>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {startup.valuation}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{startup.name}</h4>
                    <p className="text-sm text-gray-500">Founded by {startup.founder}</p>
                  </div>
                ))}
              </div>
              {startups.length > 6 && (
                <p className="text-center text-gray-500 mt-4">
                  ...and {startups.length - 6} more!
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-12 flex gap-4 justify-center">
            <a 
              href="/dashboard"
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              ← Back to Dashboard
            </a>
            <a 
              href="/compete"
              className="px-8 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition"
            >
              View Leaderboard →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
