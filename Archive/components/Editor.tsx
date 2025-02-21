'use client'

import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Strikethrough,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
  Highlighter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface EditorProps {
  initialContent: string
  onUpdate?: (content: string) => void
  previewSuggestion?: Suggestion | null
}

interface PreviewState {
  originalContent: string
  previewContent: string
  active: boolean
}

export function Editor({ initialContent, onUpdate, previewSuggestion }: EditorProps) {
  const [preview, setPreview] = useState<{
    active: boolean
    originalContent: string
  }>({
    active: false,
    originalContent: ''
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-100 rounded px-1',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none focus:outline-none min-h-[200px] mt-4 px-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
  })

  useEffect(() => {
    if (previewSuggestion && editor) {
      // Store current content
      const currentContent = editor.getHTML()
      setPreview({
        active: true,
        originalContent: currentContent
      })

      // Apply preview changes
      let previewContent = currentContent
      switch (previewSuggestion.type) {
        case 'replace':
          previewContent = currentContent.slice(0, previewSuggestion.position.start) +
                          previewSuggestion.content.replacement +
                          currentContent.slice(previewSuggestion.position.end)
          break
          
        case 'add':
          if (previewSuggestion.position.type === 'before') {
            const index = currentContent.indexOf(previewSuggestion.position.reference)
            if (index !== -1) {
              previewContent = currentContent.slice(0, index) +
                             previewSuggestion.content.replacement +
                             currentContent.slice(index)
            }
          } else {
            const index = currentContent.indexOf(previewSuggestion.position.reference)
            if (index !== -1) {
              const insertAt = index + previewSuggestion.position.reference.length
              previewContent = currentContent.slice(0, insertAt) +
                             previewSuggestion.content.replacement +
                             currentContent.slice(insertAt)
            }
          }
          break
          
        case 'delete':
          previewContent = currentContent.slice(0, previewSuggestion.position.start) +
                          currentContent.slice(previewSuggestion.position.end)
          break
      }

      editor.setEditable(false)
      editor.commands.setContent(previewContent)
    }
  }, [previewSuggestion, editor])

  const cancelPreview = () => {
    if (editor && preview.active) {
      editor.setEditable(true)
      editor.commands.setContent(preview.originalContent)
      setPreview({ active: false, originalContent: '' })
    }
  }

  const acceptPreview = () => {
    if (editor && preview.active) {
      const newContent = editor.getHTML()
      editor.setEditable(true)
      setPreview({ active: false, originalContent: '' })
      onUpdate?.(newContent)
    }
  }

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Enter URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 pb-4 border-b border-gray-200">
        <div className="flex gap-1 items-center pr-3 border-r border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 items-center pr-3 border-r border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('bold') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('italic') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('strike') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('highlight') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 items-center pr-3 border-r border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 items-center pr-3 border-r border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('bulletList') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('orderedList') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('blockquote') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 items-center pr-3 border-r border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('link') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "hover:bg-gray-100",
              editor.isActive('code') ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
            )}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="text-gray-700 hover:bg-gray-100"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="text-gray-700 hover:bg-gray-100"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {preview.active && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-yellow-600">Preview Mode</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelPreview}
              className="text-red-600 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={acceptPreview}
              className="text-green-600 hover:bg-green-50"
            >
              Apply
            </Button>
          </div>
        )}
      </div>
      <EditorContent editor={editor} className="focus:outline-none" />
    </div>
  )
} 