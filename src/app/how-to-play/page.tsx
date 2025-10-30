export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-400 mb-4">How to Play RIZE</h1>
        <p className="text-gray-400 text-lg mb-8">
          Master the art of virtual investing and compete for the top of the leaderboard
        </p>
        
        <div className="space-y-8">
          {/* MTK Tokens */}
          <section className="bg-gray-900 border border-pink-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-pink-400 mb-4">
              Manaboodle Tokens (MTK)
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-white">Starting Balance:</strong> Every player receives <span className="text-pink-400 text-lg font-bold">$1,000,000 MTK</span> for FREE when they sign up.
              </p>
              <p>
                <strong className="text-white">Virtual Currency:</strong> MTK is virtual currency used only within RIZE. 
                <span className="text-yellow-400 font-semibold"> MTK has ZERO real-world value</span> and cannot be exchanged for real money.
              </p>
              <p>
                <strong className="text-white">Purpose:</strong> Use MTK to build an investment portfolio by buying "shares" 
                in Harvard's legendary startup pitches. Grow your wealth and climb the leaderboard!
              </p>
            </div>
          </section>

          {/* How Investing Works */}
          <section className="bg-gray-900 border border-blue-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              How Investing Works
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Browse Startups</h3>
                <p>
                  View 10 legendary Harvard startups (Facebook, Microsoft, Dropbox, etc.) with their current prices, 
                  descriptions, and market performance.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Buy Shares</h3>
                <p>
                  Click "Invest" on any startup. Choose how much MTK to invest. The system automatically calculates 
                  how many shares you'll receive at the current price.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Watch Your Portfolio</h3>
                <p>
                  As more people invest in a company, its share price increases. Your portfolio value updates in 
                  real-time based on current market prices.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4. Compete on Leaderboard</h3>
                <p>
                  Your total wealth (available MTK + portfolio value) determines your rank. Beat other players and 
                  10 AI investors to reach #1!
                </p>
              </div>
            </div>
          </section>

          {/* Dynamic Pricing */}
          <section className="bg-gray-900 border border-green-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Dynamic Pricing Algorithm
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                Share prices in RIZE aren't fixed—they grow based on total investment volume. This creates 
                real market dynamics where popular companies become more expensive.
              </p>
              
              <div className="bg-gray-800 border border-gray-700 rounded p-4 font-mono text-xs">
                <p className="text-green-400 mb-2">Formula:</p>
                <p className="text-white">
                  Share Price = $100 × (1 + Total Volume Invested / $1,000,000)
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-white font-semibold mb-1">Example 1: New Company</p>
                  <p className="text-xs text-gray-400">Total invested: $0</p>
                  <p className="text-green-400">Price: $100.00 per share</p>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-white font-semibold mb-1">Example 2: Popular Company</p>
                  <p className="text-xs text-gray-400">Total invested: $2,000,000</p>
                  <p className="text-green-400">Price: $300.00 per share</p>
                </div>
              </div>
              
              <p className="text-yellow-300 mt-3">
                <strong>Strategy Tip:</strong> Early investors in a company get cheaper prices. If the company 
                becomes popular later, your early shares become more valuable!
              </p>
            </div>
          </section>

          {/* AI Investors */}
          <section className="bg-gray-900 border border-purple-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              Meet the 10 AI Investors
            </h2>
            <p className="text-sm mb-4">
              You're competing against 10 AI investors, each with a unique personality and investment strategy. 
              Study their moves to learn different approaches!
            </p>
            
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">The Boomer</strong></p>
                <p className="text-gray-400 mb-1">Strategy: Conservative</p>
                <p className="italic text-gray-500">&quot;I invested in 1975 and never looked back&quot;</p>
                <p className="text-xs mt-2">Invests only in top 3 companies, holds forever.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">Steady Eddie</strong></p>
                <p className="text-gray-400 mb-1">Strategy: Diversified</p>
                <p className="italic text-gray-500">&quot;Tortoise beats the hare every time&quot;</p>
                <p className="text-xs mt-2">Equal investment across 5-7 companies.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">YOLO Kid</strong></p>
                <p className="text-gray-400 mb-1">Strategy: All-In</p>
                <p className="italic text-gray-500">&quot;Go big or go home!&quot;</p>
                <p className="text-xs mt-2">Picks ONE random company, invests everything.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">Diamond Hands</strong></p>
                <p className="text-gray-400 mb-1">Strategy: Hold Forever</p>
                <p className="italic text-gray-500">&quot;HODL to the moon!&quot;</p>
                <p className="text-xs mt-2">Invests early, never sells no matter what.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">Silicon Brain</strong></p>
                <p className="text-gray-400 mb-1">Strategy: Tech Only</p>
                <p className="italic text-gray-500">&quot;Code is eating the world&quot;</p>
                <p className="text-xs mt-2">Only invests in pure tech/software companies.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">Cloud Surfer</strong></p>
                <p className="text-gray-400 mb-1">Strategy: SaaS Only</p>
                <p className="italic text-gray-500">&quot;Subscription {'>'}  Everything&quot;</p>
                <p className="text-xs mt-2">Focuses on subscription/cloud business models.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">FOMO Master</strong></p>
                <p className="text-gray-400 mb-1">Strategy: Momentum</p>
                <p className="italic text-gray-500">&quot;Can't miss the next big thing!&quot;</p>
                <p className="text-xs mt-2">Chases whatever is gaining the most volume.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">Hype Train</strong></p>
                <p className="text-gray-400 mb-1">Strategy: Trend Follow</p>
                <p className="italic text-gray-500">&quot;I ride the wave!&quot;</p>
                <p className="text-xs mt-2">Follows trending companies, sells when hype fades.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">The Contrarian</strong></p>
                <p className="text-gray-400 mb-1">Strategy: Contrarian</p>
                <p className="italic text-gray-500">&quot;When others are greedy, I'm fearful&quot;</p>
                <p className="text-xs mt-2">Buys undervalued, sells overpriced companies.</p>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <p className="text-lg mb-1"><strong className="text-white">The Oracle</strong></p>
                <p className="text-gray-400 mb-1">Strategy: Perfect Timing</p>
                <p className="italic text-gray-500">&quot;I see what you don't...&quot;</p>
                <p className="text-xs mt-2">Mysteriously picks winners with uncanny accuracy.</p>
              </div>
            </div>
          </section>

          {/* Winning Strategies */}
          <section className="bg-gray-900 border border-yellow-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Winning Strategies
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold text-white mb-2">Early Bird</h3>
                <p className="text-xs">
                  Invest early in companies before they become popular. You get cheaper prices and bigger 
                  gains when others follow.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold text-white mb-2">Diversification</h3>
                <p className="text-xs">
                  Spread investments across multiple companies to reduce risk. If one underperforms, others 
                  may compensate.
                </p>
              </div>
              
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-semibold text-white mb-2">Market Analysis</h3>
                <p className="text-xs">
                  Study volume trends and AI investor behavior. Predict which companies will gain traction 
                  and invest before the crowd.
                </p>
              </div>
            </div>
          </section>

          {/* Important Disclaimers */}
          <section className="bg-red-900 bg-opacity-20 border-2 border-red-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Important Legal Information
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong className="text-white">No Real Value:</strong> MTK and virtual investments have 
                <span className="text-red-400 font-bold"> ZERO real-world monetary value</span>. You cannot 
                exchange them for real money.
              </p>
              <p>
                <strong className="text-white">Educational Purpose:</strong> RIZE is designed for learning 
                investment concepts through simulation. This is NOT real investment advice.
              </p>
              <p>
                <strong className="text-white">Age Requirement:</strong> You must be at least 13 years old 
                to play RIZE.
              </p>
              <p>
                <strong className="text-white">No Guarantees:</strong> We are not responsible for data loss, 
                service interruptions, or sudden discontinuation of RIZE.
              </p>
              <p>
                <strong className="text-white">Service Changes:</strong> We may modify game mechanics, reset 
                balances, or change features at any time for balancing purposes.
              </p>
              <p className="mt-4 text-xs text-gray-400">
                By playing RIZE, you agree to our{' '}
                <a href="/terms" className="text-pink-400 underline">Terms of Service</a> and{' '}
                <a href="/privacy" className="text-pink-400 underline">Privacy Policy</a>.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors"
          >
            Start Playing →
          </a>
        </div>
      </div>
    </div>
  );
}
