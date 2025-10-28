'use client';

import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const [serverData, setServerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch server-side debug info
    fetch('/api/debug-auth', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setServerData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load debug data:', err);
        setLoading(false);
      });
  }, []);

  const testVoteAPI = () => {
    console.log('=== CLIENT-SIDE DEBUG ===');
    console.log('document.cookie:', document.cookie);
    
    fetch('/api/vote-pitch', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        console.log('GET /api/vote-pitch response:', data);
        alert('Check browser console for detailed logs');
      })
      .catch(err => {
        console.error('Error:', err);
        alert('Error - check console');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading debug info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-8">🔍 Authentication Debug Page</h1>
        
        {/* User Status */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">User Status from getUser()</h2>
          {serverData?.user ? (
            <div className="space-y-2">
              <p className="text-green-400 font-bold">✅ AUTHENTICATED</p>
              <p><strong>ID:</strong> {serverData.user.id}</p>
              <p><strong>Email:</strong> {serverData.user.email}</p>
              <p><strong>Name:</strong> {serverData.user.name}</p>
              <p><strong>Class Code:</strong> {serverData.user.classCode}</p>
            </div>
          ) : (
            <p className="text-red-400 font-bold">❌ NOT AUTHENTICATED</p>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Cookies (Server-Side)</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-yellow-400">SSO Token:</h3>
              {serverData?.cookies?.ssoToken ? (
                <div className="bg-gray-900 p-3 rounded mt-2 break-all">
                  <p className="text-xs text-gray-400">Name: {serverData.cookies.ssoToken.name}</p>
                  <p className="text-xs">Value: {serverData.cookies.ssoToken.value}...</p>
                </div>
              ) : (
                <p className="text-red-400">❌ Not found</p>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-yellow-400">All Cookies ({serverData?.cookies?.all?.length || 0}):</h3>
              <div className="bg-gray-900 p-3 rounded mt-2 space-y-1">
                {serverData?.cookies?.all?.map((cookie: any) => (
                  <p key={cookie.name} className="text-xs">
                    <strong>{cookie.name}:</strong> {cookie.value}...
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Headers */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Request Headers</h2>
          <div className="space-y-2">
            <div>
              <h3 className="font-bold text-yellow-400">User Headers (from middleware):</h3>
              <div className="bg-gray-900 p-3 rounded mt-2 space-y-1">
                <p className="text-xs"><strong>x-user-id:</strong> {serverData?.headers?.userHeaders?.['x-user-id'] || '❌ Not set'}</p>
                <p className="text-xs"><strong>x-user-email:</strong> {serverData?.headers?.userHeaders?.['x-user-email'] || '❌ Not set'}</p>
                <p className="text-xs"><strong>x-user-name:</strong> {serverData?.headers?.userHeaders?.['x-user-name'] || '❌ Not set'}</p>
                <p className="text-xs"><strong>x-user-class:</strong> {serverData?.headers?.userHeaders?.['x-user-class'] || '❌ Not set'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-yellow-400">Cookie Header:</h3>
              <div className="bg-gray-900 p-3 rounded mt-2 break-all text-xs">
                {serverData?.headers?.cookie || '❌ Not set'}
              </div>
            </div>
          </div>
        </div>

        {/* Client-Side Cookies */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Client-Side Cookies</h2>
          <div className="bg-gray-900 p-3 rounded break-all text-xs">
            {document.cookie || '❌ No cookies accessible from JavaScript'}
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Note: httpOnly cookies won't appear here (this is normal and correct)
          </p>
        </div>

        {/* Client-Side Test */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Client-Side API Test</h2>
          <button
            onClick={testVoteAPI}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-bold"
          >
            Test Vote API (Check Console)
          </button>
          
          <p className="text-sm text-gray-400 mt-4">
            Click the button above, then check your browser console (F12) for detailed logs
          </p>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Actions</h2>
          <div className="space-x-4">
            <a href="/" className="inline-block bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-lg font-bold">
              ← Back to Home
            </a>
            <a href="/login" className="inline-block bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-bold">
              Login
            </a>
            <a href="/api/logout" className="inline-block bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-bold">
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
