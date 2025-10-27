import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getUser();

  // Always redirect to competitions page
  // That page will handle showing content
  redirect('/competitions');
}
