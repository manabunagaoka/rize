'use client';

import { useState, useEffect } from 'react';

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isLegalAge, setIsLegalAge] = useState(false);

  useEffect(() => {
    // Disable auto-popup - user can access via footer links
    // Check if user has already accepted disclaimer
    const accepted = localStorage.getItem('rize_disclaimer_accepted');
    // Always set as accepted to prevent popup
    if (!accepted) {
      localStorage.setItem('rize_disclaimer_accepted', 'true');
      localStorage.setItem('rize_disclaimer_date', new Date().toISOString());
    }
    // Modal will not open automatically
  }, []);

  const handleAccept = () => {
    if (!hasAgreed || !isLegalAge) {
      alert('Please confirm you have read and agree to all terms.');
      return;
    }
    
    localStorage.setItem('rize_disclaimer_accepted', 'true');
    localStorage.setItem('rize_disclaimer_date', new Date().toISOString());
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.manaboodle.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-900 border-2 border-pink-500 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <h2 className="text-3xl font-bold text-pink-400 mb-4">
          Important Legal Disclaimer
        </h2>

        <div className="space-y-4 text-gray-300 text-sm">
          <section>
            <h3 className="text-xl font-semibold text-white mb-2">Welcome to RIZE Investment Game</h3>
            <p>
              RIZE is an <strong className="text-pink-400">educational entertainment platform</strong> that simulates 
              investment portfolio management using virtual Manaboodle Tokens (MTK).
            </p>
          </section>

          <section className="bg-red-900 bg-opacity-30 border border-red-500 rounded p-4">
            <h3 className="text-lg font-bold text-red-400 mb-2">NO REAL VALUE</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Manaboodle Tokens (MTK) have ZERO real-world monetary value</strong></li>
              <li>MTK cannot be exchanged for real money, cryptocurrency, or any other currency</li>
              <li>Virtual investments in RIZE do not represent real equity, ownership, or financial instruments</li>
              <li>This is a simulation game for educational and entertainment purposes ONLY</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">What is RIZE?</h3>
            <p className="mb-2">RIZE allows you to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Receive 1,000,000 free MTK tokens when you sign up</li>
              <li>Build a virtual investment portfolio by &quot;investing&quot; MTK in startup pitches</li>
              <li>Compete against 10 AI investors with different strategies</li>
              <li>Learn investment concepts through gamified simulation</li>
              <li>Track portfolio performance on public leaderboards</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">How MTK Works</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Starting Balance:</strong> All users receive $1,000,000 MTK for free</li>
              <li><strong>Investment:</strong> Use MTK to buy &quot;shares&quot; in startup pitches</li>
              <li><strong>Dynamic Pricing:</strong> Prices increase as total investment volume grows (Formula: Price = $100 × (1 + Total Volume / 1M))</li>
              <li><strong>Portfolio Value:</strong> Your total wealth = Available MTK + Current Value of Holdings</li>
              <li><strong>Leaderboard Ranking:</strong> Compete to have the highest total portfolio value</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">AI Investor Personalities</h3>
            <p className="mb-2">Compete against 10 AI investors:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>The Boomer - Conservative</div>
              <div>Steady Eddie - Diversified</div>
              <div>YOLO Kid - All-in Risk</div>
              <div>Diamond Hands - Hold Forever</div>
              <div>Silicon Brain - Tech Only</div>
              <div>Cloud Surfer - SaaS Only</div>
              <div>FOMO Master - Momentum</div>
              <div>Hype Train - Trend Follow</div>
              <div>The Contrarian - Buy Low</div>
              <div>The Oracle - Perfect Timing</div>
            </div>
          </section>

          <section className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded p-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Legal Requirements</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Age Requirement:</strong> You must be at least 13 years old to use RIZE</li>
              <li><strong>Account Responsibility:</strong> You are responsible for maintaining account security</li>
              <li><strong>Educational Purpose:</strong> RIZE is designed for learning and entertainment only</li>
              <li><strong>No Guarantees:</strong> We make no promises about service availability or data persistence</li>
            </ul>
          </section>

          <section className="bg-gray-800 border border-gray-600 rounded p-4">
            <h3 className="text-lg font-bold text-gray-300 mb-2">Limitations of Liability</h3>
            <p className="mb-2">By using RIZE, you acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>RIZE is provided &quot;AS IS&quot; without warranties of any kind</li>
              <li>We are NOT responsible for any loss of MTK, portfolio data, or account information</li>
              <li>We reserve the right to modify, suspend, or discontinue the service at any time without notice</li>
              <li>We are NOT liable for technical issues, data loss, or service interruptions</li>
              <li>Leaderboard rankings and AI investor behavior may change without notice</li>
              <li>We may reset balances, adjust algorithms, or modify game mechanics for balancing purposes</li>
            </ul>
          </section>

          <section className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded p-4">
            <h3 className="text-lg font-bold text-blue-400 mb-2">Educational Value</h3>
            <p>
              RIZE teaches real investment concepts including portfolio diversification, risk management, 
              market timing, and strategy analysis. Study the AI investors to learn different approaches 
              to investing. Remember: this is practice for understanding concepts, NOT real investing advice.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-white mb-2">Full Terms of Service</h3>
            <p>
              By clicking &quot;I Agree,&quot; you accept our{' '}
              <a href="/terms" target="_blank" className="text-pink-400 underline hover:text-pink-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-pink-400 underline hover:text-pink-300">
                Privacy Policy
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isLegalAge}
              onChange={(e) => setIsLegalAge(e.target.checked)}
              className="w-5 h-5 text-pink-500 border-gray-600 rounded focus:ring-pink-500"
            />
            <span className="text-white">
              I am at least 13 years old
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-5 h-5 text-pink-500 border-gray-600 rounded focus:ring-pink-500"
            />
            <span className="text-white">
              I understand that MTK has no real value and RIZE is for educational/entertainment purposes only. 
              I accept all terms and limitations of liability.
            </span>
          </label>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleDecline}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={!hasAgreed || !isLegalAge}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              hasAgreed && isLegalAge
                ? 'bg-pink-500 hover:bg-pink-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            I Agree - Start Playing
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Last Updated: October 29, 2025 | RIZE by Manaboodle
        </p>
      </div>
    </div>
  );
}
