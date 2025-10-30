'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Portfolio from '@/components/Portfolio';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (!data.authenticated || !data.user) {
          router.push('/login');
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  async function handleResetAccount() {
    if (!confirm('Are you sure you want to reset your account? This will:\n\n• Delete all your investments\n• Delete transaction history\n• Reset your balance to $1,000,000 MTK\n\nThis cannot be undone!')) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('/api/reset-account', {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Portfolio</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResetAccount}
              disabled={isResetting}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-semibold transition border border-red-500/50 disabled:opacity-50"
            >
              {isResetting ? 'Resetting...' : '🔄 Reset Account'}
            </button>
            <Link 
              href="/competitions?competition=legendary" 
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Trade Stocks →
            </Link>
          </div>
        </div>
        
        <Portfolio />
      </div>
    </div>
  );
}
