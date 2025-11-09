'use client';

import { useState, useEffect } from 'react';

interface AIInvestor {
  userId: string;
  email: string;
  nickname: string;
  emoji: string;
  strategy: string;
  catchphrase: string;
  status: string;
  cash: number;
  portfolioValue: number;
  totalValue: number;
  totalInvested: number;
  totalGains: number;
  roi: string;
  tier: string;
  investments: any[];
  recentTransactions: any[];
  tradingLogs: any[];
  lastTradeTime: string | null;
  tradesLast24h: number;
}

const TICKER_MAP: Record<number, string> = {
  1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM',
  5: 'RDDT', 6: 'WRBY', 7: 'BKNG'
};

const STRATEGIES = [
  'MOMENTUM', 'VALUE', 'GROWTH', 'HOLD_FOREVER', 
  'CONTRARIAN', 'DIVIDEND', 'RISK_TAKER'
];

export default function AIInvestorAdmin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [aiInvestors, setAIInvestors] = useState<AIInvestor[]>([]);
  const [selectedAI, setSelectedAI] = useState<AIInvestor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'rize2025') {
      setIsAuthenticated(true);
      loadAIInvestors();
    } else {
      setError('Incorrect password');
    }
  };

  const loadAIInvestors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/ai-investors');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setAIInvestors(data.aiInvestors);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectAI = (ai: AIInvestor) => {
    setSelectedAI(ai);
    setEditMode(false);
    setEditForm({
      ai_nickname: ai.nickname,
      ai_emoji: ai.emoji,
      ai_strategy: ai.strategy,
      ai_catchphrase: ai.catchphrase,
      ai_status: ai.status
    });
  };

  const saveChanges = async () => {
    if (!selectedAI) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai-investors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedAI.userId,
          updates: editForm
        })
      });
      if (!response.ok) throw new Error('Failed to update');
      await loadAIInvestors();
      setEditMode(false);
      alert('✅ AI Investor updated successfully!');
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualTrade = async (pitchId: number) => {
    if (!selectedAI) return;
    if (!confirm(`Trigger AI trading decision for ${selectedAI.nickname} on ${TICKER_MAP[pitchId]}?`)) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai-investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual-trade',
          userId: selectedAI.userId,
          pitchId
        })
      });
      const result = await response.json();
      alert(result.success ? '✅ Trade executed' : `❌ ${result.error}`);
      await loadAIInvestors();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(loadAIInvestors, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            🤖 AI Investor Admin
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="Password"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">🤖 AI Investor Management</h1>
            <p className="text-gray-400">Monitor and control AI trading behavior</p>
          </div>
          <button
            onClick={loadAIInvestors}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total AI Investors</div>
            <div className="text-3xl font-bold">{aiInvestors.length}</div>
          </div>
          <div className="bg-green-900/30 rounded-lg p-4 border border-green-500">
            <div className="text-green-400 text-sm">Active</div>
            <div className="text-3xl font-bold text-green-400">
              {aiInvestors.filter(ai => ai.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-500">
            <div className="text-yellow-400 text-sm">Paused</div>
            <div className="text-3xl font-bold text-yellow-400">
              {aiInvestors.filter(ai => ai.status === 'PAUSED').length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* AI List */}
          <div className="col-span-4 bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">AI Investors</h2>
            <div className="space-y-2">
              {aiInvestors.map(ai => (
                <div
                  key={ai.userId}
                  onClick={() => selectAI(ai)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedAI?.userId === ai.userId
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ai.emoji}</span>
                      <div>
                        <div className="font-bold">{ai.nickname}</div>
                        <div className="text-xs text-gray-400">{ai.strategy}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">${(ai.totalValue / 1000).toFixed(1)}K</div>
                      <div className={`text-xs ${parseFloat(ai.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {ai.roi}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Details */}
          <div className="col-span-8">
            {selectedAI ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-6xl">{selectedAI.emoji}</span>
                      <div>
                        {editMode ? (
                          <input
                            type="text"
                            value={editForm.ai_nickname}
                            onChange={(e) => setEditForm({...editForm, ai_nickname: e.target.value})}
                            className="text-3xl font-bold bg-gray-700 px-2 py-1 rounded"
                          />
                        ) : (
                          <h2 className="text-3xl font-bold">{selectedAI.nickname}</h2>
                        )}
                        {editMode ? (
                          <select
                            value={editForm.ai_strategy}
                            onChange={(e) => setEditForm({...editForm, ai_strategy: e.target.value})}
                            className="mt-1 bg-gray-700 px-2 py-1 rounded text-sm"
                          >
                            {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <p className="text-gray-400">{selectedAI.strategy}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editMode ? (
                        <>
                          <button
                            onClick={saveChanges}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditMode(false)}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {editMode ? (
                    <textarea
                      value={editForm.ai_catchphrase}
                      onChange={(e) => setEditForm({...editForm, ai_catchphrase: e.target.value})}
                      className="w-full bg-gray-700 px-3 py-2 rounded text-sm italic"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-300 italic">"{selectedAI.catchphrase}"</p>
                  )}

                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm">Cash</div>
                      <div className="text-xl font-mono">${selectedAI.cash.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Holdings</div>
                      <div className="text-xl font-mono">${selectedAI.portfolioValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Total Value</div>
                      <div className="text-xl font-mono">${selectedAI.totalValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">ROI</div>
                      <div className={`text-xl font-mono ${parseFloat(selectedAI.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedAI.roi}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Holdings */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Current Holdings ({selectedAI.investments.length})</h3>
                  {selectedAI.investments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAI.investments.map(inv => (
                        <div key={inv.pitchId} className="bg-gray-700 rounded p-3 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-blue-400">{TICKER_MAP[inv.pitchId]}</span>
                            <span className="text-gray-400 ml-2">{inv.shares.toFixed(2)} shares @ ${inv.avgPrice.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono">${inv.currentValue.toLocaleString()}</div>
                            <div className={`text-sm ${inv.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {inv.gain >= 0 ? '+' : ''}{inv.gainPercent}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No current holdings</p>
                  )}
                </div>

                {/* Trading Logs */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Recent AI Decisions</h3>
                  {selectedAI.tradingLogs.length > 0 ? (
                    <div className="space-y-3">
                      {selectedAI.tradingLogs.map((log, idx) => (
                        <div key={idx} className="bg-gray-700 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-bold ${
                              log.action === 'BUY' ? 'text-green-400' : 
                              log.action === 'SELL' ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {log.action} {TICKER_MAP[log.pitchId]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{log.reasoning}</p>
                          {log.success === false && (
                            <p className="text-xs text-red-400 mt-1">Error: {log.errorMessage}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No trading logs available</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 text-center text-gray-500">
                Select an AI investor to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
