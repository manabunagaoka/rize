"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SSODebugContent() {
  const searchParams = useSearchParams();
  const [cookies, setCookies] = useState<string>('');
  
  useEffect(() => {
    setCookies(document.cookie);
  }, []);
  
  const ssoToken = searchParams.get('sso_token');
  const ssoRefresh = searchParams.get('sso_refresh');
  const allParams = Array.from(searchParams.entries());
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">SSO Debug Page</h1>
        
        <div className="space-y-6">
          {/* Current URL */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-pink-500">Current URL</h2>
            <p className="font-mono text-sm break-all">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
          </div>
          
          {/* SSO Token Status */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-pink-500">SSO Token Status</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">sso_token:</span>
                {ssoToken ? (
                  <span className="text-green-400">✓ Present ({ssoToken.substring(0, 20)}...)</span>
                ) : (
                  <span className="text-red-400">✗ Not found</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">sso_refresh:</span>
                {ssoRefresh ? (
                  <span className="text-green-400">✓ Present ({ssoRefresh.substring(0, 20)}...)</span>
                ) : (
                  <span className="text-red-400">✗ Not found</span>
                )}
              </div>
            </div>
          </div>
          
          {/* All Query Parameters */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-pink-500">All Query Parameters</h2>
            {allParams.length > 0 ? (
              <ul className="space-y-2">
                {allParams.map(([key, value]) => (
                  <li key={key} className="font-mono text-sm">
                    <span className="text-blue-400">{key}</span>: {value.substring(0, 50)}{value.length > 50 ? '...' : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No query parameters found</p>
            )}
          </div>
          
          {/* Cookies */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-pink-500">Cookies (Client-Side)</h2>
            <p className="text-sm text-gray-400 mb-2">Note: httpOnly cookies won&apos;t appear here</p>
            {cookies ? (
              <pre className="font-mono text-sm overflow-x-auto">{cookies}</pre>
            ) : (
              <p className="text-gray-400">No cookies found</p>
            )}
          </div>
          
          {/* Test Academic Portal Link */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-pink-500">Test Academic Portal SSO</h2>
            <p className="mb-4 text-gray-300">
              Click below to test the Academic Portal login flow. It should redirect back to this page with tokens.
            </p>
            <a
              href={`https://www.manaboodle.com/academic-portal/login?return_url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/sso-debug' : '')}&app_name=RIZE`}
              className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-semibold transition"
            >
              Test Academic Portal Login →
            </a>
            <p className="mt-4 text-sm text-gray-400">
              Expected: Academic Portal → Back here with ?sso_token=... in URL
            </p>
          </div>
          
          {/* Instructions */}
          <div className="bg-blue-900/30 border border-blue-500/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">What to Look For</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>After clicking the test link, you should be redirected to Academic Portal</li>
              <li>After login, you should come back to this page</li>
              <li>The URL should contain <code className="bg-gray-800 px-2 py-1 rounded">?sso_token=...</code></li>
              <li>If tokens are present above, SSO is working!</li>
              <li>If tokens are NOT present, the Academic Portal is not sending them</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SSODebug() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl">Loading SSO debug info...</div>
      </div>
    }>
      <SSODebugContent />
    </Suspense>
  );
}
