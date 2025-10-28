import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import AccountClient from './AccountClient';

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AccountClient user={user} />
    </Suspense>
  );
}
