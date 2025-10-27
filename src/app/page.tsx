import { getUser } from '@/lib/auth';
import Link from 'next/link';
import PitchCard from '@/components/PitchCard';

// Success stories for public preview
const SUCCESS_STORIES = [
  {
    id: 1,
    name: 'Facebook',
    founder: 'Mark Zuckerberg',
    year: '2004',
    pitch: 'An online directory that connects people through social networks at colleges.',
    funFact: 'Started as "TheFacebook" - exclusive to Harvard students with a .edu email. Expanded to other Ivy League schools within months.',
    valuation: '$1.2T',
    ticker: 'META',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'Microsoft',
    founder: 'Bill Gates & Paul Allen',
    year: '1975',
    pitch: 'A computer on every desk and in every home, running our software.',
    funFact: 'Gates wrote a BASIC interpreter for the Altair 8800 in his dorm room. Sold it before even testing on real hardware - it worked.',
    valuation: '$3.1T',
    ticker: 'MSFT',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    name: 'Dropbox',
    founder: 'Drew Houston',
    year: '2007',
    pitch: 'Your files, anywhere. One folder that syncs across all your devices.',
    funFact: 'Drew forgot his USB drive on a bus trip and coded the first prototype during the 4-hour ride. Launched at Y Combinator.',
    valuation: '$10B',
    ticker: 'DBX',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 4,
    name: 'Akamai',
    founder: 'Tom Leighton & Danny Lewin',
    year: '1998',
    pitch: 'Make the internet faster by serving content from servers closer to users.',
    funFact: 'Started as an MIT/Harvard math project. Now delivers 30% of all web traffic globally including Netflix and Spotify.',
    valuation: '$15B',
    ticker: 'AKAM',
    color: 'from-cyan-500 to-cyan-600'
  }
];

export default async function HomePage() {
  const user = await getUser();

  // If logged in, redirect to competitions
  if (user) {
    return (
      <>
        <script dangerouslySetInnerHTML={{__html: `window.location.href='/competitions'`}} />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Redirecting...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🚀</div>
            <div>
              <h1 className="text-2xl font-bold">RIZE</h1>
              <p className="text-xs text-gray-400">Harvard Edition</p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            From Dorm Room<br />
            to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">Billion-Dollar Company</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Harvard&apos;s next unicorn is being built right now. Vote on the best student startups and discover the future before everyone else.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-pink-700 transition shadow-xl"
            >
              Sign In to Vote →
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 bg-gray-800 text-white rounded-lg font-semibold text-lg hover:bg-gray-700 transition border-2 border-gray-700"
            >
              Submit Your Startup
            </Link>
          </div>
        </div>
      </section>

      {/* Legendary Pitches Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-3">
              Vote on Legendary Pitches
            </h3>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Which elevator pitch inspires you most? Vote on pitches from Harvard founders who turned dorm room ideas into billion-dollar companies.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {SUCCESS_STORIES.map((story) => (
              <PitchCard 
                key={story.id} 
                story={story}
                rank={0}
                isAuthenticated={false}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-pink-500 text-white rounded-lg font-semibold text-lg hover:bg-pink-600 transition"
            >
              Sign In to See All 10 Pitches & Vote →
            </Link>
          </div>
        </div>
      </section>

      {/* Student Startups Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-3">
              Student Startup Competition
            </h3>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Vote for your classmates&apos; startups. Best ideas get featured and investor introductions.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h4 className="text-2xl font-bold text-white mb-4">Sign In to Access</h4>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              View and vote on student startups from Harvard classes. Connect your Harvard account to participate.
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-pink-700 transition"
            >
              Sign In with Manaboodle SSO
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 RIZE - Harvard Edition. Built with ❤️ at Harvard.</p>
        </div>
      </footer>
    </div>
  );
}
