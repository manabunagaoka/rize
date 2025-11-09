'use client';

import { useState, useEffect } from 'react';

interface UserData {
  userId: string;
  email: string;
  ui: {
    cash: number;
    portfolioValue: number;
    totalValue: number;
    holdingsCount: number;
    investments?: any[];
  };
  db: {
    cash: number;
    portfolioValue: number;
    totalValue: number;
    holdingsCount: number;
  };
  discrepancies: {
    cash: boolean;
    portfolioValue: boolean;
    totalValue: boolean;
    holdingsCount: boolean;
  };
  hasDiscrepancy: boolean;
}

export default function SimpleDataIntegrity() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<{ users: UserData[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simple password check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password - you can change this
    if (password === 'rize2025') {
      setIsAuthenticated(true);
      loadData();
    } else {
      setError('Incorrect password');
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/data-integrity');
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Data Integrity Dashboard
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Access Dashboard
            </button>
            <p className="text-gray-400 text-xs text-center mt-4">
              Password: rize2025
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Data Integrity Dashboard</h1>
          <p className="text-gray-400">Real-time comparison: UI Display vs Database Reality</p>
          <button
            onClick={loadData}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
          >
            Refresh Data
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-gray-400 text-sm mb-1">Total Users</div>
                <div className="text-3xl font-bold">{data.users.length}</div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-6 border border-red-500">
                <div className="text-red-400 text-sm mb-1">Issues Found</div>
                <div className="text-3xl font-bold text-red-400">
                  {data.users.filter(u => u.hasDiscrepancy).length}
                </div>
              </div>
              <div className="bg-green-900/30 rounded-lg p-6 border border-green-500">
                <div className="text-green-400 text-sm mb-1">Healthy</div>
                <div className="text-3xl font-bold text-green-400">
                  {data.users.filter(u => !u.hasDiscrepancy).length}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {data.users.map((user) => (
                <div
                  key={user.userId}
                  className={`border rounded-lg overflow-hidden ${
                    user.hasDiscrepancy
                      ? 'border-red-500 bg-red-900/10'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">{user.email}</h2>
                        <p className="text-gray-400 text-sm">User ID: {user.userId}</p>
                      </div>
                      {user.hasDiscrepancy ? (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          DISCREPANCY
                        </span>
                      ) : (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          OK
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-bold mb-3 text-blue-400">
                          UI Display (What User Sees)
                        </h3>
                        <div className="space-y-2">
                          <DataRow
                            label="Cash Balance"
                            value={user.ui.cash}
                            highlight={user.discrepancies.cash}
                          />
                          <DataRow
                            label="Portfolio Value"
                            value={user.ui.portfolioValue}
                            highlight={user.discrepancies.portfolioValue}
                          />
                          <DataRow
                            label="Total Value"
                            value={user.ui.totalValue}
                            highlight={user.discrepancies.totalValue}
                          />
                          <div className="flex justify-between">
                            <span className="text-gray-400">Holdings Count:</span>
                            <span className={`font-mono ${user.discrepancies.holdingsCount ? 'bg-red-200 text-red-900 px-2 py-1 rounded' : ''}`}>
                              {user.ui.holdingsCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold mb-3 text-green-400">
                          Database Reality (Source of Truth)
                        </h3>
                        <div className="space-y-2">
                          <DataRow
                            label="Cash Balance"
                            value={user.db.cash}
                            highlight={user.discrepancies.cash}
                          />
                          <DataRow
                            label="Portfolio Value"
                            value={user.db.portfolioValue}
                            highlight={user.discrepancies.portfolioValue}
                          />
                          <DataRow
                            label="Total Value"
                            value={user.db.totalValue}
                            highlight={user.discrepancies.totalValue}
                          />
                          <div className="flex justify-between">
                            <span className="text-gray-400">Holdings Count:</span>
                            <span className={`font-mono ${user.discrepancies.holdingsCount ? 'bg-red-200 text-red-900 px-2 py-1 rounded' : ''}`}>
                              {user.db.holdingsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {user.ui.investments && user.ui.investments.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-gray-400 hover:text-white">
                          Show Investments ({user.ui.investments.length})
                        </summary>
                        <div className="mt-2 bg-gray-900 rounded p-4">
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(user.ui.investments, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DataRow({ label, value, highlight }: { label: string; value: number; highlight: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-mono ${highlight ? 'bg-red-200 text-red-900 px-2 py-1 rounded' : ''}`}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
