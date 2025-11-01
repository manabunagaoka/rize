'use client';

import Header from '@/components/Header';
import Portfolio from '@/components/Portfolio';

interface User {
  id: string;
  email: string;
  name: string;
  classCode: string;
}

export default function DashboardClient({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Header user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Account</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        
        <Portfolio />
      </div>
    </div>
  );
}
