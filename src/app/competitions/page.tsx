import { Suspense } from 'react';
import { getUser } from '@/lib/auth';
import Link from 'next/link';
import CompetitionsClient from './CompetitionsClient';

export default async function CompetitionsPage() {
  const user = await getUser();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CompetitionsClient user={user} />
    </Suspense>
  );
}

