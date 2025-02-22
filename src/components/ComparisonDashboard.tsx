'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebsiteData, MetaAnalysis, HeadingAnalysis, CustomAgent } from '@/types';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import MetaCard from './MetaCard';
import SuggestionCard from './SuggestionCard';
import PreviewEditor from './PreviewEditor';
import HeadingAnalysisDashboard from './HeadingAnalysisDashboard';
import CustomAgentDashboard from './CustomAgentDashboard';
import AddAgentModal from './AddAgentModal';
import Toast from './ui/Toast';
import MetaAnalysisAgent from './agents/MetaAnalysisAgent';
import HeadingAnalysisAgent from './agents/HeadingAnalysisAgent';
import CustomAgentCard from './agents/CustomAgentCard';
import DeleteAgentDialog from './DeleteAgentDialog';

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
  const [reanalyzingAgents, setReanalyzingAgents] = useState<string[]>([]);
  const [agentToDelete, setAgentToDelete] = useState<CustomAgent | null>(null);

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

  // Update delete handler
  const handleDeleteAgent = (agentId: string) => {
    const agent = customAgents.find(a => a.id === agentId);
    if (agent) {
      setAgentToDelete(agent);
    }
  };

  // Add confirmDelete handler
  const confirmDelete = () => {
    if (agentToDelete) {
      setCustomAgents(agents => agents.filter(a => a.id !== agentToDelete.id));
      if (expandedAgent === agentToDelete.id) {
        setExpandedAgent(null);
      }
      setAgentToDelete(null);
    }
  };

  // Update handleReanalyze
  const handleReanalyze = async (agentId: string) => {
    setReanalyzingAgents(prev => [...prev, agentId]);
    
    try {
      if (agentId === 'meta' || agentId === 'headings') {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            targetUrl: targetSite.url,
            competitorUrls: competitors.map(c => c.url)
          })
        });
        const data = await response.json();
        if (data.success) {
          if (agentId === 'meta') {
            analysis.meta = data.analysis.meta;
          } else {
            analysis.headings = data.analysis.headings;
          }
        }
      } else {
        const agent = customAgents.find(a => a.id === agentId);
        if (!agent) return;

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
          setCustomAgents(agents => agents.map(a => 
            a.id === agentId ? { ...a, analysis: data.analysis } : a
          ));
        }
      }
    } catch (err) {
      setError('Failed to reanalyze');
    } finally {
      setReanalyzingAgents(prev => prev.filter(id => id !== agentId));
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
          {/* Meta Analysis */}
          <MetaAnalysisAgent
            analysis={analysis.meta}
            targetSite={targetSite}
            isExpanded={expandedAgent === 'meta'}
            isReanalyzing={reanalyzingAgents.includes('meta')}
            onToggle={() => setExpandedAgent(expandedAgent === 'meta' ? null : 'meta')}
            onReanalyze={() => handleReanalyze('meta')}
            onPreview={setSelectedPreview}
          />

          {/* Heading Analysis */}
          <HeadingAnalysisAgent
            analysis={analysis.headings ?? null}
            isExpanded={expandedAgent === 'headings'}
            isReanalyzing={reanalyzingAgents.includes('headings')}
            onToggle={() => setExpandedAgent(expandedAgent === 'headings' ? null : 'headings')}
            onReanalyze={() => handleReanalyze('headings')}
            onPreview={setSelectedPreview}
            html={targetSite.content}
          />

          {/* Custom Agents */}
          {customAgents.map(agent => (
            <CustomAgentCard
              key={agent.id}
              agent={agent}
              targetSite={targetSite}
              competitors={competitors}
              isExpanded={expandedAgent === agent.id}
              isReanalyzing={reanalyzingAgents.includes(agent.id)}
              onToggle={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
              onReanalyze={() => handleReanalyze(agent.id)}
              onDelete={() => handleDeleteAgent(agent.id)}
              onPreview={setSelectedPreview}
            />
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

      {/* Delete Agent Dialog */}
      <DeleteAgentDialog
        agentName={agentToDelete?.name || ''}
        isOpen={!!agentToDelete}
        onConfirm={confirmDelete}
        onCancel={() => setAgentToDelete(null)}
      />
    </>
  );
} 