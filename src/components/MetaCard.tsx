'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Props {
  title: string;
  score: number;
  length: number;
  maxLength: number;
  original: string;
}

/**
 * Displays metadata analysis with visual indicators for length and score
 * Shows progress bars and highlights issues with character limits
 */
export default function MetadataAnalysisCard({ title, score, length, maxLength, original }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = Math.min(100, (length / maxLength) * 100);
  const isOverLimit = length > maxLength;

  const truncatedText = isExpanded ? original : original.slice(0, 50) + (original.length > 50 ? '...' : '');

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 aspect-square mb-4">
      <h2 className="text-lg font-semibold text-blue-900 mb-3 break-words hyphens-auto">
        {title}
      </h2>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Length</span>
            <span className={isOverLimit ? 'text-red-500' : 'text-green-500'}>
              {length}/{maxLength}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className={`h-1.5 rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-green-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Score</span>
            <span>{score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className="h-1.5 rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-medium text-gray-700">Current</h3>
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
          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg transition-all duration-200 break-words hyphens-auto whitespace-pre-wrap">
            {truncatedText}
          </p>
        </div>
      </div>
    </div>
  );
} 