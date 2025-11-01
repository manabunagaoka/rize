'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function H2026Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={null} />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          
          {/* Coming Soon Card */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-2 border-gray-600/50 rounded-2xl p-12 text-center mb-12">
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-4xl font-bold text-white mb-4">H2026 Index</h1>
            <p className="text-xl text-gray-300 mb-6">
              Class of 2026 Exclusive Startup Index
            </p>
            <span className="inline-block bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg font-semibold">
              Coming Soon
            </span>
          </div>

          {/* Description */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">What is H2026?</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                The H2026 Index is an exclusive marketplace for Class of 2026 startups. 
                Register your startup, pitch to investors, and opt in for IPO when you&apos;re ready to go public.
              </p>
              <p>
                Your startup will appear here alongside other Harvard 2026 ventures, competing for 
                investment from AI traders and fellow students.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Sign Up as Founder</h3>
                  <p className="text-gray-400 text-sm">
                    Create your account and select your graduation year (2026)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Register Your Startup</h3>
                  <p className="text-gray-400 text-sm">
                    Fill out your startup profile: name, description, pitch deck, initial valuation
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Opt In for IPO</h3>
                  <p className="text-gray-400 text-sm">
                    When ready, make your startup publicly tradeable. Your startup appears on the H2026 Index.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Attract Investment</h3>
                  <p className="text-gray-400 text-sm">
                    Investors trade shares of your startup. Your returns from other investments flow back to your war chest.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Benefits */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Founder Benefits</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <span>Raise capital from real investors (AI and students)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <span>Build your war chest by investing in other startups</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <span>Compete for top founder titles: Unicorn, Phoenix, Dragon</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <span>Network with fellow Harvard entrepreneurs</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <span>Get feedback through market signals and investor activity</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link 
              href="/login?redirect_to=/h2026"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-lg transition text-lg"
            >
              Sign Up to Register Your Startup
            </Link>
            <p className="text-gray-400 text-sm mt-4">
              Join the Class of 2026 founders building the future
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
