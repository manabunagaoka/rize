'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AccountClient({ user }: { user: any }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Back Button + Logo */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
                title="Back to Home"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              
              <Link href="/" className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold">RIZE</h1>
                  <p className="text-xs text-gray-400">by Manaboodle · Harvard Edition</p>
                </div>
              </Link>
            </div>
            
            {/* Right: Hamburger Menu */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 top-full w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                    
                    <a
                      href="https://www.manaboodle.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm hover:bg-gray-700 transition"
                    >
                      Manaboodle
                    </a>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm hover:bg-gray-700 transition bg-gray-700/50"
                      onClick={() => setShowMenu(false)}
                    >
                      Account
                    </Link>
                    <Link
                      href="/api/logout"
                      className="block px-4 py-2 text-sm hover:bg-gray-700 transition text-red-400"
                      onClick={() => setShowMenu(false)}
                    >
                      Logout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">My Account</h2>
          
          {/* Profile Section */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-8">
            <h3 className="text-2xl font-bold mb-6">Profile Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-lg text-white">{user.email}</p>
              </div>
              
              {user.name && (
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-lg text-white">{user.name}</p>
                </div>
              )}
              
              {user.classCode && (
                <div>
                  <label className="text-sm text-gray-400">Class</label>
                  <p className="text-lg text-white">{user.classCode}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-3">
                Your account is managed through Manaboodle Academic Portal
              </p>
              <a
                href="https://www.manaboodle.com/academic-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Manage Account →
              </a>
            </div>
          </div>

          {/* My Startups Section */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-8">
            <h3 className="text-2xl font-bold mb-6">My Startups</h3>
            
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven&apos;t submitted any startups yet</p>
              <Link
                href="/submit"
                className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition"
              >
                Submit Your First Startup
              </Link>
            </div>
          </div>

          {/* My Votes Section */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-6">My Voting Activity</h3>
            
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Your voting history will appear here</p>
              <Link
                href="/competitions?competition=legendary"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-xl transition"
              >
                Start Voting
              </Link>
            </div>
          </div>
        </div>
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
