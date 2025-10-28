'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Header({ user, showBack }: { user?: any; showBack?: boolean }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
                <h1 className="text-2xl font-bold">RIZE</h1>
                <p className="text-xs text-gray-400">by Manaboodle · Harvard Edition</p>
              </div>
            </Link>
          </div>

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

                  <a href="https://www.manaboodle.com" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-700 transition">
                    Manaboodle
                  </a>

                  <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                    Account
                  </Link>

                  {user ? (
                    <Link href="/api/logout" className="block px-4 py-2 text-sm hover:bg-gray-700 transition text-red-400" onClick={() => setShowMenu(false)}>
                      Log Out
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                        Sign In
                      </Link>
                      <Link href="/login?action=signup" className="block px-4 py-2 text-sm hover:bg-gray-700 transition" onClick={() => setShowMenu(false)}>
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
