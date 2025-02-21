'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect, useState } from 'react';
import { Preview, WebsiteData } from '@/types';
import { FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight, FiLink, FiType } from 'react-icons/fi';
import { Level } from '@tiptap/extension-heading';

interface Props {
  website: WebsiteData;
  preview: Preview | null;
  onAccept?: (change: { old: string; new: string; type: string }) => void;
  onReject?: () => void;
}

export default function TipTapEditor({ website, preview, onAccept, onReject }: Props) {
  const [originalContent, setOriginalContent] = useState('');

  // Update editor content when website changes
  useEffect(() => {
    const formattedContent = `
      <div class="website-content">
        <h1 class="website-title">${website.title}</h1>
        <p class="meta-description">${website.metaDescription}</p>
        <div class="content">
          ${website.content}
        </div>
      </div>
    `;
    setOriginalContent(formattedContent);
    
    // Update editor content if it exists
    if (editor) {
      editor.commands.setContent(formattedContent);
    }
  }, [website]); // Add website as dependency

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Underline,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: originalContent,
    editable: true,
  });

  useEffect(() => {
    if (!editor || !preview) return;

    const { type, original, suggested } = preview;
    
    // Reset content
    editor.commands.setContent(originalContent);

    const highlightedContent = `
      <span style="background-color: #fee2e2; color: #dc2626; text-decoration: line-through; padding: 0 2px;">${original}</span>
      <span style="background-color: #dcfce7; color: #16a34a; padding: 0 2px; margin-left: 4px;">${suggested}</span>
    `;

    // Function to find and replace text while preserving HTML structure
    const findAndReplaceText = (content: string, searchText: string, replacement: string) => {
      // Escape special characters in the search text for regex
      const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create a regex that matches the text, including potential HTML tags within
      const regex = new RegExp(
        `(${escapedSearch.replace(/\s+/g, '\\s*(?:<[^>]+>\\s*)*')})`
      );

      return content.replace(regex, replacement);
    };

    // Handle different types of previews
    switch (type) {
      case 'title':
        const content = editor.getHTML();
        const newTitleContent = findAndReplaceText(content, original, highlightedContent);
        editor.commands.setContent(newTitleContent);
        break;

      case 'description':
        const descContent = editor.getHTML();
        const newDescContent = findAndReplaceText(descContent, original, highlightedContent);
        editor.commands.setContent(newDescContent);
        break;

      case 'heading':
      case 'custom':
        const otherContent = editor.getHTML();
        const newContent = findAndReplaceText(otherContent, original, highlightedContent);
        editor.commands.setContent(newContent);
        break;
    }

  }, [editor, preview, originalContent]);

  // Update the accept handler to handle complex replacements
  const handleAccept = () => {
    if (!editor || !preview) return;

    const { type, original, suggested } = preview;
    
    const content = editor.getHTML();
    
    // Replace the highlighted spans with suggested text
    const newContent = content.replace(
      /<span[^>]*>(?:[^<]|<(?!\/span>))*<\/span>\s*<span[^>]*>(?:[^<]|<(?!\/span>))*<\/span>/g,
      suggested
    );
    
    editor.commands.setContent(newContent);
    setOriginalContent(newContent);
    onAccept?.({ 
      old: original, 
      new: suggested,
      type: type 
    });
  };

  // Update the reject handler
  const handleReject = () => {
    if (!editor) return;
    editor.commands.setContent(originalContent);
    setOriginalContent(originalContent);
    onReject?.();
  };

  if (!editor) return null;

  return (
    <div className="relative border rounded-lg">
      {/* Toolbar with Accept/Reject */}
      <div className="border-b p-2 flex justify-between bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <FiBold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <FiItalic />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <FiUnderline />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <FiAlignLeft />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <FiAlignCenter />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <FiAlignRight />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value) as Level;
              editor.chain().focus().toggleHeading({ level }).run();
            }}
            className="px-2 py-1 rounded border"
          >
            <option value="">Normal</option>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={level} value={level}>
                Heading {level}
              </option>
            ))}
          </select>
        </div>

        {/* Accept/Reject buttons in toolbar */}
        {preview && (
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="prose max-w-none p-4">
        <EditorContent editor={editor} />
      </div>

      {/* Bubble Menu */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 bg-white shadow-lg rounded-lg border p-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <FiBold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <FiItalic size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <FiUnderline size={14} />
            </button>
          </div>
        </BubbleMenu>
      )}
    </div>
  );
} 