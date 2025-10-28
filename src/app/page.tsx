import { getUser } from '@/lib/auth';
import LandingPage from './LandingPage';

export default async function HomePage() {
  const user = await getUser();

  return <LandingPage user={user} />;
}
