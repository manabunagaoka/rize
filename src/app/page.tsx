import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getUser();

  // If logged in, go to competitions platform
  if (user) {
    redirect('/competitions');
  }

  // If not logged in, go to login
  redirect('/login');
}
