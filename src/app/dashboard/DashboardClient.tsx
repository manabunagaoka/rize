'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Portfolio from '@/components/Portfolio';

interface User {
  id: string;
  email: string;
  name: string;
  classCode: string;
}

export default function DashboardClient({ user }: { user: User }) {
  const [isResetting, setIsResetting] = useState(false);

  async function handleResetAccount() {
    if (!confirm('Are you sure you want to reset your account? This will:\n\n• Delete all your investments\n• Delete transaction history\n• Reset your balance to $1,000,000 MTK\n\nThis cannot be undone!')) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('/api/clear-my-account', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Account reset successfully! Refreshing...');
        window.location.reload();
      } else {
        alert('❌ Failed to reset account: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('❌ Failed to reset account. Please try again.');
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Account</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleResetAccount}
            disabled={isResetting}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-semibold transition border border-red-500/50 disabled:opacity-50"
          >
            {isResetting ? 'Resetting...' : '🔄 Reset Account'}
          </button>
        </div>
        
        <Portfolio />
      </div>
    </div>
  );
}
