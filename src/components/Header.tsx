'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Header({ user, showBack }: { user?: any; showBack?: boolean }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Get current path for redirect
  const getCurrentPath = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/';
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBack ? (
              <Link href="/" className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white" title="Back to Home">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            ) : null}

            <Link href="/" className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold">Unicorn - Harvard Edition</h1>
                <p className="text-xs text-gray-400">by Manaboodle</p>
              </div>
            </Link>
          </div>

          {/* Index Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition"
            >
              Account
            </Link>
            <Link 
              href="/hm7"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition"
            >
              Trade
            </Link>
            <Link 
              href="/leaderboard"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition"
            >
              Compete
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {!user && !showBack && (
              <Link 
                href={`/login?redirect_to=${encodeURIComponent(getCurrentPath())}`}
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Sign In
              </Link>
            )}
            
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-800 rounded-lg transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 top-full w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                  <div className="py-2">
                    {user && (
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                    )}

                    {/* Mobile Index Navigation */}
                    <div className="md:hidden border-b border-gray-700">
                      <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                        Account
                      </Link>
                      <Link href="/hm7" className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                        Trade
                      </Link>
                      <Link href="/leaderboard" className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                        Compete
                      </Link>
                    </div>

                    <a href="https://www.manaboodle.com" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-700 transition">
                      Manaboodle
                    </a>

                    {user && (
                      <Link href="/portfolio" className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                        My Portfolio
                      </Link>
                    )}

                    {user ? (
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                        Account
                      </Link>
                    ) : (
                      <a href="https://www.manaboodle.com/signup" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-700 transition">
                        Create Account
                      </a>
                    )}

                    {user ? (
                      <Link href="/api/logout" className="block px-4 py-2 text-sm hover:bg-gray-700 transition text-red-400" onClick={() => setShowMenu(false)}>
                        Log Out
                      </Link>
                    ) : (
                      <>
                        <Link href={`/login?redirect_to=${encodeURIComponent(getCurrentPath())}`} className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                          Sign In
                        </Link>
                        <a href="https://www.manaboodle.com/signup" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-700 transition">
                          Sign Up
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
