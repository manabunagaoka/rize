import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to RIZE, {user.name}!</h1>
        <p className="text-gray-600 mb-8">You&apos;re logged in with: {user.email}</p>
        
        <div className="grid gap-4">
          <a 
            href="/vote" 
            className="bg-pink-500 text-white p-6 rounded-xl hover:bg-pink-600 transition"
          >
            <h2 className="text-2xl font-bold mb-2">Start Voting</h2>
            <p>Vote on Harvard&apos;s legendary startups</p>
          </a>
          
          <a 
            href="/submit" 
            className="bg-gray-800 text-white p-6 rounded-xl hover:bg-gray-900 transition"
          >
            <h2 className="text-2xl font-bold mb-2">Submit Your Project</h2>
            <p>Share your startup and compete for rankings</p>
          </a>
          
          <a 
            href="/leaderboard" 
            className="bg-white text-gray-800 p-6 rounded-xl hover:bg-gray-100 transition border-2"
          >
            <h2 className="text-2xl font-bold mb-2">View Leaderboard</h2>
            <p>See the top student projects</p>
          </a>
        </div>
      </div>
    </div>
  );
}
