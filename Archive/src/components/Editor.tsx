import React, { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface EditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

const Editor: React.FC<EditorProps> = ({ 
  initialContent = '<p>Hello World</p>',
  onChange 
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleUpdate = useCallback(({ editor }: { editor: TiptapEditor }) => {
    onChange?.(editor.getHTML())
  }, [onChange])
  
  const editor = useEditor({
    editable: true,
    content: initialContent,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
    ],
    onBeforeCreate: ({ editor }) => {
      setIsMounted(true)
    },
    onError: (error) => {
      setError(error)
      console.error('Editor error:', error)
    },
    onUpdate: handleUpdate
  })

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  if (error) {
    return <div>Error initializing editor: {error.message}</div>
  }

  if (!isMounted || !editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="editor-wrapper">
      <EditorContent editor={editor} />
    </div>
  )
}

export default Editor 