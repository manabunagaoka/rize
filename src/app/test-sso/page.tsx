import { getUser } from '@/lib/auth';

export default async function TestSSO() {
  // Try to get user from headers (set by middleware if authenticated)
  const user = await getUser();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          SSO Authentication Test
        </h1>
        
        {!user ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold mb-2">
                ⚠️ Not Authenticated
              </p>
              <p className="text-sm text-yellow-700 mb-4">
                You should have been redirected to Manaboodle SSO login...
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why you might see this:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Middleware redirect might not work in GitHub Codespaces preview</li>
                <li>Try opening in a regular browser tab (not preview)</li>
                <li>The SSO URL needs to be publicly accessible</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Manual SSO Test:</h3>
              <p className="text-sm text-gray-700 mb-3">
                Click below to manually trigger SSO login:
              </p>
              <a 
                href={`https://manaboodle.com/sso/login?return_url=${encodeURIComponent('https://humble-potato-q796w95qgw396g4-3000.app.github.dev/test-sso')}&app_name=RIZE`}
                className="block text-center py-3 bg-crimson-700 text-white rounded-lg font-medium hover:bg-crimson-800 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Manaboodle SSO Login →
              </a>
            </div>
            
            <a 
              href="/"
              className="block text-center py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              ← Back to Home
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">
                🎉 You are authenticated!
              </p>
              <p className="text-sm text-green-700">
                SSO is working correctly. Your session is verified by Manaboodle.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <h2 className="font-bold text-gray-900">User Information:</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-mono text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-mono text-gray-900">{user.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-mono text-gray-900">{user.classCode || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How SSO Worked:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>You visited this protected page</li>
                <li>Middleware detected no SSO token</li>
                <li>Redirected to: https://manaboodle.com/sso/login</li>
                <li>You logged in with Harvard credentials</li>
                <li>Manaboodle redirected back with sso_token</li>
                <li>Middleware stored token in httpOnly cookie</li>
                <li>Token verified with Manaboodle API</li>
                <li>User data injected into request headers</li>
              </ol>
            </div>
            
            <div className="flex gap-3">
              <a 
                href="/"
                className="flex-1 text-center py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                ← Back to Home
              </a>
              <a 
                href="/submit"
                className="flex-1 text-center py-3 bg-crimson-700 text-white rounded-lg font-medium hover:bg-crimson-800 transition"
              >
                Submit Project →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
