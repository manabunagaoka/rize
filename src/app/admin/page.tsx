'use client';'use client';



import { useState, useEffect } from 'react';import { useState } from 'react';

import Header from '@/components/Header';

// Import types

interface DataIntegrityUser {export default function AdminPage() {

  userId: string;  const [loading, setLoading] = useState(false);

  displayName: string;  const [results, setResults] = useState<any>(null);

  email: string | null;  const [adminToken, setAdminToken] = useState('');

  isAI: boolean;

  ui: any;  const runAITrading = async (aiUserId?: string) => {

  db: any;    if (!adminToken) {

  discrepancies: any;      alert('Please enter admin token first');

  hasDiscrepancy: boolean;      return;

}    }



interface AIInvestor {    setLoading(true);

  userId: string;    try {

  email: string;      const response = await fetch('/api/admin/ai-trade', {

  nickname: string;        method: 'POST',

  emoji: string;        headers: {

  strategy: string;          'Content-Type': 'application/json',

  catchphrase: string;          'X-Admin-Token': adminToken

  status: string;        },

  cash: number;        body: JSON.stringify({ aiUserId })

  portfolioValue: number;      });

  totalValue: number;

  totalInvested: number;      const data = await response.json();

  totalGains: number;      if (response.ok) {

  roi: string;        setResults(data);

  tier: string;      } else {

  investments: any[];        alert(`Error: ${data.error}`);

  recentTransactions: any[];      }

  tradingLogs: any[];    } catch (error: any) {

  lastTradeTime: string | null;      alert(`Failed: ${error.message}`);

  tradesLast24h: number;    } finally {

}      setLoading(false);

    }

const TICKER_MAP: Record<number, string> = {  };

  1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM',

  5: 'RDDT', 6: 'WRBY', 7: 'BKNG'  return (

};    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">

      <Header user={null} />

const STRATEGIES = [      

  'MOMENTUM', 'VALUE', 'GROWTH', 'HOLD_FOREVER',       <div className="container mx-auto px-4 py-12">

  'CONTRARIAN', 'DIVIDEND', 'RISK_TAKER'        <div className="max-w-6xl mx-auto">

];          

          <div className="mb-8">

export default function UnicornAdmin() {            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>

  const [password, setPassword] = useState('');            <p className="text-gray-400">Manage AI investors and trading</p>

  const [isAuthenticated, setIsAuthenticated] = useState(false);          </div>

  const [activeTab, setActiveTab] = useState<'dashboard' | 'data-integrity' | 'ai-investors' | 'human-users'>('dashboard');

            {/* Admin Token Input */}

  // Data states          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">

  const [dataIntegrityUsers, setDataIntegrityUsers] = useState<DataIntegrityUser[]>([]);            <label className="block text-sm font-medium text-gray-300 mb-2">

  const [aiInvestors, setAIInvestors] = useState<AIInvestor[]>([]);              Admin Token

  const [selectedAI, setSelectedAI] = useState<AIInvestor | null>(null);            </label>

              <input

  const [loading, setLoading] = useState(false);              type="password"

  const [error, setError] = useState('');              value={adminToken}

  const [editMode, setEditMode] = useState(false);              onChange={(e) => setAdminToken(e.target.value)}

  const [editForm, setEditForm] = useState<any>({});              placeholder="Enter admin secret token"

              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"

  const handleLogin = (e: React.FormEvent) => {            />

    e.preventDefault();            <p className="text-xs text-gray-500 mt-2">

    if (password === 'rize2025') {              Set ADMIN_SECRET_TOKEN in your .env.local file

      setIsAuthenticated(true);            </p>

      loadAllData();          </div>

    } else {

      setError('Incorrect password');          {/* AI Trading Controls */}

    }          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">

  };            <h2 className="text-2xl font-bold text-white mb-4">AI Trading Engine</h2>

            

  const loadAllData = async () => {            <div className="space-y-4">

    loadDataIntegrity();              <button

    loadAIInvestors();                onClick={() => runAITrading()}

  };                disabled={loading}

                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"

  const loadDataIntegrity = async () => {              >

    setLoading(true);                {loading ? 'Running AI Trading Round...' : 'Run All AI Investors (10 AIs)'}

    try {              </button>

      const response = await fetch('/api/data-integrity');

      if (!response.ok) throw new Error(`API error: ${response.status}`);              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

      const data = await response.json();                {[

      setDataIntegrityUsers(data.users);                  { id: 'ai_boomer', name: 'The Boomer' },

    } catch (err: any) {                  { id: 'ai_steady', name: 'Steady Eddie' },

      console.error('Data integrity error:', err);                  { id: 'ai_yolo', name: 'YOLO Kid' },

    } finally {                  { id: 'ai_diamond', name: 'Diamond Hands' },

      setLoading(false);                  { id: 'ai_silicon', name: 'Silicon Brain' },

    }                  { id: 'ai_cloud', name: 'Cloud Surfer' },

  };                  { id: 'ai_fomo', name: 'FOMO Master' },

                  { id: 'ai_hype', name: 'Hype Train' },

  const loadAIInvestors = async () => {                  { id: 'ai_contrarian', name: 'The Contrarian' },

    setLoading(true);                  { id: 'ai_oracle', name: 'The Oracle' }

    try {                ].map(ai => (

      const response = await fetch('/api/admin/ai-investors');                  <button

      if (!response.ok) throw new Error(`API error: ${response.status}`);                    key={ai.id}

      const data = await response.json();                    onClick={() => runAITrading(ai.id)}

      setAIInvestors(data.aiInvestors);                    disabled={loading}

    } catch (err: any) {                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition disabled:opacity-50"

      console.error('AI investors error:', err);                  >

    } finally {                    {ai.name}

      setLoading(false);                  </button>

    }                ))}

  };              </div>

            </div>

  const selectAI = (ai: AIInvestor) => {          </div>

    setSelectedAI(ai);

    setEditMode(false);          {/* Results Display */}

    setEditForm({          {results && (

      ai_nickname: ai.nickname,            <div className="bg-gray-800/50 rounded-xl p-6">

      ai_emoji: ai.emoji,              <h2 className="text-2xl font-bold text-white mb-4">Trading Results</h2>

      ai_strategy: ai.strategy,              <p className="text-sm text-gray-400 mb-6">

      ai_catchphrase: ai.catchphrase,                Timestamp: {new Date(results.timestamp).toLocaleString()}

      ai_status: ai.status              </p>

    });

  };              <div className="space-y-6">

                {results.results?.map((result: any) => (

  const saveAIChanges = async () => {                  <div 

    if (!selectedAI) return;                    key={result.aiId}

    setLoading(true);                    className={`border rounded-lg p-4 ${

    try {                      result.success ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'

      const response = await fetch('/api/admin/ai-investors', {                    }`}

        method: 'PATCH',                  >

        headers: { 'Content-Type': 'application/json' },                    <div className="flex items-center justify-between mb-3">

        body: JSON.stringify({                      <h3 className="text-xl font-bold text-white">{result.name}</h3>

          userId: selectedAI.userId,                      <span className={`text-sm font-semibold ${

          updates: editForm                        result.success ? 'text-green-400' : 'text-red-400'

        })                      }`}>

      });                        {result.success ? 'SUCCESS' : 'FAILED'}

      if (!response.ok) throw new Error('Failed to update');                      </span>

      await loadAIInvestors();                    </div>

      setEditMode(false);

      alert('✅ AI Investor updated successfully!');                    {result.success && (

    } catch (err: any) {                      <>

      alert(`❌ Error: ${err.message}`);                        <div className="mb-3 text-sm text-gray-400">

    } finally {                          <div>Cash: ${result.portfolio?.cash?.toLocaleString()}</div>

      setLoading(false);                          <div>Holdings: {result.portfolio?.holdings?.length} positions</div>

    }                          <div>Total Value: ${result.portfolio?.totalValue?.toLocaleString()}</div>

  };                        </div>



  useEffect(() => {                        {result.decisions?.length > 0 ? (

    if (isAuthenticated) {                          <div className="space-y-2">

      const interval = setInterval(loadAllData, 30000);                            <div className="font-semibold text-white">Decisions:</div>

      return () => clearInterval(interval);                            {result.decisions.map((decision: any, idx: number) => (

    }                              <div key={idx} className="bg-gray-700/50 rounded p-3">

  }, [isAuthenticated]);                                <div className="text-white font-medium">

                                  Pitch #{decision.pitch_id} - {decision.shares} shares

  if (!isAuthenticated) {                                </div>

    return (                                <div className="text-sm text-gray-300 mt-1">

      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">                                  {decision.reasoning}

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">                                </div>

          <h1 className="text-3xl font-bold text-white mb-2 text-center">                                {result.trades?.[idx] && (

            🦄 Unicorn Admin                                  <div className={`text-xs mt-2 ${

          </h1>                                    result.trades[idx].success ? 'text-green-400' : 'text-red-400'

          <p className="text-gray-400 text-center mb-6">Complete platform management</p>                                  }`}>

          <form onSubmit={handleLogin} className="space-y-4">                                    Trade: {result.trades[idx].success ? 'Executed' : 'Failed'}

            <input                                  </div>

              type="password"                                )}

              value={password}                              </div>

              onChange={(e) => setPassword(e.target.value)}                            ))}

              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"                          </div>

              placeholder="Admin Password"                        ) : (

              autoFocus                          <div className="text-gray-400 italic">No investments made this round</div>

            />                        )}

            {error && <p className="text-red-400 text-sm">{error}</p>}                      </>

            <button                    )}

              type="submit"

              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"                    {!result.success && (

            >                      <div className="text-red-400 text-sm">

              Access Admin Panel                        Error: {result.error}

            </button>                      </div>

            <p className="text-gray-400 text-xs text-center">Password: rize2025</p>                    )}

          </form>                  </div>

        </div>                ))}

      </div>              </div>

    );            </div>

  }          )}



  const humanUsers = dataIntegrityUsers.filter(u => !u.isAI);        </div>

  const aiUsersData = dataIntegrityUsers.filter(u => u.isAI);      </div>

  const issuesCount = dataIntegrityUsers.filter(u => u.hasDiscrepancy).length;    </div>

  );

  return (}

    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🦄 Unicorn Admin</h1>
            <p className="text-gray-400 text-sm">Complete platform management & monitoring</p>
          </div>
          <button
            onClick={loadAllData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
          >
            Refresh All
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
              { id: 'ai-investors', label: '🤖 AI Investors' },
              { id: 'human-users', label: '👤 Human Users' }
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
                <div className="text-3xl font-bold">{dataIntegrityUsers.length}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {humanUsers.length} humans, {aiUsersData.length} AI
                </div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-6 border border-red-500">
                <div className="text-red-400 text-sm mb-1">Data Issues</div>
                <div className="text-3xl font-bold text-red-400">{issuesCount}</div>
                <div className="text-xs text-gray-500 mt-1">Discrepancies found</div>
              </div>
              <div className="bg-green-900/30 rounded-lg p-6 border border-green-500">
                <div className="text-green-400 text-sm mb-1">Active AI</div>
                <div className="text-3xl font-bold text-green-400">
                  {aiInvestors.filter(ai => ai.status === 'ACTIVE').length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Trading enabled</div>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-500">
                <div className="text-blue-400 text-sm mb-1">Platform Value</div>
                <div className="text-2xl font-bold text-blue-400">
                  ${(dataIntegrityUsers.reduce((sum, u) => sum + (u.ui.totalValue || 0), 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-gray-500 mt-1">Total capital</div>
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
                    {issuesCount > 0 ? `${issuesCount} issues to review` : 'All systems healthy'}
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
                <button
                  onClick={() => setActiveTab('human-users')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"
                >
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-bold">View Human Users</div>
                  <div className="text-sm text-gray-400">{humanUsers.length} active users</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data-integrity' && (
          <div>
            <p className="text-gray-400 mb-4">View detailed data integrity checks...</p>
            <div className="text-center text-gray-500 py-12">
              Data integrity tab - full UI will be added
            </div>
          </div>
        )}

        {activeTab === 'ai-investors' && (
          <div>
            <p className="text-gray-400 mb-4">Manage AI investor personas and strategies...</p>
            <div className="text-center text-gray-500 py-12">
              AI management tab - full UI will be added
            </div>
          </div>
        )}

        {activeTab === 'human-users' && (
          <div>
            <p className="text-gray-400 mb-4">Monitor and manage human users...</p>
            <div className="text-center text-gray-500 py-12">
              Human users tab - coming soon
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
