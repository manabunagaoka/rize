import { getUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

export default async function DebugPage() {
  const user = await getUser();
  
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug: User Authentication</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-4">
        <h2 className="text-xl font-bold mb-4">User Object:</h2>
        <pre className="bg-gray-900 p-4 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Test Vote API:</h2>
        <button 
          id="test-vote"
          className="px-6 py-3 bg-pink-500 rounded-lg font-semibold hover:bg-pink-600"
        >
          Test Vote on Pitch #1
        </button>
        <div id="result" className="mt-4 bg-gray-900 p-4 rounded"></div>
      </div>
      
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('test-vote').addEventListener('click', async () => {
          const resultDiv = document.getElementById('result');
          resultDiv.textContent = 'Loading...';
          
          try {
            const response = await fetch('/api/vote-pitch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pitchId: 1 })
            });
            
            const data = await response.json();
            resultDiv.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            resultDiv.textContent = 'Error: ' + error.message;
          }
        });
      `}} />
    </main>
  );
}
