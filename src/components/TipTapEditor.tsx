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
import { marked } from 'marked';

interface Props {
  website: WebsiteData;
  preview: Preview | null;
  onAccept?: (change: { old: string; new: string; type: string }) => void;
  onReject?: () => void;
}

export const markdownToPlainText = (markdown: string): string => {
    // Remove links but keep the label
    markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
  
    // Remove bold (**text**) and italic (*text*)
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    markdown = markdown.replace(/\*(.*?)\*/g, '$1'); // Italic
    markdown = markdown.replace(/__(.*?)__/g, '$1'); // Bold (alternative syntax)
    markdown = markdown.replace(/_(.*?)_/g, '$1'); // Italic (alternative syntax)
  
    // Remove inline code (`code`)
    markdown = markdown.replace(/`([^`]+)`/g, '$1');
  
    // Remove blockquotes
    markdown = markdown.replace(/^> ?(.*)/gm, '$1');
  
    // Remove images ![alt](url)
    markdown = markdown.replace(/!\[.*?\]\(.*?\)/g, '');
  
    // Convert headings (#, ##, ###, etc.) to plain text
    markdown = markdown.replace(/#+\s?(.*)/g, '$1');
  
    // Remove horizontal rules (---, ***)
    markdown = markdown.replace(/^[-*_]{3,}$/gm, '');
  
    // Convert unordered lists (- item, * item, + item) to plain text
    markdown = markdown.replace(/^\s*[-*+]\s+/gm, '- ');
  
    // Convert numbered lists (1. item) to plain text
    markdown = markdown.replace(/^\s*\d+\.\s+/gm, '1. ');
  
    // Remove strikethrough (~~text~~)
    markdown = markdown.replace(/~~(.*?)~~/g, '$1');
  
    // Remove tables (basic support)
    markdown = markdown.replace(/^\|.*\|$/gm, ''); // Remove table rows
    markdown = markdown.replace(/[-:|]+\s*/g, ''); // Remove table dividers
  
    // Remove HTML tags (optional, if markdown contains HTML)
    markdown = markdown.replace(/<[^>]+>/g, '');
  
    // Remove extra spaces and trim
    markdown = markdown.replace(/\s+/g, ' '); // Replace multiple spaces with one
    markdown = markdown.replace(/\n{2,}/g, '\n'); // Reduce multiple newlines to one
  
    return markdown.trim();
  };

export default function TipTapEditor({ website, preview, onAccept, onReject }: Props) {
  const [originalContent, setOriginalContent] = useState('');

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
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });

  // Update editor content when website changes
  useEffect(() => {
    // Convert markdown content to HTML using marked
    const formattedContent = `
      <div class="website-content">
        <h1 class="website-title">${website.title}</h1>
        <p class="meta-description">${website.metaDescription}</p>
        <div class="content">
          ${marked(website.content)}
        </div>
      </div>
    `;
    setOriginalContent(formattedContent);
    
    // Update editor content if it exists
    if (editor) {
      editor.commands.setContent(formattedContent);
    }
  }, [website, editor]);

  useEffect(() => {
    if (!editor || !preview) return;

    const { type, original, suggested } = preview;
    
    // Reset content
    editor.commands.setContent(originalContent);

    const highlightedContent = `
      <span style="background-color: #fee2e2; color: #dc2626; text-decoration: line-through; padding: 0 2px;">${original}</span>
      <span style="background-color: #dcfce7; color: #16a34a; padding: 0 2px; margin-left: 4px;">${suggested}</span>
    `;

    // Handle different types of previews
    switch (type) {
      case 'title':
        // Replace title text directly
        const content = editor.getHTML();
        const newTitleContent = content.replace(
          original,
          highlightedContent
        );
        editor.commands.setContent(newTitleContent);
        break;

      case 'description':
        // Replace description text directly
        const descContent = editor.getHTML();
        const newDescContent = descContent.replace(
          original,
          highlightedContent
        );
        editor.commands.setContent(newDescContent);
        break;

      case 'heading':
      case 'custom':
        // For headings and custom content
        const otherContent = editor.getHTML();
        const newContent = otherContent.replace(
          original,
          highlightedContent
        );
        editor.commands.setContent(newContent);
        break;
    }

  }, [editor, preview, originalContent]);

  // Update the accept handler to properly remove strikethrough text
  const handleAccept = () => {
    if (!editor || !preview) return;

    const { type, original, suggested } = preview;

    const plainOriginal = markdownToPlainText(original);
    
    // Get current content
    const content = editor.getHTML();
    
    // Create a temporary div to handle HTML string manipulation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find and replace the highlighted spans
    const highlightedSpans = tempDiv.querySelectorAll('span');
    highlightedSpans.forEach((span) => {
      if (span.textContent?.includes(original)) {
        const parentElement = span.parentElement;
        if (parentElement) {
          // Find the next span (suggested text)
          const nextSpan = span.nextElementSibling;
          if (nextSpan) {
            // Replace both spans with suggested text
            const textNode = document.createTextNode(suggested);
            parentElement.replaceChild(textNode, span);
            parentElement.removeChild(nextSpan);
          }
        }
      }
    });

    // Update editor content
    editor.commands.setContent(tempDiv.innerHTML);
    setOriginalContent(tempDiv.innerHTML);
    
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
      {/* Toolbar with Accept/Reject - Stays fixed */}
      <div className="sticky top-0 z-10 border-b p-2 flex justify-between bg-gray-50">
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

      {/* Scrollable Editor Content */}
      <div className="overflow-y-auto max-h-[600px] prose-container">
        <div className="prose max-w-none p-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Bubble Menu - with proper checks */}
      {editor && editor.isEditable && (
        <BubbleMenu 
          editor={editor} 
          shouldShow={({ editor, view, state, from, to }) => {
            // Only show menu when there's a text selection
            const { empty } = editor.state.selection;
            const hasText = !empty;
            
            // Check if selection is valid
            const isValidSelection = from !== to;
            
            return hasText && isValidSelection;
          }}
          tippyOptions={{ 
            duration: 100,
            placement: 'top',
            // Add fallback options
            appendTo: () => document.body,
            getReferenceClientRect: () => {
              const { ranges } = editor.state.selection;
              const from = ranges[0].$from;
              const to = ranges[0].$to;
              
              if (from && to) {
                const node = editor.view.nodeDOM(from.pos);
                if (node instanceof Element) {
                  return node.getBoundingClientRect();
                }
              }
              
              // Fallback to editor container
              return editor.view.dom.getBoundingClientRect();
            }
          }}
        >
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