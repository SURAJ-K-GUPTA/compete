import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  preview: {
    type: 'title' | 'description';
    original: string;
    suggested: string;
  };
  onClose: () => void;
}

/**
 * Modal component for comparing original and suggested metadata
 * Provides side-by-side view with animations for better UX
 */
export default function MetadataPreviewModal({ preview, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl p-6 max-w-2xl w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-semibold text-blue-900 mb-6 capitalize">
            {preview.type} Preview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{preview.original}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">{preview.suggested}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Preview
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 