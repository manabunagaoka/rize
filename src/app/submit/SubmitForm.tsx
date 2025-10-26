'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'EdTech',
  'HealthTech',
  'FinTech',
  'Social Impact',
  'Consumer',
  'Enterprise/B2B',
  'Climate/Sustainability',
  'Other'
];

const STAGES = [
  'Idea',
  'Prototype',
  'Beta/Testing',
  'Launched',
  'Revenue'
];

const TRACTION_TYPES = [
  { value: 'users', label: 'Users' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'funding', label: 'Funding Raised' },
  { value: 'featured', label: 'Featured In' },
  { value: 'award', label: 'Award/Recognition' }
];

interface SubmitFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    classCode: string;
  };
}

export default function SubmitForm({ user }: SubmitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    startup_name: '',
    one_liner: '',
    elevator_pitch: '',
    category: '',
    founders: '',
    stage: '',
    traction_type: '',
    traction_value: '',
    website_url: '',
    problem_statement: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/submit-startup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user.id,
          user_email: user.email,
          user_name: user.name,
          user_class: user.classCode
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit startup');
      }

      // Success! Redirect to home
      router.push('/?submitted=true');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Startup Name */}
      <div>
        <label htmlFor="startup_name" className="block text-sm font-semibold text-gray-200 mb-2">
          Startup Name <span className="text-pink-400">*</span>
        </label>
        <input
          type="text"
          id="startup_name"
          name="startup_name"
          required
          value={formData.startup_name}
          onChange={handleChange}
          placeholder="e.g., HealthTech AI"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
        />
      </div>

      {/* One-liner */}
      <div>
        <label htmlFor="one_liner" className="block text-sm font-semibold text-gray-200 mb-2">
          One-line Description <span className="text-pink-400">*</span>
          <span className="text-gray-400 font-normal ml-2">(max 50 characters)</span>
        </label>
        <input
          type="text"
          id="one_liner"
          name="one_liner"
          required
          maxLength={50}
          value={formData.one_liner}
          onChange={handleChange}
          placeholder="e.g., AI-powered medical diagnosis"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          {formData.one_liner.length}/50 characters
        </p>
      </div>

      {/* Elevator Pitch */}
      <div>
        <label htmlFor="elevator_pitch" className="block text-sm font-semibold text-gray-200 mb-2">
          Elevator Pitch <span className="text-pink-400">*</span>
          <span className="text-gray-400 font-normal ml-2">(max 200 characters)</span>
        </label>
        <textarea
          id="elevator_pitch"
          name="elevator_pitch"
          required
          maxLength={200}
          rows={3}
          value={formData.elevator_pitch}
          onChange={handleChange}
          placeholder="Describe what your startup does and the problem it solves..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          {formData.elevator_pitch.length}/200 characters
        </p>
      </div>

      {/* Category & Stage (Side by side) */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-200 mb-2">
            Category <span className="text-pink-400">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:outline-none"
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="stage" className="block text-sm font-semibold text-gray-200 mb-2">
            Stage <span className="text-pink-400">*</span>
          </label>
          <select
            id="stage"
            name="stage"
            required
            value={formData.stage}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:outline-none"
          >
            <option value="">Select stage...</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Founders */}
      <div>
        <label htmlFor="founders" className="block text-sm font-semibold text-gray-200 mb-2">
          Founders <span className="text-pink-400">*</span>
        </label>
        <input
          type="text"
          id="founders"
          name="founders"
          required
          value={formData.founders}
          onChange={handleChange}
          placeholder="e.g., Sarah Chen '26, John Doe '25"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          Include names and class years
        </p>
      </div>

      {/* Traction (Optional) */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Something to Brag About? (Optional)
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="traction_type" className="block text-sm font-semibold text-gray-200 mb-2">
              Achievement Type
            </label>
            <select
              id="traction_type"
              name="traction_type"
              value={formData.traction_type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:outline-none"
            >
              <option value="">None</option>
              {TRACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="traction_value" className="block text-sm font-semibold text-gray-200 mb-2">
              Value
            </label>
            <input
              type="text"
              id="traction_value"
              name="traction_value"
              value={formData.traction_value}
              onChange={handleChange}
              placeholder="e.g., 500 users, $10K, TechCrunch"
              disabled={!formData.traction_type}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Website (Optional) */}
      <div>
        <label htmlFor="website_url" className="block text-sm font-semibold text-gray-200 mb-2">
          Website or Demo (Optional)
        </label>
        <input
          type="url"
          id="website_url"
          name="website_url"
          value={formData.website_url}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
        />
      </div>

      {/* Problem Statement (Optional) */}
      <div>
        <label htmlFor="problem_statement" className="block text-sm font-semibold text-gray-200 mb-2">
          Problem You&apos;re Solving (Optional)
          <span className="text-gray-400 font-normal ml-2">(max 100 characters)</span>
        </label>
        <input
          type="text"
          id="problem_statement"
          name="problem_statement"
          maxLength={100}
          value={formData.problem_statement}
          onChange={handleChange}
          placeholder="e.g., 40% of patients can't afford diagnosis"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          {formData.problem_statement.length}/100 characters
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">
          Your submission will be reviewed within 24 hours
        </p>
      </div>
    </form>
  );
}
