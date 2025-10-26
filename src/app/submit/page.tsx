import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SubmitForm from './SubmitForm';

export default async function SubmitPage() {
  const user = await getUser();
  
  // Require authentication
  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RIZE</h1>
              <p className="text-xs text-gray-400">by Manaboodle</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">Hi, {user.name}</span>
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition border border-gray-700"
            >
              Back Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Submit Your Startup
            </h1>
            <p className="text-xl text-gray-300">
              Showcase your project to the Harvard community
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
            <SubmitForm user={user} />
          </div>

          {/* Guidelines */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-300 mb-3">
              📋 Submission Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Your submission will be reviewed within 24 hours</li>
              <li>• Once approved, your startup will appear on the leaderboard</li>
              <li>• You can edit your submission anytime (changes require re-approval)</li>
              <li>• Be honest and professional in your descriptions</li>
              <li>• All Harvard student projects are welcome!</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
