'use client'

import { Card } from '@/components/ui/card'
import { SuggestionPreview } from '@/components/SuggestionPreview'

interface Analysis {
  summary: string
  score: number
}

interface Suggestion {
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
}

interface AnalysisResultProps {
  analysis: Analysis
  suggestions: Suggestion[]
  onApply: (suggestion: Suggestion) => void
  onReject: (suggestionId: string) => void
  onPreview: (suggestion: Suggestion) => void
}

export function AnalysisResult({ 
  analysis, 
  suggestions, 
  onApply, 
  onReject,
  onPreview 
}: AnalysisResultProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Analysis Summary</h3>
          <span className={`px-2 py-1 rounded-full text-sm ${
            analysis.score >= 80 ? "bg-green-100 text-green-700" :
            analysis.score >= 60 ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}>
            Score: {analysis.score}/100
          </span>
        </div>
        <p className="text-sm text-gray-700">{analysis.summary}</p>
      </Card>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <SuggestionPreview
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={onApply}
            onReject={onReject}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  )
} 