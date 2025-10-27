'use client';

import { useState, useEffect } from 'react';
import StockPrice from '@/components/StockPrice';

interface PitchCardProps {
  story: {
    id: number;
    name: string;
    founder: string;
    year: string;
    pitch: string;
    funFact: string;
    valuation: string;
    ticker: string | null;
    color: string;
  };
  isAuthenticated: boolean;
  rank: number;
}

export default function PitchCard({ story, isAuthenticated, rank }: PitchCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch initial vote state on mount
  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const response = await fetch('/api/vote-pitch');
      const data = await response.json();
      
      const pitchRanking = data.rankings?.find((r: any) => r.pitch_id === story.id);
      setVoteCount(pitchRanking?.vote_count || 0);
      setHasVoted(data.userVotes?.includes(story.id) || false);
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      console.log('[PITCH CARD] Not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }

    console.log('[PITCH CARD] Voting for pitch:', story.id);
    setLoading(true);
    try {
      const response = await fetch('/api/vote-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: story.id })
      });

      const data = await response.json();
      console.log('[PITCH CARD] Vote response:', data);
      
      if (data.success) {
        // Toggle vote state
        if (data.action === 'voted') {
          setHasVoted(true);
          setVoteCount(prev => prev + 1);
        } else {
          setHasVoted(false);
          setVoteCount(prev => Math.max(0, prev - 1));
        }
      } else {
        console.error('[PITCH CARD] Vote failed:', data);
        alert(`Vote failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[PITCH CARD] Vote error:', error);
      alert(`Vote error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-pink-500 transition-all duration-300 relative">
      {/* Ranking Badge */}
      <div className={`absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
        rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
        rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
        rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900' :
        'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200'
      }`}>
        #{rank}
      </div>
      
      {/* Header with Name and Valuation */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-1">{story.name}</h3>
          <p className="text-gray-400 text-sm">{story.founder} • {story.year}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-pink-500">{story.valuation}</p>
          {story.ticker && <StockPrice ticker={story.ticker} />}
        </div>
      </div>
      
      {/* Elevator Pitch */}
      <div className="mb-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
        <p className="text-sm text-gray-400 mb-2 font-semibold">ORIGINAL PITCH</p>
        <p className="text-white leading-relaxed">&ldquo;{story.pitch}&rdquo;</p>
      </div>
      
      {/* Fun Fact */}
      <div className="mb-4">
        <p className="text-gray-300 text-sm leading-relaxed">{story.funFact}</p>
      </div>
      
      {/* Vote Button */}
      <button 
        onClick={handleVote}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          hasVoted
            ? 'bg-gradient-to-r ' + story.color + ' text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Updating...' : hasVoted ? `Voted! (${voteCount})` : `Vote for This Pitch (${voteCount})`}
      </button>
    </div>
  );
}
