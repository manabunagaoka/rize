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

interface AIDetail {
  user: any;
  investments: any[];
  transactions: any[];
  logs: any[];
  pitches: any[];
  lastTradeTime: string | null;
  systemInfo: any;
}

interface TestResult {
  timestamp: string;
  aiName: string;
  userId: string;
  success: boolean;
  decision?: {
    action: string;
    ticker?: string;
    shares?: number;
    reasoning: string;
  };
  execution?: {
    balanceBefore: number;
    balanceAfter: number;
    portfolioBefore: number;
    portfolioAfter: number;
    price?: number;
    cost?: number;
  };
  message: string;
  error?: string;
}

const TICKER_MAP: Record<number, string> = {
  1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM',
  5: 'RDDT', 6: 'WRBY', 7: 'BKNG'
};

export default function UnicornAdmin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data-integrity' | 'ai-investors' | 'human-users'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [aiInvestors, setAIInvestors] = useState<any[]>([]);
  const [selectedAI, setSelectedAI] = useState<string | null>(null);
  const [aiDetail, setAIDetail] = useState<AIDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [testTrading, setTestTrading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [editingPersona, setEditingPersona] = useState(false);
  const [personaText, setPersonaText] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    show: boolean;
    current: number;
    total: number;
    currentAI?: string;
    results: Array<{ ai: string; success: boolean; data?: any; error?: string }>;
  }>({ show: false, current: 0, total: 0, results: [] });
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'toggle-active' | 'delete' | 'clone' | 'batch-test' | 'activate-all' | 'deactivate-all' | null;
    aiData: any;
  }>({
    show: false,
    title: '',
    message: '',
    type: null,
    aiData: null
  });

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const savePersona = async (userId: string, newPersona: string) => {
    try {
      const res = await fetch('/api/admin/ai-update-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, persona: newPersona })
      });
      if (res.ok) {
        alert('Persona updated successfully!');
        setEditingPersona(false);
        loadAIDetail(userId);
        loadData();
      } else {
        alert('Failed to update persona');
      }
    } catch (err) {
      console.error('Error updating persona:', err);
      alert('Error updating persona');
    }
  };

  const handleToggleActive = async () => {
    if (!confirmModal.aiData) return;
    
    try {
      const res = await fetch('/api/admin/ai-toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: confirmModal.aiData.userId, 
          isActive: !confirmModal.aiData.isActive,
          adminToken: 'admin_secret_manaboodle_2025'
        })
      });
      if (res.ok) {
        loadData();
        setConfirmModal({ show: false, title: '', message: '', type: null, aiData: null });
      }
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirmModal.aiData) return;
    
    try {
      const res = await fetch('/api/admin/ai-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: confirmModal.aiData.userId,
          adminToken: 'admin_secret_manaboodle_2025'
        })
      });
      if (res.ok) {
        loadData();
        setConfirmModal({ show: false, title: '', message: '', type: null, aiData: null });
      }
    } catch (err) {
      console.error('Delete AI error:', err);
    }
  };

  const handleClone = async () => {
    if (!confirmModal.aiData) return;
    
    try {
      const res = await fetch('/api/admin/ai-clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceUserId: confirmModal.aiData.userId,
          adminToken: 'admin_secret_manaboodle_2025'
        })
      });
      if (res.ok) {
        loadData();
        setConfirmModal({ show: false, title: '', message: '', type: null, aiData: null });
      }
    } catch (err) {
      console.error('Clone AI error:', err);
    }
  };

  const handleBatchTest = async () => {
    if (!confirmModal.aiData?.activeAIs) return;
    
    const activeAIs = confirmModal.aiData.activeAIs;
    setConfirmModal({ show: false, title: '', message: '', type: null, aiData: null });
    setBatchProgress({ show: true, current: 0, total: activeAIs.length, results: [] });
    setShowResults(true); // Auto-show results panel
    
    for (let i = 0; i < activeAIs.length; i++) {
      const ai = activeAIs[i];
      setBatchProgress(prev => ({ ...prev, current: i + 1, currentAI: ai.nickname }));
      
      try {
        const res = await fetch('/api/admin/ai-trading/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: ai.userId,
            adminToken: 'admin_secret_manaboodle_2025'
          })
        });
        const data = await res.json();
        
        // Add to batch progress
        setBatchProgress(prev => ({
          ...prev,
          results: [...prev.results, { ai: ai.nickname, success: res.ok, data }]
        }));
        
        // Add to test results panel
        if (res.ok && data.decision) {
          const testResult: TestResult = {
            timestamp: new Date().toISOString(),
            aiName: ai.nickname,
            userId: ai.userId,
            success: true,
            decision: data.decision,
            execution: data.execution,
            message: data.message || 'Trade executed'
          };
          setTestResults(prev => [testResult, ...prev].slice(0, 20));
        }
      } catch (err) {
        setBatchProgress(prev => ({
          ...prev,
          results: [...prev.results, { ai: ai.nickname, success: false, error: String(err) }]
        }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setBatchProgress(prev => ({ ...prev, currentAI: undefined }));
    loadData();
  };

  const handleActivateAll = async () => {
    setConfirmModal({ show: false, title: '', message: '', type: null, aiData: null });
    for (const ai of aiInvestors) {
      if (!ai.isActive) {
        await fetch('/api/admin/ai-toggle-active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: ai.userId, 
            isActive: true,
            adminToken: 'admin_secret_manaboodle_2025'
          })
        });
      }
    }
    loadData();
  };

  const handleDeactivateAll = async () => {
    setConfirmModal({ show: false, title: '', message: '', type: null, aiData: null });
    for (const ai of aiInvestors) {
      if (ai.isActive) {
        await fetch('/api/admin/ai-toggle-active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: ai.userId, 
            isActive: false,
            adminToken: 'admin_secret_manaboodle_2025'
          })
        });
      }
    }
    loadData();
  };

  const confirmAction = () => {
    if (confirmModal.type === 'toggle-active') {
      handleToggleActive();
    } else if (confirmModal.type === 'delete') {
      handleDelete();
    } else if (confirmModal.type === 'clone') {
      handleClone();
    } else if (confirmModal.type === 'batch-test') {
      handleBatchTest();
    } else if (confirmModal.type === 'activate-all') {
      handleActivateAll();
    } else if (confirmModal.type === 'deactivate-all') {
      handleDeactivateAll();
    }
  };

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

  const loadAIDetail = async (userId: string) => {
    setSelectedAI(userId);
    setAIDetail(null);
    try {
      const res = await fetch(`/api/admin/ai-details?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAIDetail(data);
      }
    } catch (err) {
      console.error('Error loading AI detail:', err);
    }
  };

  const triggerTestTrade = async (userId: string) => {
    setTestTrading(true);
    const aiName = aiDetail?.user?.nickname || 'Unknown AI';
    
    try {
      const res = await fetch('/api/admin/ai-trading/trigger', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-test-token'
        },
        body: JSON.stringify({ userId })
      });
      
      if (res.ok) {
        const data = await res.json();
        const result = data.results?.[0];
        
        if (result) {
          const testResult: TestResult = {
            timestamp: new Date().toISOString(),
            aiName,
            userId,
            success: result.result?.success || false,
            decision: result.decision ? {
              action: result.decision.action || 'UNKNOWN',
              ticker: result.decision.ticker,
              shares: result.decision.shares,
              reasoning: result.decision.reasoning || 'No reasoning provided'
            } : undefined,
            execution: result.execution ? {
              balanceBefore: result.execution.balanceBefore || 0,
              balanceAfter: result.execution.balanceAfter || 0,
              portfolioBefore: result.execution.portfolioBefore || 0,
              portfolioAfter: result.execution.portfolioAfter || 0,
              price: result.execution.price,
              cost: result.execution.cost
            } : undefined,
            message: result.result?.message || 'No message',
            error: result.error
          };
          
          setTestResults(prev => [testResult, ...prev].slice(0, 10)); // Keep last 10
          setShowResults(true);
        }
        
        // Reload AI detail and data
        loadAIDetail(userId);
        loadData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        const testResult: TestResult = {
          timestamp: new Date().toISOString(),
          aiName,
          userId,
          success: false,
          message: 'Failed to execute test trade',
          error: errorData.error || 'Unknown error'
        };
        setTestResults(prev => [testResult, ...prev].slice(0, 10));
        setShowResults(true);
      }
    } catch (err) {
      console.error('Error triggering test trade:', err);
      const testResult: TestResult = {
        timestamp: new Date().toISOString(),
        aiName,
        userId,
        success: false,
        message: 'Failed to trigger test trade',
        error: err instanceof Error ? err.message : String(err)
      };
      setTestResults(prev => [testResult, ...prev].slice(0, 10));
      setShowResults(true);
    } finally {
      setTestTrading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && autoRefresh) {
      // Only refresh if auto-refresh is enabled, and use 5 minutes to match cache TTL
      const interval = setInterval(loadData, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, autoRefresh]);


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Unicorn Admin
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
            <h1 className="text-3xl font-bold">Unicorn Admin</h1>
            <p className="text-gray-400 text-sm">Complete platform management</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-gray-300">Auto-refresh (5min)</span>
            </label>
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-4">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'data-integrity', label: 'Data Integrity' },
              { id: 'ai-investors', label: 'AI Investors' },
              { id: 'human-users', label: 'Human Users' }
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
                  ${users.reduce((sum, u) => sum + (u.ui?.totalValue || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('data-integrity')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <div className="font-bold text-lg mb-1">Data Integrity</div>
                  <div className="text-sm text-gray-400">
                    {issuesCount > 0 ? `${issuesCount} issues found` : 'All healthy'}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('ai-investors')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <div className="font-bold text-lg mb-1">AI Investors</div>
                  <div className="text-sm text-gray-400">{aiInvestors.length} AI traders</div>
                </button>
                <button
                  onClick={() => setActiveTab('human-users')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <div className="font-bold text-lg mb-1">Human Users</div>
                  <div className="text-sm text-gray-400">{humanUsers.length} investors</div>
                </button>
                <div className="bg-gray-700/50 p-4 rounded-lg opacity-50">
                  <div className="font-bold text-lg mb-1">Competitions</div>
                  <div className="text-sm text-gray-400">Coming soon</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 text-2xl">ℹ️</div>
                <div>
                  <div className="font-bold text-blue-400 mb-1">API Usage Notice</div>
                  <div className="text-sm text-gray-300">
                    All prices are cached for 5 minutes to conserve Finnhub API quota. 
                    Auto-refresh is disabled by default. Enable it only when actively monitoring markets.
                  </div>
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
                      {user.isAI ? 'AI Investor' : 'Human Investor'} {user.email && `• ${user.email}`}
                    </p>
                  </div>
                  {user.hasDiscrepancy ? (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">ISSUE</span>
                  ) : (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">OK</span>
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
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Investors ({aiInvestors.length})</h2>
              <div className="text-sm text-gray-400">Click any AI to see details and test trades</div>
            </div>

            {/* 2-Column Layout: Main Content + Side Panel */}
            <div className="grid grid-cols-12 gap-4">
              {/* Main Content - Left Side (8 columns) */}
              <div className="col-span-8 space-y-4">{/* Batch Operations */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-bold mb-3 text-blue-400">Batch Operations</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    const activeAIs = aiInvestors.filter(ai => ai.isActive);
                    if (activeAIs.length === 0) {
                      setConfirmModal({
                        show: true,
                        title: 'No Active AIs',
                        message: 'There are no active AIs to test. Please activate at least one AI first.',
                        type: null,
                        aiData: null
                      });
                      return;
                    }
                    
                    setConfirmModal({
                      show: true,
                      title: 'Test All Active AIs',
                      message: `Run test trades for all ${activeAIs.length} active AIs?\n\nThis will execute sequentially and may take a few minutes.`,
                      type: 'batch-test',
                      aiData: { activeAIs }
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  🚀 Test All Active AIs ({aiInvestors.filter(ai => ai.isActive).length})
                </button>
                
                <button
                  onClick={() => {
                    setConfirmModal({
                      show: true,
                      title: 'Activate All AIs',
                      message: `Activate ALL ${aiInvestors.length} AI investors?\n\nAll AIs will participate in auto-trading.`,
                      type: 'activate-all',
                      aiData: null
                    });
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ✓ Activate All
                </button>
                
                <button
                  onClick={() => {
                    setConfirmModal({
                      show: true,
                      title: 'Deactivate All AIs',
                      message: `Deactivate ALL ${aiInvestors.length} AI investors?\n\nAll AIs will be paused and skip auto-trading.`,
                      type: 'deactivate-all',
                      aiData: null
                    });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ○ Deactivate All
                </button>
                
                <button
                  onClick={() => {
                    const csvData = aiInvestors.map(ai => ({
                      Nickname: ai.nickname,
                      Strategy: ai.strategy,
                      Status: ai.isActive ? 'Active' : 'Inactive',
                      Cash: ai.cash,
                      Total_Value: ai.totalValue,
                      ROI: ai.roi,
                      Total_Trades: ai.totalTrades || 0,
                      Win_Rate: ai.winRate || 0,
                      Last_Trade: ai.lastTradeTime || 'Never'
                    }));
                    const csv = [
                      Object.keys(csvData[0]).join(','),
                      ...csvData.map(row => Object.values(row).join(','))
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ai-investors-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  📊 Export All Stats
                </button>
              </div>
              
              {/* Batch Progress Indicator */}
              {batchProgress.show && (
                <div className="mt-4 bg-gray-900 rounded p-4 border border-blue-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">
                      {batchProgress.currentAI ? `Testing ${batchProgress.currentAI}...` : 'Complete!'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {batchProgress.current}/{batchProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
                    {batchProgress.results.map((result, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span>{result.success ? '✓' : '✗'}</span>
                        <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                          {result.ai}
                        </span>
                        {result.success && result.data?.decision && (
                          <span className="text-gray-400">
                            {result.data.decision.action} {result.data.decision.ticker || ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {!batchProgress.currentAI && (
                    <button
                      onClick={() => setBatchProgress({ show: false, current: 0, total: 0, results: [] })}
                      className="mt-3 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm w-full"
                    >
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">{aiInvestors.map(ai => (
                <div
                  key={ai.userId}
                  className="bg-gray-800 rounded-lg p-4 relative"
                >
                  {/* Active/Inactive Badge */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal({
                          show: true,
                          title: ai.isActive ? 'Deactivate AI' : 'Activate AI',
                          message: `Are you sure you want to ${ai.isActive ? 'deactivate' : 'activate'} ${ai.nickname}?\n\n${ai.isActive ? 'Inactive AIs will be skipped during auto-trading.' : 'AI will resume trading on schedule.'}`,
                          type: 'toggle-active',
                          aiData: { userId: ai.userId, isActive: ai.isActive, nickname: ai.nickname }
                        });
                      }}
                      className={`text-sm px-3 py-1.5 rounded font-medium transition-all ${
                        ai.isActive !== false 
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/50' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                      title={ai.isActive !== false ? 'Active - Click to pause' : 'Inactive - Click to activate'}
                    >
                      {ai.isActive !== false ? '● Active' : '○ Inactive'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal({
                          show: true,
                          title: 'Clone AI Investor',
                          message: `Create a copy of ${ai.nickname}?\n\nThe clone will have:\n- Same strategy and persona\n- Fresh $1M balance\n- Empty trading history\n- Name: "${ai.nickname} 2"`,
                          type: 'clone',
                          aiData: { userId: ai.userId, nickname: ai.nickname, strategy: ai.strategy, emoji: ai.emoji, catchphrase: ai.catchphrase, persona: ai.persona }
                        });
                      }}
                      className="text-sm px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all shadow-lg shadow-purple-900/50"
                      title="Clone this AI"
                    >
                      👥
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal({
                          show: true,
                          title: 'Delete AI Investor',
                          message: `⚠️ DELETE ${ai.nickname} PERMANENTLY?\n\nThis will remove:\n- AI investor profile\n- All holdings\n- All transaction history\n- All trading logs\n\nThis action CANNOT be undone!`,
                          type: 'delete',
                          aiData: { userId: ai.userId, nickname: ai.nickname }
                        });
                      }}
                      className="text-sm px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-lg shadow-red-900/50"
                      title="Delete permanently"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Clickable card content */}
                  <button
                    onClick={() => loadAIDetail(ai.userId)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{ai.emoji}</span>
                      <div>
                        <div className="font-bold text-lg">{ai.nickname}</div>
                        <div className="text-sm text-gray-400">{ai.strategy}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 italic mb-3">&quot;{ai.catchphrase}&quot;</p>
                    
                    {/* Financial Stats - Excel Style */}
                    <div className="bg-gray-900/50 rounded p-3 mb-3 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Cash:</span>
                          <span className="text-white">${ai.cash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Portfolio:</span>
                          <span className="text-white">${(ai.portfolioValue - ai.cash).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white font-bold">${ai.totalValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">ROI:</span>
                          <span className={`font-bold ${(typeof ai.roi === 'number' ? ai.roi : parseFloat(ai.roi || '0')) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {typeof ai.roi === 'number' ? ai.roi.toFixed(2) : ai.roi || '0.00'}%
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-700 mt-2 pt-2 grid grid-cols-3 gap-x-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trades:</span>
                          <span className="text-white">{ai.totalTrades || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate:</span>
                          <span className="text-blue-400">{ai.winRate || '0.0'}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last:</span>
                          <span className="text-white">
                            {ai.lastTradeTime ? new Date(ai.lastTradeTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Holdings - All Stocks */}
                    {ai.investments?.length > 0 && (
                      <div className="bg-gray-900/30 rounded p-2">
                        <div className="text-xs text-gray-400 mb-2 font-semibold">HOLDINGS ({ai.investments.length})</div>
                        <div className="space-y-1">
                          {ai.investments.map((inv: any) => (
                            <div key={inv.pitchId} className="flex justify-between items-center text-xs font-mono">
                              <span className="text-blue-400 font-bold">{TICKER_MAP[inv.pitchId]}</span>
                              <span className="text-gray-300">{inv.shares.toFixed(0)} @ ${(inv.currentValue / inv.shares).toFixed(2)}</span>
                              <span className={`font-semibold ${inv.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {inv.gain >= 0 ? '+' : ''}{inv.gainPercent}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!ai.investments?.length && (
                      <div className="bg-gray-900/30 rounded p-2 text-center text-xs text-gray-500">
                        No holdings
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
              </div>

              {/* Side Panel - Test Results (4 columns) */}
              <div className="col-span-4">
                {testResults.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4 sticky top-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-lg">Test Results</h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setShowResults(!showResults)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                        >
                          {showResults ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => setTestResults([])}
                          className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {showResults && (
                      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {testResults.map((result, idx) => (
                          <div key={idx} className="bg-gray-900 p-3 rounded text-xs border-l-4" 
                               style={{borderColor: result.success ? '#10b981' : '#ef4444'}}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-bold">
                                  {result.success ? '✅' : '❌'} {result.aiName}
                                </div>
                                <div className="text-gray-500 text-[10px]">
                                  {formatTimestamp(result.timestamp)}
                                </div>
                              </div>
                            </div>

                            {result.decision && (
                              <div className="mb-2 bg-gray-800 p-2 rounded">
                                <div className="font-semibold text-blue-400">
                                  {result.decision.action} {result.decision.ticker} 
                                  {result.decision.shares && ` (${Math.floor(result.decision.shares)})`}
                                </div>
                                <div className="text-gray-400 italic mt-1 text-[10px]">
                                  {result.decision.reasoning?.substring(0, 80)}...
                                </div>
                              </div>
                            )}

                            {result.execution && (
                              <div className="text-[10px] space-y-1 font-mono">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Cash:</span>
                                  <span>${Math.floor(result.execution.balanceBefore).toLocaleString()} → ${Math.floor(result.execution.balanceAfter).toLocaleString()}</span>
                                </div>
                                {result.execution.cost && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Cost:</span>
                                    <span className="text-red-400">-${Math.floor(result.execution.cost).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {result.error && (
                              <div className="mt-2 text-red-400 text-[10px]">
                                {result.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!showResults && (
                      <div className="text-center text-gray-500 text-sm py-4">
                        {testResults.length} result{testResults.length !== 1 ? 's' : ''} hidden
                      </div>
                    )}
                  </div>
                )}
                {testResults.length === 0 && (
                  <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-500 text-sm">
                    No test results yet.<br/>
                    <span className="text-xs">Click &ldquo;Test&rdquo; on any AI card to run a trade simulation</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'human-users' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Human Users ({humanUsers.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {humanUsers.map(user => (
                <div key={user.userId} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg">{user.displayName}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Total Value</div>
                      <div className="font-mono text-xl">${user.ui?.totalValue?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-400">Cash</div>
                      <div className="font-mono">${(user.ui?.cash || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Portfolio</div>
                      <div className="font-mono">${(user.ui?.portfolioValue || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Holdings</div>
                      <div className="font-mono">{user.ui?.investments?.length || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">ROI</div>
                      <div className={`font-mono ${user.ui?.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {user.ui?.roi?.toFixed(2) || '0.00'}%
                      </div>
                    </div>
                  </div>
                  {user.ui?.investments?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {user.ui.investments.map((inv: any) => (
                          <span key={inv.pitchId} className="text-xs bg-blue-600 px-2 py-1 rounded">
                            {inv.ticker}: {inv.shares.toFixed(2)} @ ${inv.currentPrice.toFixed(2)}
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

      {selectedAI && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedAI(null)}>
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Investor Deep Inspection</h2>
              <button onClick={() => setSelectedAI(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="p-6">
              {!aiDetail ? (
                <div className="text-center py-12 text-gray-400">Loading AI details...</div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl">{aiDetail.user?.emoji || '🤖'}</span>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold">{aiDetail.user?.nickname || 'AI Investor'}</h3>
                        <p className="text-gray-400">{aiDetail.user?.strategy || 'N/A'}</p>
                        <p className="text-sm italic text-gray-500">&quot;{aiDetail.user?.catchphrase || ''}&quot;</p>
                      </div>
                    </div>

                    {/* Editable Persona Section */}
                    <div className="mt-4 mb-4 border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-lg text-gray-300">AI Persona / Trading Guidelines</h4>
                        {!editingPersona && (
                          <button 
                            onClick={() => {
                              setEditingPersona(true);
                              setPersonaText(aiDetail.user?.persona || aiDetail.user?.catchphrase || '');
                            }}
                            className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors"
                          >
                            ✏️ Edit Persona
                          </button>
                        )}
                      </div>
                      {editingPersona ? (
                        <div className="space-y-3">
                          <div className="text-xs text-gray-400 mb-2">
                            Define this AI&apos;s personality, trading style, risk tolerance, decision-making approach, and any specific rules or guidelines.
                          </div>
                          <textarea
                            value={personaText}
                            onChange={(e) => setPersonaText(e.target.value)}
                            className="w-full bg-gray-900 text-white p-4 rounded-lg border-2 border-gray-600 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed"
                            rows={15}
                            placeholder="Example:&#10;&#10;I'm a tech-focused investor who believes in disruption. I look for companies with innovative products and strong market potential. My strategy:&#10;&#10;• Risk Tolerance: Moderate-High&#10;• Focus: Technology sector, especially cloud and AI&#10;• Buy Signal: Strong revenue growth + positive sentiment&#10;• Sell Signal: Declining market share or negative news&#10;• Hold: Maintain positions in winners&#10;&#10;I trade with conviction but always consider fundamentals..."
                          />
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => setEditingPersona(false)}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => savePersona(selectedAI!, personaText)}
                              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-green-900/50"
                            >
                              💾 Save Persona
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                          <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                            {aiDetail.user?.persona || aiDetail.user?.catchphrase || 'No persona defined'}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Cash</div>
                        <div className="font-mono text-lg">${(aiDetail.user?.cash || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Portfolio</div>
                        <div className="font-mono text-lg">${(aiDetail.user?.portfolioValue || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Total Value</div>
                        <div className="font-mono text-lg">${(aiDetail.user?.totalValue || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">ROI</div>
                        <div className={`font-mono text-lg ${(aiDetail.user?.roi || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(aiDetail.user?.roi || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Last Trade Time (EST)</h4>
                    <p className="text-gray-400">{formatTimestamp(aiDetail.lastTradeTime)}</p>
                  </div>

                  {aiDetail.systemInfo && (
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h4 className="font-bold mb-2">AI Trading Schedule</h4>
                      <p className="text-sm text-gray-400">{aiDetail.systemInfo.schedule}</p>
                      <p className="text-xs text-gray-500 mt-1">{aiDetail.systemInfo.description}</p>
                    </div>
                  )}

                  <button
                    onClick={() => triggerTestTrade(selectedAI)}
                    disabled={testTrading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
                  >
                    {testTrading ? 'Running Test Trade...' : 'Test Trade Now (Manual Trigger)'}
                  </button>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-bold mb-3">Current Holdings ({aiDetail.investments?.length || 0})</h4>
                    {!aiDetail.investments || aiDetail.investments.length === 0 ? (
                      <p className="text-gray-400 text-sm">No current holdings</p>
                    ) : (
                      <div className="space-y-2">
                        {aiDetail.investments.map((inv: any) => (
                          <div key={inv.pitchId} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                            <div>
                              <div className="font-bold">{TICKER_MAP[inv.pitchId] || 'Unknown'}</div>
                              <div className="text-xs text-gray-400">
                                {(inv.shares || 0).toFixed(2)} shares @ ${(inv.avgPrice || 0).toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono">${(inv.currentValue || 0).toFixed(0)}</div>
                              <div className={`text-xs ${(inv.gain || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(inv.gain || 0) >= 0 ? '+' : ''}{(inv.gain || 0).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-bold mb-3">Recent Transactions ({aiDetail.transactions?.length || 0})</h4>
                    {!aiDetail.transactions || aiDetail.transactions.length === 0 ? (
                      <p className="text-gray-400 text-sm">No transactions yet</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {aiDetail.transactions.map((tx: any) => (
                          <div key={tx.id} className="bg-gray-800 p-2 rounded text-sm">
                            <div className="flex justify-between items-center">
                              <span className={`font-bold ${tx.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type}
                              </span>
                              <span className="text-gray-400">{new Date(tx.created_at).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-300 mt-1">
                              {TICKER_MAP[tx.pitch_id] || 'Unknown'}: {(tx.shares || 0).toFixed(2)} @ ${(tx.price_per_share || 0).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-bold mb-3">Pitches AI Analyzes ({aiDetail.pitches?.length || 0})</h4>
                    {!aiDetail.pitches || aiDetail.pitches.length === 0 ? (
                      <p className="text-gray-400 text-sm">No pitches available</p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {aiDetail.pitches.map((pitch: any) => (
                          <div key={pitch.pitch_id} className="bg-gray-800 p-3 rounded">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-bold text-blue-400">{pitch.ticker || 'N/A'}</span>
                                <span className="text-gray-400 ml-2">{pitch.company_name || 'Unknown'}</span>
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-mono">${(pitch.current_price || 0).toFixed(2)}</div>
                                <div className={`text-xs ${(pitch.price_change_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {(pitch.price_change_24h || 0) >= 0 ? '+' : ''}{(pitch.price_change_24h || 0).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mb-1">{pitch.elevator_pitch || 'No pitch available'}</p>
                            <p className="text-xs text-gray-500 italic">{pitch.fun_fact || ''}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">{confirmModal.title}</h3>
              <p className="text-gray-300 whitespace-pre-line mb-6">{confirmModal.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal({ show: false, title: '', message: '', type: null, aiData: null })}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    confirmModal.type === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : confirmModal.type === 'clone'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
