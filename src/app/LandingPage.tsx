'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage({ user }: { user: any }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold">RIZE</h1>
              <p className="text-xs text-gray-400">by Manaboodle · Harvard Edition</p>
            </div>
          </Link>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    
                    <a
                      href="https://www.manaboodle.com/academic-portal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm hover:bg-gray-700 transition"
                    >
                      Manaboodle Account
                    </a>
                    
                    <Link
                      href="/submit"
                      className="block px-4 py-2 text-sm hover:bg-gray-700 transition"
                      onClick={() => setShowMenu(false)}
                    >
                      Submit Startup
                    </Link>
                    
                    <Link
                      href="/api/logout"
                      className="block px-4 py-2 text-sm hover:bg-gray-700 transition text-red-400"
                    >
                      Log Out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition"
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
        </div>
      </section>

      {/* Featured Competitions */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Harvard Legends Competition */}
          <Link 
            href="/competitions?competition=legendary"
            className="group relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border-2 border-yellow-600/30 hover:border-yellow-500 transition-all duration-300 hover:scale-105"
          >
            <h3 className="text-3xl font-bold text-white mb-3">
              Harvard Legends
            </h3>
            
            <p className="text-gray-300 mb-6">
              Vote on the best pitches from Harvard founders who built billion-dollar companies
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rule</p>
                <p className="text-white font-medium">Vote on the best pitch</p>
              </div>
              
              <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold">
                Active Now
              </div>
            </div>
            
            <div className="mt-6 text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              View Rankings
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          {/* Harvard Class of 2026 Competition */}
          <Link 
            href={user ? "/competitions?competition=harvard-2026-main" : "/login"}
            className="group relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border-2 border-blue-600/30 hover:border-blue-500 transition-all duration-300 hover:scale-105"
          >
            <h3 className="text-3xl font-bold text-white mb-3">
              Harvard Class of 2026
            </h3>
            
            <p className="text-gray-300 mb-6">
              Vote for your classmates&apos; startups. Best ideas get featured and investor introductions.
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-white font-medium">Coming Soon</p>
              </div>
              
              <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
                Opening Soon
              </div>
            </div>
            
            <div className="mt-6 text-pink-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              {user ? "View Competition" : "Sign Up to Enter"}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 RIZE by Manaboodle · Harvard Edition</p>
        </div>
      </footer>
    </div>
  );
}
