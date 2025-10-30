import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Portfolio from '@/components/Portfolio';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Portfolio</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <Link 
            href="/competitions?competition=legendary" 
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Trade Stocks →
          </Link>
        </div>
        
        <Portfolio />
      </div>
    </div>
  );
}
