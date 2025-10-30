'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: number;
  name: string;
  voteCount: number; // This is actually total investment volume
  previousRank?: number;
}

interface LeaderboardProps {
  competitionId: string;
  entries: LeaderboardEntry[];
  onSelectEntry: (id: number) => void;
  selectedEntryId?: number;
}

export default function Leaderboard({ competitionId, entries, onSelectEntry, selectedEntryId }: LeaderboardProps) {
  const [previousRankings, setPreviousRankings] = useState<Map<number, number>>(new Map());

  // Calculate rankings and movement
  const rankedEntries = entries
    .sort((a, b) => b.voteCount - a.voteCount)
    .map((entry, index) => {
      const currentRank = index + 1;
      const previousRank = previousRankings.get(entry.id);
      
      let movement = '→';
      let movementColor = 'text-gray-500';
      
      if (previousRank !== undefined) {
        if (previousRank > currentRank) {
          const diff = previousRank - currentRank;
          movement = `↑${diff}`;
          movementColor = 'text-green-400';
        } else if (previousRank < currentRank) {
          const diff = currentRank - previousRank;
          movement = `↓${diff}`;
          movementColor = 'text-red-400';
        }
      } else if (entry.voteCount > 0) {
        movement = 'NEW';
        movementColor = 'text-blue-400';
      }

      return {
        ...entry,
        rank: currentRank,
        movement,
        movementColor
      };
    });

  // Update previous rankings
  useEffect(() => {
    const newRankings = new Map();
    rankedEntries.forEach((entry, index) => {
      newRankings.set(entry.id, index + 1);
    });
    setPreviousRankings(newRankings);
  }, [entries.map(e => e.voteCount).join(',')]);

  const getRankBadge = (rank: number) => {
    // No medals - just rank numbers
    return `#${rank}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 uppercase">
          <div className="col-span-1">Rank</div>
          <div className="col-span-7">Company</div>
          <div className="col-span-2 text-right">Value</div>
          <div className="col-span-2 text-right">Trend</div>
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-gray-700">
        {rankedEntries.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p>No entries yet</p>
            <p className="text-sm mt-2">Be the first to submit!</p>
          </div>
        ) : (
          rankedEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelectEntry(entry.id)}
              className={`w-full px-4 py-3 transition-colors ${
                selectedEntryId === entry.id
                  ? 'bg-pink-500/20 border-l-4 border-pink-500'
                  : 'hover:bg-gray-700/50 border-l-4 border-transparent'
              }`}
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                {/* Rank */}
                <div className="col-span-1">
                  <span className="text-lg">{getRankBadge(entry.rank)}</span>
                </div>

                {/* Name */}
                <div className="col-span-7 text-left">
                  <span className="text-white font-medium truncate block">
                    {entry.name}
                  </span>
                </div>

                {/* Investment Value */}
                <div className="col-span-2 text-right">
                  <span className="text-white font-semibold">
                    ${entry.voteCount.toLocaleString()}
                  </span>
                </div>

                {/* Movement */}
                <div className="col-span-2 text-right">
                  <span className={`text-sm font-semibold ${entry.movementColor}`}>
                    {entry.movement}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
