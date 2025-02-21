'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MetaSuggestion } from '@/types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Props {
  suggestion: MetaSuggestion;
  onPreview: () => void;
}

/**
 * Displays SEO improvement suggestions with power words and reasoning
 * Provides interactive preview functionality for suggested changes
 */
export default function SEOSuggestionCard({ suggestion, onPreview }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHasOverflow(contentRef.current.scrollHeight > contentRef.current.clientHeight);
    }
  }, [suggestion]);

  return (
    <motion.div
      className="border border-blue-100 rounded-xl p-4 aspect-square hover:bg-blue-50 transition-colors mb-4 flex flex-col"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Analysis Content - Takes most of the space */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-blue-900 capitalize break-words hyphens-auto">
            {suggestion.type}
          </h3>
          {hasOverflow && (
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
          )}
        </div>

        <div
          ref={contentRef}
          className={`space-y-2 ${isExpanded ? '' : 'max-h-[calc(100%-40px)]'} overflow-hidden transition-all duration-200`}
        >
          <p className="text-xs text-gray-600 break-words hyphens-auto whitespace-pre-wrap">
            {suggestion.reasoning}
          </p>

          <div>
            <h4 className="text-xs text-gray-500 mb-1">Power Words</h4>
            <div className="flex flex-wrap gap-1">
              {suggestion.powerWords.map((word, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full break-words hyphens-auto"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs text-gray-500">Improvement</h4>
            <p className="text-xs text-blue-700 break-words hyphens-auto whitespace-pre-wrap">
              {suggestion.improvement}
            </p>
          </div>
        </div>
      </div>

      {/* Preview Button - Fixed at bottom with minimal height */}
      <button
        onClick={onPreview}
        className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 shrink-0"
      >
        Preview Changes
      </button>
    </motion.div>
  );
} 