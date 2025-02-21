import { motion } from 'framer-motion';

/**
 * Loading indicator component with animation
 * Displays during API calls and analysis processing
 */
export default function AnalysisLoadingSpinner() {
  return (
    <motion.div
      className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Analyzing websites...</p>
      </div>
    </motion.div>
  );
} 