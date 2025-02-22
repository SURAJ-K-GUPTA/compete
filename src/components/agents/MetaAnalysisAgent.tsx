import { FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaAnalysis, WebsiteData } from '@/types';
import MetaCard from '../MetaCard';
import SuggestionCard from '../SuggestionCard';

interface Props {
  analysis: MetaAnalysis;
  targetSite: WebsiteData;
  isExpanded: boolean;
  isReanalyzing: boolean;
  onToggle: () => void;
  onReanalyze: () => void;
  onPreview: (preview: any) => void;
}

export default function MetaAnalysisAgent({
  analysis,
  targetSite,
  isExpanded,
  isReanalyzing,
  onToggle,
  onReanalyze,
  onPreview
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
        <button onClick={onToggle} className="flex-1 text-left">
          <h3 className="text-lg font-medium text-gray-800">Meta Analysis</h3>
        </button>
        <div className="flex items-center gap-2">
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
            <MetaCard
              title="Title Analysis"
              score={analysis.titleScore}
              length={analysis.titleLength}
              maxLength={60}
              original={targetSite.title}
            />
            {analysis.suggestions
              .filter(s => s.type === 'title')
              .map((suggestion, index) => (
                <SuggestionCard
                  key={`title-${index}`}
                  suggestion={suggestion}
                  onPreview={() => {
                    onPreview({
                      type: suggestion.type,
                      original: suggestion.original,
                      suggested: suggestion.suggested
                    });
                  }}
                />
              ))}
            <MetaCard
              title="Description Analysis"
              score={analysis.descriptionScore}
              length={analysis.descriptionLength}
              maxLength={155}
              original={targetSite.metaDescription}
            />
            {analysis.suggestions
              .filter(s => s.type === 'description')
              .map((suggestion, index) => (
                <SuggestionCard
                  key={`description-${index}`}
                  suggestion={suggestion}
                  onPreview={() => {
                    onPreview({
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
  );
} 