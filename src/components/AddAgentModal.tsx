'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface Props {
  onAdd: (name: string, prompt: string) => void;
  onClose: () => void;
}

export default function AddAgentModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name, prompt);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div 
          className="bg-white rounded-xl p-6 max-w-lg w-full m-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Custom Analysis Agent</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Content Readability Agent"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Analysis Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want this agent to analyze..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Create Agent
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 