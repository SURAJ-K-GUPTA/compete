'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebsiteData, Preview } from '@/types';
import { FiCode, FiEye, FiCopy, FiCheck, FiEdit3, FiMaximize2, FiX, FiBold, FiItalic, FiList, FiLink, FiSend, FiPlus, FiMinus } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Components } from 'react-markdown';
import { extractTitle } from '@/utils/extractMetadata';
import TipTapEditor from './TipTapEditor';

interface Props {
  preview: Preview | null;
  onClose: () => void;
  targetSite: WebsiteData;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const CodeBlock = ({ inline, className, children }: CodeBlockProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  if (!inline && match) {
    return (
      <div className="relative group">
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <SyntaxHighlighter
            language={match[1]}
            style={vs as any}
            PreTag="div"
            customStyle={{ 
              background: 'transparent', 
              padding: 0,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-white shadow-sm hover:bg-gray-50"
        >
          <FiCopy size={14} className="text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <code className="bg-gray-50 px-2 py-1 rounded-md text-gray-800 break-all">
      {children}
    </code>
  );
};

const DiffView = ({ original, edited }: { original: string; edited: string }) => {
  return (
    <div className="space-y-2 font-mono text-sm">
      <div className="flex items-start space-x-2 bg-red-50 p-2 rounded">
        <FiMinus className="text-red-500 mt-1" size={14} />
        <p className="text-red-700 whitespace-pre-wrap break-all">{original}</p>
      </div>
      <div className="flex items-start space-x-2 bg-green-50 p-2 rounded">
        <FiPlus className="text-green-500 mt-1" size={14} />
        <p className="text-green-700 whitespace-pre-wrap break-all">{edited}</p>
      </div>
    </div>
  );
};

export default function PreviewEditor({ preview, onClose, targetSite }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {preview?.type === 'custom' ? `${preview.context} Preview` : 'Content Preview'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <TipTapEditor
        key={targetSite.url}
        website={targetSite}
        preview={preview}
        onAccept={(change) => {
          console.log('Change accepted:', change);
          onClose();
        }}
        onReject={() => {
          onClose();
        }}
      />
    </div>
  );
} 