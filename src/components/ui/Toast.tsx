'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiX } from 'react-icons/fi';

interface Props {
  message: string;
  type?: 'error' | 'warning' | 'success';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'error', onClose, duration = 5000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
          type === 'error' ? 'bg-red-50 text-red-700' :
          type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
          'bg-green-50 text-green-700'
        }`}>
          <FiAlertCircle size={20} />
          <p className="text-sm">{message}</p>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <FiX size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 