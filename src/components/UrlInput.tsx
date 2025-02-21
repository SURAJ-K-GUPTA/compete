'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiSearch } from 'react-icons/fi';

interface Props {
  onAnalyze: (targetUrl: string, competitorUrls: string[]) => void;
}

/**
 * Form component for entering target and competitor URLs
 * Provides dynamic input fields with validation and submission handling
 */
export default function URLInputForm({ onAnalyze }: Props) {
  const [targetUrl, setTargetUrl] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCompetitor = () => {
    setCompetitorUrls([...competitorUrls, '']);
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validCompetitors = competitorUrls.filter(url => url.trim() !== '');
      await onAnalyze(targetUrl, validCompetitors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Website URL
          </label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://your-website.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competitor URLs
          </label>
          <div className="space-y-3">
            {competitorUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleCompetitorChange(index, e.target.value)}
                  placeholder={`https://competitor-${index + 1}.com`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCompetitor(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <FiMinus size={20} />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleAddCompetitor}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <FiPlus size={20} />
            Add Competitor
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          <FiSearch size={20} />
          {isSubmitting ? 'Analyzing...' : 'Analyze SEO'}
        </button>
      </div>
    </motion.form>
  );
} 