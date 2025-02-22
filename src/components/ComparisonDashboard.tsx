'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebsiteData, MetaAnalysis, HeadingAnalysis, CustomAgent } from '@/types';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from 'react-icons/fi';
import MetaCard from './MetaCard';
import SuggestionCard from './SuggestionCard';
import PreviewEditor from './PreviewEditor';
import HeadingAnalysisDashboard from './HeadingAnalysisDashboard';
import CustomAgentDashboard from './CustomAgentDashboard';
import AddAgentModal from './AddAgentModal';
import Toast from './ui/Toast';

interface Props {
  analysis: {
    meta: MetaAnalysis;
    headings?: HeadingAnalysis | null;
  };
  targetSite: WebsiteData;
  competitors: WebsiteData[];
}

/**
 * Main dashboard component for displaying SEO analysis results
 * Shows metadata comparisons, suggestions, and preview functionality
 */
export default function SEOComparisonDashboard({ analysis, targetSite, competitors }: Props) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<{
    type: 'title' | 'description' | 'heading' | 'custom';
    original: string;
    suggested: string;
    html?: string;
    context?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state when new analysis comes in
  useEffect(() => {
    setSelectedPreview(null);
    // Reset custom agents' analysis to trigger re-analysis
    setCustomAgents(agents => agents.map(agent => ({
      ...agent,
      analysis: null
    })));
  }, [analysis, targetSite, competitors]);

  // Run custom agent analyses when data changes
  useEffect(() => {
    const analyzeAgents = async () => {
      const updatedAgents = await Promise.all(
        customAgents.map(async (agent) => {
          if (agent.analysis) return agent;
          
          try {
            const response = await fetch('/api/analyze/custom', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: agent.prompt,
                targetSite,
                competitors
              })
            });
            const data = await response.json();
            if (data.success) {
              return { ...agent, analysis: data.analysis };
            }
          } catch (err) {
            console.error('Custom agent analysis failed:', err);
          }
          return agent;
        })
      );
      
      setCustomAgents(updatedAgents);
    };

    if (customAgents.some(agent => !agent.analysis)) {
      analyzeAgents();
    }
  }, [targetSite, competitors]);

  const handleAddAgent = async (name: string, prompt: string) => {
    const newAgent: CustomAgent = {
      id: `custom-${Date.now()}`,
      name,
      prompt,
      analysis: null
    };
    setCustomAgents([...customAgents, newAgent]);
    setExpandedAgent(newAgent.id);
  };

  // Add delete handler
  const handleDeleteAgent = (agentId: string) => {
    setCustomAgents(agents => agents.filter(a => a.id !== agentId));
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
    }
  };

  return (
    <>
      <div className="flex gap-8">
        {/* Left side - Live Preview (70%) */}
        <div className="w-[70%]">
          <div className="sticky top-4">
            <PreviewEditor
              preview={selectedPreview}
              onClose={() => setSelectedPreview(null)}
              targetSite={targetSite}
            />
          </div>
        </div>

        {/* Right side - Analysis Cards (30%) */}
        <div className="w-[30%] space-y-4">
          {/* Meta Analysis Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedAgent(expandedAgent === 'meta' ? null : 'meta')}
              className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
            >
              <h3 className="text-lg font-medium text-gray-800">Meta Analysis</h3>
              {expandedAgent === 'meta' ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <AnimatePresence>
              {expandedAgent === 'meta' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4"
                >
                  <MetaCard
                    title="Title Analysis"
                    score={analysis.meta.titleScore}
                    length={analysis.meta.titleLength}
                    maxLength={60}
                    original={targetSite.title}
                  />
                  {analysis.meta.suggestions
                    .filter(s => s.type === 'title')
                    .map((suggestion, index) => (
                      <SuggestionCard
                        key={`title-${index}`}
                        suggestion={suggestion}
                        onPreview={() => {
                          setSelectedPreview({
                            type: suggestion.type,
                            original: suggestion.original,
                            suggested: suggestion.suggested
                          });
                        }}
                      />
                    ))}
                  <MetaCard
                    title="Description Analysis"
                    score={analysis.meta.descriptionScore}
                    length={analysis.meta.descriptionLength}
                    maxLength={155}
                    original={targetSite.metaDescription}
                  />
                  {analysis.meta.suggestions
                    .filter(s => s.type === 'description')
                    .map((suggestion, index) => (
                      <SuggestionCard
                        key={`description-${index}`}
                        suggestion={suggestion}
                        onPreview={() => {
                          setSelectedPreview({
                            type: suggestion.type,
                            original: suggestion.original,
                            suggested: suggestion.suggested
                          });
                        }}
                      />
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Heading Analysis Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedAgent(expandedAgent === 'headings' ? null : 'headings')}
              className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
            >
              <h3 className="text-lg font-medium text-gray-800">Heading Analysis</h3>
              {expandedAgent === 'headings' ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <AnimatePresence>
              {expandedAgent === 'headings' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4"
                >
                  <HeadingAnalysisDashboard
                    analysis={analysis.headings}
                    onPreview={(suggestion) => {
                      setSelectedPreview({
                        type: 'heading',
                        original: suggestion.original,
                        suggested: suggestion.suggested,
                        html: targetSite.content
                      });
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom Agent Cards */}
          {customAgents.map(agent => (
            <div key={agent.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                <button
                  onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                  className="flex-1 text-left"
                >
                  <h3 className="text-lg font-medium text-gray-800">{agent.name}</h3>
                </button>
                <div className="flex items-center gap-2">
                  {expandedAgent === agent.id ? <FiChevronUp /> : <FiChevronDown />}
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="ml-2 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {expandedAgent === agent.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <CustomAgentDashboard
                      agent={agent}
                      targetSite={targetSite}
                      competitors={competitors}
                      onPreview={(preview) => {
                        setSelectedPreview(preview);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Add Agent Button */}
          <button
            onClick={() => setShowAddAgent(true)}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
          >
            <FiPlus />
            <span>Add Custom Agent</span>
          </button>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddAgent && (
        <AddAgentModal
          onAdd={handleAddAgent}
          onClose={() => setShowAddAgent(false)}
        />
      )}

      {/* Error Toast */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </>
  );
} 