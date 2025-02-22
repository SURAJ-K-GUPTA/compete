import { FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { HeadingAnalysis } from '@/types';
import HeadingAnalysisDashboard from '../HeadingAnalysisDashboard';

interface Props {
  analysis: HeadingAnalysis | null;
  isExpanded: boolean;
  isReanalyzing: boolean;
  onToggle: () => void;
  onReanalyze: () => void;
  onPreview: (preview: any) => void;
  html?: string;
}

export default function HeadingAnalysisAgent({
  analysis,
  isExpanded,
  isReanalyzing,
  onToggle,
  onReanalyze,
  onPreview,
  html
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
        <button onClick={onToggle} className="flex-1 text-left">
          <h3 className="text-lg font-medium text-gray-800">Heading Analysis</h3>
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
            <HeadingAnalysisDashboard
              analysis={analysis}
              onPreview={(suggestion) => {
                onPreview({
                  type: 'heading',
                  original: suggestion.original,
                  suggested: suggestion.suggested,
                  html
                });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 