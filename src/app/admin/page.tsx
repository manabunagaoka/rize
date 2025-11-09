'use client';

import { useState, useEffect } from 'react';

interface User {
  userId: string;
  displayName: string;
  email: string | null;
  isAI: boolean;
  ui: any;
  db: any;
  discrepancies: any;
  hasDiscrepancy: boolean;
}

const TICKER_MAP: Record<number, string> = {
  1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM',
  5: 'RDDT', 6: 'WRBY', 7: 'BKNG'
};

export default function UnicornAdmin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data-integrity' | 'ai-investors'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [aiInvestors, setAIInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'rize2025') {
      setIsAuthenticated(true);
      loadData();
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [integrityRes, aiRes] = await Promise.all([
        fetch('/api/data-integrity'),
        fetch('/api/admin/ai-investors')
      ]);
      
      if (integrityRes.ok) {
        const data = await integrityRes.json();
        setUsers(data.users || []);
      }
      
      if (aiRes.ok) {
        const data = await aiRes.json();
        setAIInvestors(data.aiInvestors || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
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
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            🦄 Unicorn Admin
          </h1>
          <p className="text-gray-400 text-center mb-6">Complete platform management</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="Admin Password"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Access Admin Panel
            </button>
            <p className="text-gray-400 text-xs text-center">Password: rize2025</p>
          </form>
        </div>
      </div>
    );
  }

  const humanUsers = users.filter(u => !u.isAI);
  const issuesCount = users.filter(u => u.hasDiscrepancy).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🦄 Unicorn Admin</h1>
            <p className="text-gray-400 text-sm">Complete platform management</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-4">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'data-integrity', label: '🔍 Data Integrity' },
              { id: 'ai-investors', label: '🤖 AI Investors' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-gray-400 text-sm mb-1">Total Users</div>
                <div className="text-3xl font-bold">{users.length}</div>
                <div className="text-xs text-gray-500 mt-1">{humanUsers.length} humans, {users.length - humanUsers.length} AI</div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-6 border border-red-500">
                <div className="text-red-400 text-sm mb-1">Data Issues</div>
                <div className="text-3xl font-bold text-red-400">{issuesCount}</div>
              </div>
              <div className="bg-green-900/30 rounded-lg p-6 border border-green-500">
                <div className="text-green-400 text-sm mb-1">Active AI</div>
                <div className="text-3xl font-bold text-green-400">
                  {aiInvestors.filter(ai => ai.status === 'ACTIVE').length}
                </div>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-500">
                <div className="text-blue-400 text-sm mb-1">Platform Value</div>
                <div className="text-2xl font-bold text-blue-400">
                  ${(users.reduce((sum, u) => sum + (u.ui?.totalValue || 0), 0) / 1000).toFixed(0)}K
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('data-integrity')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-bold">Check Data Integrity</div>
                  <div className="text-sm text-gray-400">
                    {issuesCount > 0 ? `${issuesCount} issues found` : 'All healthy'}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('ai-investors')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="font-bold">Manage AI Investors</div>
                  <div className="text-sm text-gray-400">{aiInvestors.length} AI traders</div>
                </button>
                <div className="bg-gray-700 p-4 rounded-lg opacity-50">
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-bold">Human Users</div>
                  <div className="text-sm text-gray-400">Coming soon</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data-integrity' && (
          <div className="space-y-6">
            {users.map(user => (
              <div
                key={user.userId}
                className={`border rounded-lg p-6 ${
                  user.hasDiscrepancy ? 'border-red-500 bg-red-900/10' : 'border-gray-700 bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{user.displayName}</h2>
                    <p className="text-gray-400 text-sm">
                      {user.isAI ? '🤖 AI Investor' : '👤 Human Investor'} {user.email && `• ${user.email}`}
                    </p>
                  </div>
                  {user.hasDiscrepancy && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">ISSUE</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-blue-400">UI Display</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cash:</span>
                        <span className="font-mono">${user.ui?.cash?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Portfolio:</span>
                        <span className="font-mono">${user.ui?.portfolioValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total:</span>
                        <span className="font-mono">${user.ui?.totalValue?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-green-400">Database</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cash:</span>
                        <span className="font-mono">${user.db?.cash?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Portfolio:</span>
                        <span className="font-mono">${user.db?.portfolioValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total:</span>
                        <span className="font-mono">${user.db?.totalValue?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {user.ui?.investments?.length > 0 && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-bold text-gray-300 mb-2">Holdings</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {user.ui.investments.map((inv: any, idx: number) => (
                        <div key={idx} className="bg-gray-900/50 rounded p-2 text-sm">
                          <span className="font-bold text-blue-400">{inv.ticker}</span>
                          <span className="text-gray-400 ml-2">{inv.shares?.toFixed(2)} @ ${inv.currentPrice?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ai-investors' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">AI Investors ({aiInvestors.length})</h2>
            <div className="grid grid-cols-2 gap-4">
              {aiInvestors.map(ai => (
                <div key={ai.userId} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{ai.emoji}</span>
                    <div>
                      <div className="font-bold text-lg">{ai.nickname}</div>
                      <div className="text-sm text-gray-400">{ai.strategy}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 italic mb-3">&quot;{ai.catchphrase}&quot;</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-400">Cash</div>
                      <div className="font-mono">${(ai.cash / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total</div>
                      <div className="font-mono">${(ai.totalValue / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <div className="text-gray-400">ROI</div>
                      <div className={`font-mono ${parseFloat(ai.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {ai.roi}%
                      </div>
                    </div>
                  </div>
                  {ai.investments?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Holdings: {ai.investments.length}</div>
                      <div className="flex flex-wrap gap-1">
                        {ai.investments.map((inv: any) => (
                          <span key={inv.pitchId} className="text-xs bg-blue-600 px-2 py-1 rounded">
                            {TICKER_MAP[inv.pitchId]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
