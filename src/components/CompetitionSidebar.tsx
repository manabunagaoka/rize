'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchCompetitions();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="text-xs text-green-400">● Live</span>;
      case 'upcoming':
        return <span className="text-xs text-yellow-400">● Coming Soon</span>;
      case 'archived':
        return <span className="text-xs text-gray-500">● Archived</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded"></div>
          <div className="h-16 bg-gray-800 rounded"></div>
          <div className="h-16 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white mb-1">🏆 RIZE</h2>
        <p className="text-xs text-gray-400">Competitions</p>
      </div>

      {/* Competition List */}
      <div className="flex-1 overflow-y-auto p-2">
        {competitions.map((competition) => (
          <button
            key={competition.id}
            onClick={() => onSelectCompetition(competition.id)}
            className={`w-full text-left p-3 rounded-lg mb-2 transition-all ${
              activeCompetitionId === competition.id
                ? 'bg-pink-500/20 border border-pink-500'
                : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
            }`}
          >
            {/* Competition Name */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{competition.icon}</span>
                <span className="text-sm font-semibold text-white truncate">
                  {competition.name}
                </span>
              </div>
              {getStatusBadge(competition.status)}
            </div>

            {/* Stats */}
            <div className="text-xs text-gray-400 space-y-1">
              <div>{competition.total_votes} votes • {competition.total_entries} entries</div>
              {competition.pending_submissions > 0 && (
                <div className="text-yellow-400">
                  {competition.pending_submissions} pending review
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
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
  );
}
