'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Database, Monitor } from 'lucide-react';

interface UserData {
  user_id: string;
  username: string;
  // UI Data (from APIs)
  ui: {
    cash: number;
    holdings_value: number;
    total: number;
    holdings_count: number;
    timestamp: string;
  };
  // DB Data (raw)
  db: {
    cash: number;
    total_invested: number;
    holdings_count: number;
    raw_investments: any[];
    updated_at: string;
  };
  // Discrepancies
  discrepancies: {
    cash_diff: number;
    holdings_count_diff: number;
    has_issues: boolean;
  };
}

export default function DebugPage() {
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data-integrity', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch debug data');
      }

      const result = await response.json();
      setData(result.users || []);
      setError(null);
    } catch (err) {
      console.error('Debug fetch error:', err);
      setError('Failed to load debug data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffMin < 1) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-gray-400">Loading debug data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Simple Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Admin Debug Panel</h1>
              <p className="text-xs text-gray-400">Data Integrity Monitor</p>
            </div>
          </div>
          <a
            href="/manage"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to App
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Data Integrity Dashboard</h1>
            <p className="text-gray-400">Compare UI display vs. database reality</p>
          </div>
          <button
            onClick={fetchDebugData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Total Users</div>
            <div className="text-3xl font-bold text-white">{data.length}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Users with Issues</div>
            <div className="text-3xl font-bold text-red-400">
              {data.filter(u => u.discrepancies.has_issues).length}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Healthy Users</div>
            <div className="text-3xl font-bold text-green-400">
              {data.filter(u => !u.discrepancies.has_issues).length}
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-4">
          {data.map((user) => (
            <div
              key={user.user_id}
              className={`bg-gray-800 rounded-lg p-6 border-2 ${
                user.discrepancies.has_issues ? 'border-red-500' : 'border-green-500/20'
              }`}
            >
              {/* User Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {user.discrepancies.has_issues ? (
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{user.username}</h3>
                    <p className="text-sm text-gray-400">{user.user_id}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <div>UI: {formatTimestamp(user.ui.timestamp)}</div>
                  <div>DB: {formatTimestamp(user.db.updated_at)}</div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* UI Data */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4 text-blue-400">
                    <Monitor className="w-5 h-5" />
                    <h4 className="font-semibold">UI Display (APIs)</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cash:</span>
                      <span className="text-white font-mono">{formatCurrency(user.ui.cash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Holdings Value:</span>
                      <span className="text-white font-mono">{formatCurrency(user.ui.holdings_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Holdings Count:</span>
                      <span className="text-white font-mono">{user.ui.holdings_count}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                      <span className="text-gray-300 font-semibold">Total:</span>
                      <span className="text-white font-mono font-bold">{formatCurrency(user.ui.total)}</span>
                    </div>
                  </div>
                </div>

                {/* DB Data */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4 text-purple-400">
                    <Database className="w-5 h-5" />
                    <h4 className="font-semibold">Database Reality</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cash (available_tokens):</span>
                      <span className={`font-mono ${
                        user.discrepancies.cash_diff !== 0 ? 'text-red-400 font-bold' : 'text-white'
                      }`}>
                        {formatCurrency(user.db.cash)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Invested:</span>
                      <span className="text-white font-mono">{formatCurrency(user.db.total_invested)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Holdings Count (DB):</span>
                      <span className={`font-mono ${
                        user.discrepancies.holdings_count_diff !== 0 ? 'text-red-400 font-bold' : 'text-white'
                      }`}>
                        {user.db.holdings_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discrepancies */}
              {user.discrepancies.has_issues && (
                <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                  <h5 className="font-semibold text-red-400 mb-2">⚠️ Discrepancies Found:</h5>
                  <div className="space-y-1 text-sm">
                    {user.discrepancies.cash_diff !== 0 && (
                      <div className="text-red-300">
                        • Cash mismatch: {formatCurrency(Math.abs(user.discrepancies.cash_diff))} difference
                      </div>
                    )}
                    {user.discrepancies.holdings_count_diff !== 0 && (
                      <div className="text-red-300">
                        • Holdings count mismatch: {Math.abs(user.discrepancies.holdings_count_diff)} position(s) difference
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw Investment Data (Expandable) */}
              {user.db.raw_investments.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-400 hover:text-white text-sm">
                    View Raw Investment Data ({user.db.raw_investments.length} positions)
                  </summary>
                  <div className="mt-2 bg-gray-900/50 rounded p-3 text-xs overflow-x-auto">
                    <pre className="text-gray-300">
                      {JSON.stringify(user.db.raw_investments, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No user data available
          </div>
        )}
      </div>
    </div>
  );
}
