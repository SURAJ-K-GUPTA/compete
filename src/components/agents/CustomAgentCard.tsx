import { FiChevronDown, FiChevronUp, FiRefreshCw, FiTrash2, FiEdit } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomAgent, WebsiteData } from '@/types';
import CustomAgentDashboard from '../CustomAgentDashboard';
import { useState, useEffect } from 'react';
import PromptEditorDialog from '../PromptEditorDialog';

interface Props {
  agent: CustomAgent;
  targetSite: WebsiteData;
  competitors: WebsiteData[];
  isExpanded: boolean;
  isReanalyzing: boolean;
  onToggle: () => void;
  onReanalyze: () => void;
  onDelete: () => void;
  onPreview: (preview: any) => void;
  setCustomAgents: React.Dispatch<React.SetStateAction<CustomAgent[]>>;
}

export default function CustomAgentCard({
  agent,
  targetSite,
  competitors,
  isExpanded,
  isReanalyzing,
  onToggle,
  onReanalyze,
  onDelete,
  onPreview,
  setCustomAgents
}: Props) {
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  useEffect(() => {
    console.log('Agent updated:', agent);
  }, [agent]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
        <button onClick={onToggle} className="flex-1 text-left">
          <h3 className="text-lg font-medium text-gray-800">{agent.name}</h3>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromptEditor(true)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
            title="Edit Prompts"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={onReanalyze}
            className={`p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full ${
              isReanalyzing ? 'animate-spin' : ''
            }`}
            disabled={isReanalyzing}
            title="Reanalyze"
          >
            <FiRefreshCw size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
          >
            <FiTrash2 size={16} />
          </button>
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
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
              onPreview={onPreview}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {showPromptEditor && (
        <PromptEditorDialog
          isOpen={showPromptEditor}
          onClose={() => setShowPromptEditor(false)}
          onSave={(systemPrompt, userPrompt) => {
            setCustomAgents(agents => agents.map(a => 
              a.id === agent.id ? { 
                ...a, 
                systemPrompt: systemPrompt || undefined,
                userPrompt: userPrompt || undefined,
                analysis: null
              } : a
            ));
            setShowPromptEditor(false);
            onReanalyze();
          }}
          initialSystemPrompt={agent.systemPrompt || "You are an SEO and content analysis expert. Analyze the target website based on the provided criteria and use competitors as reference."}
          initialUserPrompt={agent.userPrompt || agent.prompt}
        />
      )}
    </div>
  );
} 