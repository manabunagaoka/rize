"use client";

import Link from 'next/link';

export default function LoginPage() {
  const handleLogin = () => {
    // Redirect to Manaboodle Academic Portal (NOT Harvard SSO)
    // Always use production URL to avoid preview deployment URL issues
    const returnUrl = 'https://rize.vercel.app';
    const loginUrl = `https://www.manaboodle.com/academic-portal/login?return_url=${encodeURIComponent(returnUrl)}&app_name=RIZE`;
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center gap-2">
            <h1 className="text-5xl font-bold text-white">
              RIZE
            </h1>
            <span className="text-lg text-gray-400 font-medium">by Manaboodle</span>
          </div>
          <p className="text-gray-400 text-lg mt-2">
            Rank Harvard&apos;s legendary startups
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-gray-400">
              Log in to start ranking and submit your project
            </p>
          </div>

          {/* Academic Portal Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 flex items-center justify-center gap-3 group"
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:scale-110" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Log in with Manaboodle
          </button>

          <div className="mt-4 text-center text-sm text-gray-400">
            Secure authentication via Manaboodle
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800/50 text-gray-400">
                or
              </span>
            </div>
          </div>

          {/* Request Access (Coming Soon) */}
          <button
            disabled
            className="w-full bg-gray-700/30 text-gray-500 font-semibold py-4 px-6 rounded-xl cursor-not-allowed border border-gray-700/50 flex items-center justify-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Request Access Code
            <span className="ml-2 text-xs bg-gray-700/50 px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </button>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Public access with invite codes coming soon
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
          >
            ← Back to home
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          Currently available for Harvard students only
        </div>
      </div>
    </div>
  );
}
