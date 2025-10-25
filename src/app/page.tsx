import { getTopStartups } from '@/lib/db-helpers';
import { getUser } from '@/lib/auth';

export default async function HomePage() {
  // Fetch real data from Supabase
  const startups = await getTopStartups();
  const user = await getUser(); // SSO user (null if not logged in on landing page - it's public)
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-crimson-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RIZE</h1>
              <p className="text-xs text-gray-500">by Manaboodle</p>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Welcome, {user.name || user.email}</span>
              <button className="px-4 py-2 bg-crimson-700 text-white rounded-lg font-medium hover:bg-crimson-800 transition">
                My Projects
              </button>
            </div>
          ) : (
            <button className="px-4 py-2 bg-crimson-700 text-white rounded-lg font-medium hover:bg-crimson-800 transition">
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold text-gray-900 mb-6">
            Rank Harvard's<br />
            <span className="text-crimson-700">Greatest Startups</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Vote on legendary companies. Submit your startup. Compete for the top 10.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/login"
              className="px-8 py-4 bg-crimson-700 text-white rounded-lg font-semibold text-lg hover:bg-crimson-800 transition shadow-lg"
            >
              Start Ranking →
            </a>
            <a 
              href="/leaderboard"
              className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 transition border-2 border-gray-200"
            >
              View Leaderboard
            </a>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">✅ Development Progress</h3>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                STEP 2 COMPLETE
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* STEP 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <h4 className="font-bold text-gray-900">STEP 1: Project Setup</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 ml-8">
                  <li>✓ Next.js 14 + TypeScript</li>
                  <li>✓ Tailwind CSS styling</li>
                  <li>✓ SSO Authentication (RIZE)</li>
                  <li>✓ Auth helpers & middleware</li>
                </ul>
              </div>

              {/* STEP 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <h4 className="font-bold text-gray-900">STEP 2: Database</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 ml-8">
                  <li>✓ Supabase schema (4 tables)</li>
                  <li>✓ Top 10 Harvard startups seeded</li>
                  <li>✓ 20+ database helpers</li>
                  <li>✓ Health check API ready</li>
                </ul>
              </div>

              {/* STEP 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏳</span>
                  <h4 className="font-bold text-gray-700">STEP 3: Components</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-500 ml-8">
                  <li>○ VotingModal with stars</li>
                  <li>○ TopStartupCard</li>
                  <li>○ ProgressTracker</li>
                  <li>○ LeaderboardTable</li>
                </ul>
              </div>

              {/* STEP 4 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏳</span>
                  <h4 className="font-bold text-gray-700">STEP 4: Pages & APIs</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-500 ml-8">
                  <li>○ Landing page with Top 10</li>
                  <li>○ Voting endpoints</li>
                  <li>○ Submit project form</li>
                  <li>○ Public leaderboard</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>👉 Next:</strong> Run STEP 3 to build the voting interface! 
                The database is ready with all 10 Harvard startups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Data: Top 10 Startups from Supabase */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Top 10 Harvard Startups
          </h3>
          <p className="text-center text-gray-600 mb-8">
            Legendary companies founded by Harvard students
          </p>
          
          {startups.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <p className="text-yellow-800 mb-4">
                <strong>⚠️ Database not connected yet</strong>
              </p>
              <p className="text-sm text-yellow-700 mb-4">
                To see real data, you need to:
              </p>
              <ol className="text-left max-w-md mx-auto text-sm text-yellow-700 space-y-2">
                <li>1. Create a Supabase project at <a href="https://supabase.com" className="underline">supabase.com</a></li>
                <li>2. Run <code className="bg-yellow-100 px-2 py-1 rounded">supabase/schema.sql</code> in SQL Editor</li>
                <li>3. Run <code className="bg-yellow-100 px-2 py-1 rounded">supabase/seed.sql</code> to load startups</li>
                <li>4. Add credentials to <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code></li>
              </ol>
              <p className="text-xs text-yellow-600 mt-4">
                See <code>supabase/README.md</code> for detailed instructions
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startups.map((startup) => (
                <div key={startup.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all border border-gray-200 hover:border-crimson-300">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl font-bold text-crimson-700">#{startup.rank}</span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {startup.valuation}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{startup.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">Founded by {startup.founder} ({startup.founded_year})</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{startup.description}</p>
                  {startup.category && (
                    <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mb-3">
                      {startup.category}
                    </span>
                  )}
                  <button className="w-full py-2 bg-crimson-700 text-white rounded-lg font-medium hover:bg-crimson-800 transition text-sm">
                    ⭐ Rate This Company
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>© 2025 RIZE by Manaboodle - Harvard Edition</p>
        </div>
      </footer>
    </main>
  );
}
