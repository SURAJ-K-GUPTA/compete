'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CustomAgent, WebsiteData, Preview } from '@/types';
import { FiAlertCircle } from 'react-icons/fi';

interface Props {
  agent: CustomAgent | undefined;
  targetSite: WebsiteData;
  competitors: WebsiteData[];
  onPreview: (preview: Preview) => void;
}

export default function CustomAgentDashboard({ agent, targetSite, competitors, onPreview }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agent && !agent.analysis) {
      setIsLoading(true);
      fetch('/api/analyze/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: agent.prompt,
          targetSite,
          competitors
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          agent.analysis = data.analysis;
        }
      })
      .catch(() => setError('Failed to run analysis'))
      .finally(() => setIsLoading(false));
    }
  }, [agent, targetSite, competitors]);

  if (!agent) return null;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">{agent.name}</h3>
        <div className="text-sm text-gray-600">{agent.prompt}</div>
      </div>

      {agent.analysis ? (
        <>
          <div className="bg-white rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis Score</h4>
            <div className="text-2xl font-semibold text-blue-600">
              {agent.analysis.score}/100
            </div>
          </div>

          {agent.analysis.insights.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Insights</h4>
              <ul className="space-y-2">
                {agent.analysis.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-blue-700">• {insight}</li>
                ))}
              </ul>
            </div>
          )}

          {agent.analysis.suggestions.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">Suggestions</h4>
              <div className="grid gap-4">
                {agent.analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Score Impact: +{suggestion.score}
                      </span>
                      <button
                        onClick={() => onPreview({
                          type: 'custom',
                          original: suggestion.original,
                          suggested: suggestion.suggested,
                          context: agent.name,
                          html: targetSite.content
                        })}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Preview
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">Current: {suggestion.original}</p>
                      <p className="text-blue-600">Suggested: {suggestion.suggested}</p>
                      <p className="text-gray-500">{suggestion.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : error ? (
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-600">
            <FiAlertCircle />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
} 