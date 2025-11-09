'use client';

import { useState, useEffect } from 'react';

export default function UnicornAdmin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'rize2025') {
      setIsAuthenticated(true);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">🦄 Unicorn Admin</h1>
          <p className="text-gray-400 text-sm">Complete platform management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="text-gray-400 mb-4">
            Unified admin dashboard coming soon. For now, use:
          </p>
          <div className="space-y-2">
            <a
              href="/data-integrity.html"
              className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg"
            >
              🔍 Data Integrity Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
