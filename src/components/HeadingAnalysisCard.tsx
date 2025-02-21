'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeadingSuggestion } from '@/types';
import { FiChevronDown, FiChevronUp, FiArrowUp } from 'react-icons/fi';

interface Props {
  suggestion: HeadingSuggestion;
  onPreview: () => void;
}

export default function HeadingAnalysisCard({ suggestion, onPreview }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="border border-blue-100 rounded-xl p-4 hover:bg-blue-50 transition-colors mb-4"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            suggestion.priority <= 2 ? 'bg-red-100 text-red-700' :
            suggestion.priority <= 4 ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            P{suggestion.priority}
          </span>
          <span className="text-sm font-medium text-blue-900 capitalize">
            {suggestion.type}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
        >
          {isExpanded ? (
            <>Show Less <FiChevronUp size={14} /></>
          ) : (
            <>Show More <FiChevronDown size={14} /></>
          )}
        </button>
      </div>

      <div className={`space-y-3 ${isExpanded ? '' : 'line-clamp-3'}`}>
        <div>
          <h4 className="text-xs text-gray-500 mb-1">Current</h4>
          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
            {suggestion.original}
          </p>
        </div>

        <div>
          <h4 className="text-xs text-gray-500 mb-1">Suggested</h4>
          <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg">
            {suggestion.suggested}
          </p>
        </div>

        <div>
          <h4 className="text-xs text-gray-500 mb-1">Reasoning</h4>
          <p className="text-xs text-gray-600">
            {suggestion.reasoning}
          </p>
        </div>

        {suggestion.position > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FiArrowUp size={12} />
            <span>Move to position {suggestion.position}</span>
          </div>
        )}
      </div>

      <button
        onClick={onPreview}
        className="w-full mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
      >
        Preview Changes
      </button>
    </motion.div>
  );
} 