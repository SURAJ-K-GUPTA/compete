'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bot, 
  Search, 
  PenTool, 
  FileSearch, 
  MessageSquare,
  RefreshCcw,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnalysisResult } from '@/components/AnalysisResult'

interface AIAgent {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  action: () => Promise<void>
}

interface AnalysisResponse {
  analysis: {
    summary: string
    score: number
  }
  suggestions: Array<{
    id: string
    type: "replace" | "add" | "delete"
    position: {
      type: "after" | "before" | "replace"
      reference: string
      start: number
      end: number
    }
    content: {
      original: string
      replacement: string
    }
    reasoning: string
  }>
}

export function AISidePanel({ 
  content, 
  onUpdateContent,
  onPreviewChange 
}: { 
  content: string
  onUpdateContent: (newContent: string) => void
  onPreviewChange: (suggestion: Suggestion) => void
}) {
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set())

  const agents: AIAgent[] = [
    {
      id: 'meta',
      name: 'Meta Description Analyzer',
      description: 'Analyze and suggest improvements for meta description',
      icon: <Search className="h-4 w-4" />,
      action: async () => {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, task: 'meta' }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setResult(data)
      }
    },
    {
      id: 'intro',
      name: 'Intro Rewriter',
      description: 'Rewrite and improve introduction',
      icon: <PenTool className="h-4 w-4" />,
      action: async () => {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, task: 'intro' }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setResult(data)
      }
    },
    {
      id: 'seo',
      name: 'SEO Analyzer',
      description: 'Analyze content for SEO optimization',
      icon: <FileSearch className="h-4 w-4" />,
      action: async () => {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, task: 'seo' }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setResult(data)
      }
    },
    {
      id: 'tone',
      name: 'Tone Adjuster',
      description: 'Analyze and adjust content tone',
      icon: <MessageSquare className="h-4 w-4" />,
      action: async () => {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, task: 'tone' }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setResult(data)
      }
    }
  ]

  const handleApplySuggestion = (suggestion: Suggestion) => {
    let newContent = content
    
    switch (suggestion.type) {
      case 'replace':
        const before = content.slice(0, suggestion.position.start)
        const after = content.slice(suggestion.position.end)
        newContent = before + suggestion.content.replacement + after
        break
        
      case 'add':
        if (suggestion.position.type === 'before') {
          const index = content.indexOf(suggestion.position.reference)
          if (index !== -1) {
            newContent = content.slice(0, index) + 
                        suggestion.content.replacement + 
                        content.slice(index)
          }
        } else { // after
          const index = content.indexOf(suggestion.position.reference)
          if (index !== -1) {
            const insertAt = index + suggestion.position.reference.length
            newContent = content.slice(0, insertAt) + 
                        suggestion.content.replacement + 
                        content.slice(insertAt)
          }
        }
        break
        
      case 'delete':
        newContent = content.slice(0, suggestion.position.start) + 
                    content.slice(suggestion.position.end)
        break
    }
    
    onUpdateContent(newContent)
  }

  const handleRejectSuggestion = (suggestionId: string) => {
    setRejectedSuggestions(prev => new Set([...prev, suggestionId]))
  }

  const handlePreviewSuggestion = (suggestion: Suggestion) => {
    onPreviewChange(suggestion)
  }

  const runAgent = async (agent: AIAgent) => {
    setActiveAgent(agent.id)
    setLoading(true)
    setResult(null)
    
    try {
      await agent.action()
    } catch (error) {
      setResult({
        analysis: {
          summary: "Error occurred",
          score: 0
        },
        suggestions: [{
          id: 'error-1',
          type: 'replace',
          position: { type: 'replace', reference: '', start: 0, end: 0 },
          content: { original: '', replacement: '' },
          reasoning: error instanceof Error ? error.message : "An unknown error occurred"
        }]
      })
    }
    
    setLoading(false)
  }

  return (
    <div className="w-96 border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-900">
          <Bot className="h-5 w-5" />
          <h2 className="font-medium">AI Agents</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className={cn(
                "p-4 cursor-pointer hover:border-gray-300 transition-colors",
                activeAgent === agent.id && "border-blue-500"
              )}
              onClick={() => runAgent(agent)}
            >
              <div className="flex items-center gap-3">
                {agent.icon}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{agent.name}</h3>
                  <p className="text-xs text-gray-500">{agent.description}</p>
                </div>
                {loading && activeAgent === agent.id && (
                  <RefreshCcw className="h-4 w-4 animate-spin text-blue-500" />
                )}
                {!loading && activeAgent === agent.id && (
                  <Sparkles className="h-4 w-4 text-blue-500" />
                )}
              </div>
            </Card>
          ))}
        </div>

        {result && (
          <div className="p-4 border-t border-gray-200">
            <AnalysisResult
              analysis={result.analysis.summary}
              suggestions={result.suggestions.filter(s => !rejectedSuggestions.has(s.id))}
              onApply={handleApplySuggestion}
              onReject={handleRejectSuggestion}
              onPreview={handlePreviewSuggestion}
            />
          </div>
        )}
      </div>
    </div>
  )
} 