'use client';

import { useState } from 'react';
import Header from '@/components/Header';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [adminToken, setAdminToken] = useState('');

  const runAITrading = async (aiUserId?: string) => {
    if (!adminToken) {
      alert('Please enter admin token first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ aiUserId })
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={null} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage AI investors and trading</p>
          </div>

          {/* Admin Token Input */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Token
            </label>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Enter admin secret token"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Set ADMIN_SECRET_TOKEN in your .env.local file
            </p>
          </div>

          {/* AI Trading Controls */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">AI Trading Engine</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => runAITrading()}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Running AI Trading Round...' : 'Run All AI Investors (10 AIs)'}
              </button>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { id: 'ai_boomer', name: 'The Boomer' },
                  { id: 'ai_steady', name: 'Steady Eddie' },
                  { id: 'ai_yolo', name: 'YOLO Kid' },
                  { id: 'ai_diamond', name: 'Diamond Hands' },
                  { id: 'ai_silicon', name: 'Silicon Brain' },
                  { id: 'ai_cloud', name: 'Cloud Surfer' },
                  { id: 'ai_fomo', name: 'FOMO Master' },
                  { id: 'ai_hype', name: 'Hype Train' },
                  { id: 'ai_contrarian', name: 'The Contrarian' },
                  { id: 'ai_oracle', name: 'The Oracle' }
                ].map(ai => (
                  <button
                    key={ai.id}
                    onClick={() => runAITrading(ai.id)}
                    disabled={loading}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    {ai.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          {results && (
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Trading Results</h2>
              <p className="text-sm text-gray-400 mb-6">
                Timestamp: {new Date(results.timestamp).toLocaleString()}
              </p>

              <div className="space-y-6">
                {results.results?.map((result: any) => (
                  <div 
                    key={result.aiId}
                    className={`border rounded-lg p-4 ${
                      result.success ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{result.name}</h3>
                      <span className={`text-sm font-semibold ${
                        result.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </div>

                    {result.success && (
                      <>
                        <div className="mb-3 text-sm text-gray-400">
                          <div>Cash: ${result.portfolio?.cash?.toLocaleString()}</div>
                          <div>Holdings: {result.portfolio?.holdings?.length} positions</div>
                          <div>Total Value: ${result.portfolio?.totalValue?.toLocaleString()}</div>
                        </div>

                        {result.decisions?.length > 0 ? (
                          <div className="space-y-2">
                            <div className="font-semibold text-white">Decisions:</div>
                            {result.decisions.map((decision: any, idx: number) => (
                              <div key={idx} className="bg-gray-700/50 rounded p-3">
                                <div className="text-white font-medium">
                                  Pitch #{decision.pitch_id} - {decision.shares} shares
                                </div>
                                <div className="text-sm text-gray-300 mt-1">
                                  {decision.reasoning}
                                </div>
                                {result.trades?.[idx] && (
                                  <div className={`text-xs mt-2 ${
                                    result.trades[idx].success ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    Trade: {result.trades[idx].success ? 'Executed' : 'Failed'}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">No investments made this round</div>
                        )}
                      </>
                    )}

                    {!result.success && (
                      <div className="text-red-400 text-sm">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
