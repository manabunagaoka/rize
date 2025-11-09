'use client';'use client';'use client';



import { useState, useEffect } from 'react';



interface DataIntegrityUser {import { useState, useEffect } from 'react';import { useState } from 'react';

  userId: string;

  displayName: string;import Header from '@/components/Header';

  email: string | null;

  isAI: boolean;// Import types

  ui: any;

  db: any;interface DataIntegrityUser {export default function AdminPage() {

  discrepancies: any;

  hasDiscrepancy: boolean;  userId: string;  const [loading, setLoading] = useState(false);

}

  displayName: string;  const [results, setResults] = useState<any>(null);

interface AIInvestor {

  userId: string;  email: string | null;  const [adminToken, setAdminToken] = useState('');

  nickname: string;

  emoji: string;  isAI: boolean;

  strategy: string;

  status: string;  ui: any;  const runAITrading = async (aiUserId?: string) => {

  totalValue: number;

  roi: string;  db: any;    if (!adminToken) {

}

  discrepancies: any;      alert('Please enter admin token first');

export default function UnicornAdmin() {

  const [password, setPassword] = useState('');  hasDiscrepancy: boolean;      return;

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'data-integrity' | 'ai-investors'>('dashboard');}    }

  

  const [dataIntegrityUsers, setDataIntegrityUsers] = useState<DataIntegrityUser[]>([]);

  const [aiInvestors, setAIInvestors] = useState<AIInvestor[]>([]);

  interface AIInvestor {    setLoading(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');  userId: string;    try {



  const handleLogin = (e: React.FormEvent) => {  email: string;      const response = await fetch('/api/admin/ai-trade', {

    e.preventDefault();

    if (password === 'rize2025') {  nickname: string;        method: 'POST',

      setIsAuthenticated(true);

      loadAllData();  emoji: string;        headers: {

    } else {

      setError('Incorrect password');  strategy: string;          'Content-Type': 'application/json',

    }

  };  catchphrase: string;          'X-Admin-Token': adminToken



  const loadAllData = async () => {  status: string;        },

    loadDataIntegrity();

    loadAIInvestors();  cash: number;        body: JSON.stringify({ aiUserId })

  };

  portfolioValue: number;      });

  const loadDataIntegrity = async () => {

    try {  totalValue: number;

      const response = await fetch('/api/data-integrity');

      if (response.ok) {  totalInvested: number;      const data = await response.json();

        const data = await response.json();

        setDataIntegrityUsers(data.users || []);  totalGains: number;      if (response.ok) {

      }

    } catch (err) {  roi: string;        setResults(data);

      console.error('Data integrity error:', err);

    }  tier: string;      } else {

  };

  investments: any[];        alert(`Error: ${data.error}`);

  const loadAIInvestors = async () => {

    try {  recentTransactions: any[];      }

      const response = await fetch('/api/admin/ai-investors');

      if (response.ok) {  tradingLogs: any[];    } catch (error: any) {

        const data = await response.json();

        setAIInvestors(data.aiInvestors || []);  lastTradeTime: string | null;      alert(`Failed: ${error.message}`);

      }

    } catch (err) {  tradesLast24h: number;    } finally {

      console.error('AI investors error:', err);

    }}      setLoading(false);

  };

    }

  useEffect(() => {

    if (isAuthenticated) {const TICKER_MAP: Record<number, string> = {  };

      const interval = setInterval(loadAllData, 30000);

      return () => clearInterval(interval);  1: 'META', 2: 'MSFT', 3: 'DBX', 4: 'AKAM',

    }

  }, [isAuthenticated]);  5: 'RDDT', 6: 'WRBY', 7: 'BKNG'  return (



  if (!isAuthenticated) {};    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">

    return (

      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">      <Header user={null} />

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">

          <h1 className="text-3xl font-bold text-white mb-2 text-center">const STRATEGIES = [      

            🦄 Unicorn Admin

          </h1>  'MOMENTUM', 'VALUE', 'GROWTH', 'HOLD_FOREVER',       <div className="container mx-auto px-4 py-12">

          <p className="text-gray-400 text-center mb-6">Complete platform management</p>

          <form onSubmit={handleLogin} className="space-y-4">  'CONTRARIAN', 'DIVIDEND', 'RISK_TAKER'        <div className="max-w-6xl mx-auto">

            <input

              type="password"];          

              value={password}

              onChange={(e) => setPassword(e.target.value)}          <div className="mb-8">

              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"

              placeholder="Admin Password"export default function UnicornAdmin() {            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>

              autoFocus

            />  const [password, setPassword] = useState('');            <p className="text-gray-400">Manage AI investors and trading</p>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button  const [isAuthenticated, setIsAuthenticated] = useState(false);          </div>

              type="submit"

              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"  const [activeTab, setActiveTab] = useState<'dashboard' | 'data-integrity' | 'ai-investors' | 'human-users'>('dashboard');

            >

              Access Admin Panel            {/* Admin Token Input */}

            </button>

            <p className="text-gray-400 text-xs text-center">Password: rize2025</p>  // Data states          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">

          </form>

        </div>  const [dataIntegrityUsers, setDataIntegrityUsers] = useState<DataIntegrityUser[]>([]);            <label className="block text-sm font-medium text-gray-300 mb-2">

      </div>

    );  const [aiInvestors, setAIInvestors] = useState<AIInvestor[]>([]);              Admin Token

  }

  const [selectedAI, setSelectedAI] = useState<AIInvestor | null>(null);            </label>

  const humanUsers = dataIntegrityUsers.filter(u => !u.isAI);

  const aiUsersData = dataIntegrityUsers.filter(u => u.isAI);              <input

  const issuesCount = dataIntegrityUsers.filter(u => u.hasDiscrepancy).length;

  const [loading, setLoading] = useState(false);              type="password"

  return (

    <div className="min-h-screen bg-gray-900 text-white">  const [error, setError] = useState('');              value={adminToken}

      {/* Header */}

      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">  const [editMode, setEditMode] = useState(false);              onChange={(e) => setAdminToken(e.target.value)}

        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <div>  const [editForm, setEditForm] = useState<any>({});              placeholder="Enter admin secret token"

            <h1 className="text-3xl font-bold">🦄 Unicorn Admin</h1>

            <p className="text-gray-400 text-sm">Complete platform management & monitoring</p>              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"

          </div>

          <button  const handleLogin = (e: React.FormEvent) => {            />

            onClick={loadAllData}

            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"    e.preventDefault();            <p className="text-xs text-gray-500 mt-2">

          >

            Refresh All    if (password === 'rize2025') {              Set ADMIN_SECRET_TOKEN in your .env.local file

          </button>

        </div>      setIsAuthenticated(true);            </p>

      </div>

      loadAllData();          </div>

      {/* Tabs */}

      <div className="bg-gray-800 border-b border-gray-700">    } else {

        <div className="max-w-7xl mx-auto px-6">

          <div className="flex gap-4">      setError('Incorrect password');          {/* AI Trading Controls */}

            {[

              { id: 'dashboard', label: '📊 Dashboard' },    }          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">

              { id: 'data-integrity', label: '🔍 Data Integrity' },

              { id: 'ai-investors', label: '🤖 AI Investors' }  };            <h2 className="text-2xl font-bold text-white mb-4">AI Trading Engine</h2>

            ].map(tab => (

              <button            

                key={tab.id}

                onClick={() => setActiveTab(tab.id as any)}  const loadAllData = async () => {            <div className="space-y-4">

                className={`px-4 py-3 font-medium border-b-2 transition ${

                  activeTab === tab.id    loadDataIntegrity();              <button

                    ? 'border-blue-500 text-white'

                    : 'border-transparent text-gray-400 hover:text-white'    loadAIInvestors();                onClick={() => runAITrading()}

                }`}

              >  };                disabled={loading}

                {tab.label}

              </button>                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"

            ))}

          </div>  const loadDataIntegrity = async () => {              >

        </div>

      </div>    setLoading(true);                {loading ? 'Running AI Trading Round...' : 'Run All AI Investors (10 AIs)'}



      {/* Content */}    try {              </button>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {activeTab === 'dashboard' && (      const response = await fetch('/api/data-integrity');

          <div className="space-y-6">

            <div className="grid grid-cols-4 gap-4">      if (!response.ok) throw new Error(`API error: ${response.status}`);              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

              <div className="bg-gray-800 rounded-lg p-6">

                <div className="text-gray-400 text-sm mb-1">Total Users</div>      const data = await response.json();                {[

                <div className="text-3xl font-bold">{dataIntegrityUsers.length}</div>

                <div className="text-xs text-gray-500 mt-1">      setDataIntegrityUsers(data.users);                  { id: 'ai_boomer', name: 'The Boomer' },

                  {humanUsers.length} humans, {aiUsersData.length} AI

                </div>    } catch (err: any) {                  { id: 'ai_steady', name: 'Steady Eddie' },

              </div>

              <div className="bg-red-900/30 rounded-lg p-6 border border-red-500">      console.error('Data integrity error:', err);                  { id: 'ai_yolo', name: 'YOLO Kid' },

                <div className="text-red-400 text-sm mb-1">Data Issues</div>

                <div className="text-3xl font-bold text-red-400">{issuesCount}</div>    } finally {                  { id: 'ai_diamond', name: 'Diamond Hands' },

                <div className="text-xs text-gray-500 mt-1">Discrepancies found</div>

              </div>      setLoading(false);                  { id: 'ai_silicon', name: 'Silicon Brain' },

              <div className="bg-green-900/30 rounded-lg p-6 border border-green-500">

                <div className="text-green-400 text-sm mb-1">Active AI</div>    }                  { id: 'ai_cloud', name: 'Cloud Surfer' },

                <div className="text-3xl font-bold text-green-400">

                  {aiInvestors.filter(ai => ai.status === 'ACTIVE').length}  };                  { id: 'ai_fomo', name: 'FOMO Master' },

                </div>

                <div className="text-xs text-gray-500 mt-1">Trading enabled</div>                  { id: 'ai_hype', name: 'Hype Train' },

              </div>

              <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-500">  const loadAIInvestors = async () => {                  { id: 'ai_contrarian', name: 'The Contrarian' },

                <div className="text-blue-400 text-sm mb-1">Platform Value</div>

                <div className="text-2xl font-bold text-blue-400">    setLoading(true);                  { id: 'ai_oracle', name: 'The Oracle' }

                  ${(dataIntegrityUsers.reduce((sum, u) => sum + (u.ui?.totalValue || 0), 0) / 1000).toFixed(0)}K

                </div>    try {                ].map(ai => (

                <div className="text-xs text-gray-500 mt-1">Total capital</div>

              </div>      const response = await fetch('/api/admin/ai-investors');                  <button

            </div>

      if (!response.ok) throw new Error(`API error: ${response.status}`);                    key={ai.id}

            <div className="bg-gray-800 rounded-lg p-6">

              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>      const data = await response.json();                    onClick={() => runAITrading(ai.id)}

              <div className="grid grid-cols-3 gap-4">

                <button      setAIInvestors(data.aiInvestors);                    disabled={loading}

                  onClick={() => setActiveTab('data-integrity')}

                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"    } catch (err: any) {                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm transition disabled:opacity-50"

                >

                  <div className="text-2xl mb-2">🔍</div>      console.error('AI investors error:', err);                  >

                  <div className="font-bold">Check Data Integrity</div>

                  <div className="text-sm text-gray-400">    } finally {                    {ai.name}

                    {issuesCount > 0 ? `${issuesCount} issues to review` : 'All systems healthy'}

                  </div>      setLoading(false);                  </button>

                </button>

                <button    }                ))}

                  onClick={() => setActiveTab('ai-investors')}

                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left"  };              </div>

                >

                  <div className="text-2xl mb-2">🤖</div>            </div>

                  <div className="font-bold">Manage AI Investors</div>

                  <div className="text-sm text-gray-400">{aiInvestors.length} AI traders</div>  const selectAI = (ai: AIInvestor) => {          </div>

                </button>

                <button    setSelectedAI(ai);

                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left opacity-50 cursor-not-allowed"

                  disabled    setEditMode(false);          {/* Results Display */}

                >

                  <div className="text-2xl mb-2">👤</div>    setEditForm({          {results && (

                  <div className="font-bold">View Human Users</div>

                  <div className="text-sm text-gray-400">Coming soon</div>      ai_nickname: ai.nickname,            <div className="bg-gray-800/50 rounded-xl p-6">

                </button>

              </div>      ai_emoji: ai.emoji,              <h2 className="text-2xl font-bold text-white mb-4">Trading Results</h2>

            </div>

          </div>      ai_strategy: ai.strategy,              <p className="text-sm text-gray-400 mb-6">

        )}

      ai_catchphrase: ai.catchphrase,                Timestamp: {new Date(results.timestamp).toLocaleString()}

        {activeTab === 'data-integrity' && (

          <div className="bg-gray-800 rounded-lg p-6">      ai_status: ai.status              </p>

            <h2 className="text-2xl font-bold mb-4">Data Integrity</h2>

            <p className="text-gray-400">    });

              Data integrity features will be added here. For now, use the static HTML version at{' '}

              <a href="/data-integrity.html" className="text-blue-400 hover:underline">  };              <div className="space-y-6">

                /data-integrity.html

              </a>                {results.results?.map((result: any) => (

            </p>

          </div>  const saveAIChanges = async () => {                  <div 

        )}

    if (!selectedAI) return;                    key={result.aiId}

        {activeTab === 'ai-investors' && (

          <div className="bg-gray-800 rounded-lg p-6">    setLoading(true);                    className={`border rounded-lg p-4 ${

            <h2 className="text-2xl font-bold mb-4">AI Investors ({aiInvestors.length})</h2>

            <div className="space-y-3">    try {                      result.success ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'

              {aiInvestors.map(ai => (

                <div key={ai.userId} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">      const response = await fetch('/api/admin/ai-investors', {                    }`}

                  <div className="flex items-center gap-3">

                    <span className="text-3xl">{ai.emoji}</span>        method: 'PATCH',                  >

                    <div>

                      <div className="font-bold">{ai.nickname}</div>        headers: { 'Content-Type': 'application/json' },                    <div className="flex items-center justify-between mb-3">

                      <div className="text-sm text-gray-400">{ai.strategy}</div>

                    </div>        body: JSON.stringify({                      <h3 className="text-xl font-bold text-white">{result.name}</h3>

                  </div>

                  <div className="text-right">          userId: selectedAI.userId,                      <span className={`text-sm font-semibold ${

                    <div className="font-mono">${(ai.totalValue / 1000).toFixed(1)}K</div>

                    <div className={`text-sm ${parseFloat(ai.roi) >= 0 ? 'text-green-400' : 'text-red-400'}`}>          updates: editForm                        result.success ? 'text-green-400' : 'text-red-400'

                      {ai.roi}% ROI

                    </div>        })                      }`}>

                  </div>

                </div>      });                        {result.success ? 'SUCCESS' : 'FAILED'}

              ))}

            </div>      if (!response.ok) throw new Error('Failed to update');                      </span>

            <p className="text-gray-400 mt-4 text-sm">

              Full AI management features coming soon...      await loadAIInvestors();                    </div>

            </p>

          </div>      setEditMode(false);

        )}

      </div>      alert('✅ AI Investor updated successfully!');                    {result.success && (

    </div>

  );    } catch (err: any) {                      <>

}

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
