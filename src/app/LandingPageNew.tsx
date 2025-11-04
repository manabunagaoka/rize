'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function LandingPage({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <Header user={user} />

      {/* Main Landing Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Setup Card - Hero Section */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              From Dorm Room to Billion-Dollar Company
            </h2>
            <p className="text-lg text-yellow-400 font-semibold mb-4">
              Sign up and get $1,000,000 MTK (Manaboodle Token) to start investing!
            </p>
            <div className="text-gray-300 space-y-4">
              <p className="text-base">
                Invest in index funds or Harvard&apos;s next unicorn. Support fellow students. Build your fortune.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 my-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-blue-400 mb-3">Investor</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Discover and invest in index funds. Build the winning portfolio and earn top tier titles.
                  </p>
                  <div className="space-y-1 text-xs mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">1.</span>
                      <span className="text-yellow-300 font-semibold">Titan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-bold">2.</span>
                      <span className="text-gray-300 font-semibold">Oracle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-bold">3.</span>
                      <span className="text-orange-300 font-semibold">Alchemist</span>
                    </div>
                  </div>
                  <Link 
                    href="/login?redirect_to=/"
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition text-center"
                  >
                    Sign Up as Investor
                  </Link>
                </div>
                
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-purple-400 mb-3">Founder</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Register your startup in your graduating class Index. Pitch to investors. Opt in for IPO when ready while earning your own capital by investing in other companies—your returns flow back into your company&apos;s war chest. Win top tier titles.
                  </p>
                  <div className="space-y-1 text-xs mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">1.</span>
                      <span className="text-yellow-300 font-semibold">Unicorn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-bold">2.</span>
                      <span className="text-gray-300 font-semibold">Phoenix</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-bold">3.</span>
                      <span className="text-orange-300 font-semibold">Dragon</span>
                    </div>
                  </div>
                  <Link 
                    href="/login?redirect_to=/"
                    className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition text-center"
                  >
                    Sign Up as Founder
                  </Link>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 italic">
                Compete against 10 AI investors and fellow Harvard students to earn your title.
              </p>
            </div>
          </div>

          {/* Featured Indexes */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Explore Indexes</h2>
            
              <div className="grid md:grid-cols-3 gap-6">
                {/* Leaderboard Card */}
                <Link href="/compete" className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-400">Compete</h3>
                  <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Compete against 10 AI investors and fellow Harvard students
                </p>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">Top Investors:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-300">1. AI The Boomer</span>
                      <span className="text-green-400">+12.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">2. ManaMana</span>
                      <span className="text-green-400">+8.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">3. AI YOLO Kid</span>
                      <span className="text-red-400">-2.1%</span>
                    </div>
                  </div>
                </div>
              </Link>

                {/* HM7 Index Card */}
                <Link href="/hm7" className="group bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-purple-400">Trade Unicorns</h3>
                  <svg className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Harvard Magnificent 7 - Current student startups
                </p>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-2">Top Performers:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-300">EduTech AI</span>
                      <span className="text-green-400">+15.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">HealthOS</span>
                      <span className="text-green-400">+10.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">ClimateDAO</span>
                      <span className="text-green-400">+8.9%</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* H2026 Coming Soon Card */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/20 border border-gray-600/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-400">H2026 Index</h3>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  Class of 2026 startups - Your startup will show up here with IPO
                </p>
                <div className="bg-black/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-400 text-center py-4">
                    Register your startup and opt in for IPO to appear here
                  </p>
                </div>
                <Link 
                  href="/login?redirect_to=/"
                  className="block w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition text-center text-sm"
                >
                  Sign Up to Register
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
