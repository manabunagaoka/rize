export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-400 mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-sm">
          <section>
            <p className="text-gray-400 mb-4">
              <strong>Effective Date:</strong> October 29, 2025<br />
              <strong>Last Updated:</strong> October 29, 2025
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using RIZE (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, you must not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Service Description</h2>
            <p className="mb-2">
              RIZE is an educational entertainment platform that simulates investment portfolio management using 
              virtual currency called Manaboodle Tokens (MTK). The Service includes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Virtual token distribution (1,000,000 MTK per user at registration)</li>
              <li>Simulated investment in startup pitch profiles</li>
              <li>Portfolio tracking and performance analytics</li>
              <li>Competitive leaderboards with real users and AI investors</li>
              <li>Educational content about investment strategies</li>
            </ul>
          </section>

          <section className="bg-red-900 bg-opacity-20 border border-red-500 rounded p-4">
            <h2 className="text-2xl font-semibold text-red-400 mb-3">3. NO REAL VALUE - CRITICAL DISCLAIMER</h2>
            <p className="mb-2">
              <strong>YOU EXPLICITLY ACKNOWLEDGE AND AGREE THAT:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Manaboodle Tokens (MTK) have ZERO real-world monetary value</strong> and cannot be 
                exchanged for money, cryptocurrency, goods, services, or any other form of value
              </li>
              <li>
                Virtual investments made on RIZE do NOT represent real equity, ownership stakes, securities, 
                or any actual financial instruments
              </li>
              <li>
                RIZE is a simulation game designed solely for educational and entertainment purposes
              </li>
              <li>
                No real money is involved in the operation of RIZE (unless explicitly stated for optional 
                premium features in future versions)
              </li>
              <li>
                The startups and companies featured on RIZE are profile representations and do NOT constitute 
                investment opportunities or financial advice
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Eligibility and Age Requirements</h2>
            <p className="mb-2">
              You must meet the following requirements to use RIZE:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You must be at least 13 years of age</li>
              <li>If you are under 18, you must have parental or guardian consent</li>
              <li>You must have a valid Manaboodle SSO account</li>
              <li>You must comply with all applicable laws in your jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. User Accounts and Security</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to notify us immediately of any unauthorized access to your account</li>
              <li>We are not liable for any loss or damage arising from your failure to secure your account</li>
              <li>One account per user - creating multiple accounts to gain unfair advantages is prohibited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Virtual Currency and Investments</h2>
            <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-3">6.1 MTK Distribution</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Each user receives 1,000,000 MTK upon registration</li>
              <li>MTK is distributed for free and has no purchase price</li>
              <li>We reserve the right to adjust MTK balances for game balancing purposes</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-3">6.2 Investment Mechanics</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Virtual share prices are calculated dynamically based on total investment volume</li>
              <li>Current formula: Price = $100 × (1 + Total Volume / 1,000,000 MTK)</li>
              <li>We may modify pricing algorithms at any time for game balance</li>
              <li>Portfolio values may fluctuate based on system changes</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-3">6.3 AI Investors</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>AI investors are automated accounts that simulate different investment strategies</li>
              <li>AI behavior may be modified or updated without notice</li>
              <li>AI investors exist to provide educational examples and competitive benchmarks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Prohibited Conduct</h2>
            <p className="mb-2">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Exploit bugs, glitches, or vulnerabilities for unfair advantage</li>
              <li>Use automated scripts, bots, or tools to interact with the Service</li>
              <li>Attempt to manipulate leaderboards or game mechanics</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Claim that MTK has real value or attempt to sell/trade MTK outside the platform</li>
              <li>Misrepresent RIZE as actual investment advice or financial services</li>
            </ul>
          </section>

          <section className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded p-4">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-3">8. Limitations of Liability</h2>
            <p className="mb-2">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                RIZE is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, express or implied
              </li>
              <li>
                We are NOT responsible for loss of MTK, portfolio data, leaderboard rankings, or account information
              </li>
              <li>
                We are NOT liable for service interruptions, technical errors, data corruption, or system failures
              </li>
              <li>
                We do NOT guarantee continuous, uninterrupted, or secure access to the Service
              </li>
              <li>
                We are NOT responsible for decisions you make based on information or experiences on RIZE
              </li>
              <li>
                In no event shall our total liability exceed $0 USD (zero dollars)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">9. Service Modifications and Termination</h2>
            <p className="mb-2">We reserve the right to, at any time and without notice:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Modify, suspend, or discontinue any part of the Service</li>
              <li>Reset user balances or portfolios for maintenance or balancing</li>
              <li>Change game mechanics, algorithms, or features</li>
              <li>Remove or modify startup profiles and investment options</li>
              <li>Terminate or suspend user accounts for violation of these Terms</li>
              <li>Permanently shut down the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">10. Data and Privacy</h2>
            <p>
              Your use of RIZE is subject to our Privacy Policy. We collect and process data including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Manaboodle SSO authentication data (user ID, email)</li>
              <li>Portfolio holdings, transaction history, and investment activity</li>
              <li>Leaderboard rankings and public profile information</li>
            </ul>
            <p className="mt-2">
              Your portfolio and leaderboard rankings are publicly visible to all RIZE users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">11. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, and intellectual property on RIZE are owned by Manaboodle or 
              licensed to us. You may not use, reproduce, or distribute any content without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless RIZE, Manaboodle, and our affiliates from any claims, 
              damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">13. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Continued use of the Service after changes constitutes 
              acceptance of the modified Terms. We will make reasonable efforts to notify users of significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">14. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved 
              through binding arbitration or in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">15. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:{' '}
              <a href="mailto:legal@manaboodle.com" className="text-pink-400 underline">
                legal@manaboodle.com
              </a>
            </p>
          </section>

          <section className="bg-gray-800 border border-gray-600 rounded p-4 mt-8">
            <h2 className="text-xl font-bold text-white mb-3">Summary (Not Legally Binding)</h2>
            <p className="text-sm">
              RIZE is a free educational game where you practice investment strategies with fake money (MTK) 
              that has no real value. You must be 13+ to play. We can change or shut down the service anytime. 
              We&apos;re not responsible if you lose data or if the game stops working. Don&apos;t cheat, don&apos;t harass 
              others, and understand this is just for fun and learning—not real investing.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <a
            href="/"
            className="text-pink-400 hover:text-pink-300 underline font-semibold"
          >
            ← Back to RIZE
          </a>
        </div>
      </div>
    </div>
  );
}
