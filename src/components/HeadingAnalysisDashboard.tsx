'use client';

import { HeadingAnalysis, HeadingSuggestion } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import HeadingAnalysisCard from './HeadingAnalysisCard';
import { FiAlertCircle } from 'react-icons/fi';

interface Props {
  analysis?: HeadingAnalysis | null;
  onPreview: (suggestion: HeadingSuggestion) => void;
  isLoading?: boolean;
}

export default function HeadingAnalysisDashboard({ analysis, onPreview, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scores Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard
          title="Heading Depth"
          score={analysis?.headingDepthScore || 0}
          description="Structure and nesting of headings"
        />
        <ScoreCard
          title="Topic Coverage"
          score={analysis?.topicCoverage || 0}
          description="Coverage of key topics vs competitors"
        />
        <ScoreCard
          title="Search Terms"
          score={analysis?.searchTermOptimization || 0}
          description="Optimization for search terms"
        />
        <ScoreCard
          title="Hierarchy"
          score={analysis?.hierarchyScore || 0}
          description="Information organization"
        />
      </div>

      {/* Missing Topics */}
      {(analysis?.missingTopics?.length ?? 0) > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Missing Topics</h3>
          <div className="flex flex-wrap gap-2">
            {analysis?.missingTopics?.map((topic, index) => (
              <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Insights */}
      {(analysis?.competitorInsights?.length ?? 0) > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Competitor Insights</h3>
          <ul className="space-y-2">
            {analysis?.competitorInsights?.map((insight, index) => (
              <li key={index} className="text-xs text-blue-700 flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {(analysis?.suggestions?.length ?? 0) > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Suggested Improvements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis?.suggestions?.sort((a, b) => a.priority - b.priority)
              .map((suggestion, index) => (
                <HeadingAnalysisCard
                  key={index}
                  suggestion={suggestion}
                  onPreview={() => onPreview(suggestion)}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">No suggestions available at this time</p>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, score, description }: { title: string; score: number; description: string }) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold text-blue-600">{score}</span>
        <span className="text-sm text-gray-500">/100</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </motion.div>
  );
} 