'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface Competition {
  id: string;
  name: string;
  status: 'active' | 'upcoming' | 'archived';
  icon: string;
  total_votes: number;
  total_entries: number;
  pending_submissions: number;
}

interface CompetitionSidebarProps {
  activeCompetitionId: string;
  onSelectCompetition: (id: string) => void;
}

export default function CompetitionSidebar({ activeCompetitionId, onSelectCompetition }: CompetitionSidebarProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions');
      const data = await response.json();
      setCompetitions(data.competitions || []);
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCompetition = competitions.find(c => c.id === activeCompetitionId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="text-xs text-green-400">● Live</span>;
      case 'upcoming':
        return <span className="text-xs text-yellow-400">● Soon</span>;
      case 'archived':
        return <span className="text-xs text-gray-500">● Archived</span>;
      default:
        return null;
    }
  };

  const handleSelectCompetition = (id: string) => {
    onSelectCompetition(id);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="animate-pulse h-8 bg-gray-800 rounded"></div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Header with Dropdown */}
      <div className="hidden md:block bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-white font-bold text-xl">RIZE</span>
          </Link>

          {/* Competition Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-2xl">{activeCompetition?.icon}</span>
              <div className="text-left">
                <div className="text-white font-semibold text-sm">{activeCompetition?.name}</div>
                <div className="text-gray-400 text-xs">
                  {activeCompetition?.total_votes} votes • {activeCompetition?.total_entries} entries
                </div>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                {competitions.map((competition) => (
                  <button
                    key={competition.id}
                    onClick={() => handleSelectCompetition(competition.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors ${
                      activeCompetitionId === competition.id ? 'bg-pink-500/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{competition.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold text-sm">{competition.name}</span>
                          {activeCompetitionId === competition.id && (
                            <span className="text-pink-500">✓</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {competition.total_votes}v • {competition.total_entries}e • {getStatusBadge(competition.status)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                
                <div className="border-t border-gray-700 mt-2 pt-2 px-2">
                  <a
                    href="https://www.manaboodle.com/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    + Create Competition
                  </a>
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    ⚙️ Admin Panel
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <button
            onClick={() => window.location.href = '/api/logout'}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Header with Hamburger */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-white font-bold">RIZE</span>
          </Link>

          {/* Current Competition */}
          <span className="text-xl">{activeCompetition?.icon}</span>
        </div>

        {/* Current Competition Info */}
        <div className="px-4 pb-3">
          <div className="text-white font-semibold text-sm">{activeCompetition?.name}</div>
          <div className="text-gray-400 text-xs">
            {activeCompetition?.total_votes} votes • {activeCompetition?.total_entries} entries
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-80 bg-gray-900 z-50 md:hidden transform transition-transform overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Competitions</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Competition List */}
              <div className="space-y-2 mb-6">
                {competitions.map((competition) => (
                  <button
                    key={competition.id}
                    onClick={() => handleSelectCompetition(competition.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeCompetitionId === competition.id
                        ? 'bg-pink-500/20 border border-pink-500'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{competition.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm mb-1">{competition.name}</div>
                        <div className="text-xs text-gray-400">
                          {competition.total_votes}v • {competition.total_entries}e • {getStatusBadge(competition.status)}
                        </div>
                      </div>
                      {activeCompetitionId === competition.id && (
                        <span className="text-pink-500">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2 border-t border-gray-800 pt-4">
                <a
                  href="https://www.manaboodle.com/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg text-center transition-colors"
                >
                  + Create Competition
                </a>
                
                <Link
                  href="/admin"
                  className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg text-center transition-colors"
                >
                  ⚙️ Admin Panel
                </Link>

                <button
                  onClick={() => window.location.href = '/api/logout'}
                  className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg text-center transition-colors"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
