'use client'

import { useState } from 'react'
import { Editor } from '@/components/Editor'
import { URLInput } from '@/components/URLInput'
import { AISidePanel } from '@/components/AISidePanel'
import { Card } from '@/components/ui/card'

export default function Home() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewSuggestion, setPreviewSuggestion] = useState<Suggestion | null>(null)

  const handleURLSubmit = async (url: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()
      setContent(data.content)
    } catch (error) {
      console.error('Error scraping URL:', error)
    }
    setLoading(false)
  }

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent)
    setPreviewSuggestion(null)
  }

  const handlePreviewChange = (suggestion: Suggestion) => {
    setPreviewSuggestion(suggestion)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1500px] h-screen flex flex-col">
        <div className="flex-none p-4 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-medium text-center text-gray-900 mb-6">
              Web Content Scraper & Editor
            </h1>
            <Card className="p-6 border-gray-200 shadow-sm">
              <URLInput onSubmit={handleURLSubmit} loading={loading} />
            </Card>
          </div>
        </div>

        {content && (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
              <div className="max-w-4xl mx-auto">
                <Card className="p-6 border-gray-200 shadow-sm">
                  <Editor 
                    initialContent={content} 
                    onUpdate={handleContentUpdate}
                    previewSuggestion={previewSuggestion}
                  />
                </Card>
              </div>
            </div>
            <AISidePanel 
              content={content} 
              onUpdateContent={handleContentUpdate}
              onPreviewChange={handlePreviewChange}
            />
          </div>
        )}
      </div>
    </main>
  )
} 