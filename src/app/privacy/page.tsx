export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-400 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm">
          <section>
            <p className="text-gray-400 mb-4">
              <strong>Effective Date:</strong> October 29, 2025<br />
              <strong>Last Updated:</strong> October 29, 2025
            </p>
            <p>
              This Privacy Policy describes how RIZE (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares 
              information when you use our educational investment simulation platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-3">1.1 Authentication Data</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Manaboodle SSO user ID (unique identifier)</li>
              <li>Email address from your Manaboodle account</li>
              <li>Authentication tokens (stored securely as httpOnly cookies)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-3">1.2 Game Activity Data</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>MTK token balance and transaction history</li>
              <li>Investment portfolio holdings and valuations</li>
              <li>Investment decisions (which startups you invest in and amounts)</li>
              <li>Leaderboard rankings and performance statistics</li>
              <li>Timestamps of all actions and activities</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-3">1.3 Technical Data</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>IP address and browser information</li>
              <li>Device type and operating system</li>
              <li>Session data and cookies</li>
              <li>Error logs and diagnostic information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use collected information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Authenticate users via Manaboodle SSO</li>
              <li>Maintain user accounts and portfolio data</li>
              <li>Calculate and display leaderboard rankings</li>
              <li>Process virtual investment transactions</li>
              <li>Improve game mechanics and user experience</li>
              <li>Detect and prevent fraud, abuse, or cheating</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Analyze usage patterns to improve the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. Public Information</h2>
            <p className="mb-2">
              <strong className="text-yellow-400">Important:</strong> The following information is publicly 
              visible to all RIZE users:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your display name (email or username)</li>
              <li>Total portfolio value and rankings</li>
              <li>Companies you have invested in</li>
              <li>Portfolio performance statistics (gain/loss percentages)</li>
            </ul>
            <p className="mt-2">
              By using RIZE, you consent to this information being publicly displayed on leaderboards and 
              competition pages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Information Sharing</h2>
            <p className="mb-2">We do NOT sell your personal information. We may share data in these situations:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>With Manaboodle:</strong> RIZE is integrated with Manaboodle SSO, so authentication 
                data is shared with Manaboodle&apos;s authentication service
              </li>
              <li>
                <strong>Service Providers:</strong> We use Supabase for database hosting and Vercel for 
                application hosting
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law, court order, or government request
              </li>
              <li>
                <strong>Safety and Security:</strong> To protect against fraud, abuse, or security threats
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Data Storage and Security</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Data is stored on Supabase (PostgreSQL) servers</li>
              <li>Authentication tokens are stored as httpOnly, secure cookies</li>
              <li>We use industry-standard encryption for data transmission (HTTPS)</li>
              <li>We implement reasonable security measures, but cannot guarantee absolute security</li>
              <li>You are responsible for maintaining the security of your Manaboodle account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Data Retention</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>We retain your data for as long as your account is active</li>
              <li>Transaction history may be retained indefinitely for game integrity</li>
              <li>We may delete inactive accounts after extended periods of inactivity</li>
              <li>We reserve the right to delete all data if the Service is discontinued</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="mb-2">Depending on your jurisdiction, you may have rights to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of certain data collection (may limit Service functionality)</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at{' '}
              <a href="mailto:hello@manaboodle.com" className="text-pink-400 underline">
                hello@manaboodle.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Cookies and Tracking</h2>
            <p className="mb-2">We use cookies for:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Authentication:</strong> httpOnly cookies to maintain login sessions</li>
              <li><strong>Preferences:</strong> localStorage for disclaimer acceptance and user settings</li>
              <li><strong>Analytics:</strong> We may use analytics tools to understand usage patterns</li>
            </ul>
            <p className="mt-2">
              You can disable cookies in your browser, but this will prevent you from using RIZE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>
              RIZE is intended for users aged 13 and above. We do not knowingly collect personal information 
              from children under 13. If you believe a child under 13 has created an account, please contact 
              us immediately so we can delete the account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">10. International Users</h2>
            <p>
              RIZE is hosted on servers that may be located in various countries. By using RIZE, you consent 
              to the transfer and processing of your data in countries that may have different data protection 
              laws than your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">11. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be communicated 
              through the Service or via email. Continued use after changes constitutes acceptance of the 
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">12. Contact Us</h2>
            <p>
              For questions, concerns, or requests regarding this Privacy Policy or your data, contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:hello@manaboodle.com" className="text-pink-400 underline">
                hello@manaboodle.com
              </a>
              <br />
              <strong>Subject Line:</strong> RIZE Privacy Request
            </p>
          </section>

          <section className="bg-gray-800 border border-gray-600 rounded p-4 mt-8">
            <h2 className="text-xl font-bold text-white mb-3">Summary (Not Legally Binding)</h2>
            <p className="text-sm">
              We collect your Manaboodle account info, game activity (investments, portfolio), and technical 
              data to run RIZE. Your leaderboard rankings and portfolio stats are public. We don&apos;t sell your 
              data. We use secure hosting (Supabase/Vercel) and encryption. You can request to see or delete 
              your data. Must be 13+ to use RIZE.
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
