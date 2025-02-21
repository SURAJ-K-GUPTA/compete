'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, ChevronRight, ChevronDown, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface SuggestionPreviewProps {
  suggestion: Suggestion
  onAccept: (suggestion: Suggestion) => void
  onReject: (suggestionId: string) => void
  onPreview: (suggestion: Suggestion) => void
}

export function SuggestionPreview({ 
  suggestion, 
  onAccept, 
  onReject,
  onPreview 
}: SuggestionPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getActionLabel = () => {
    switch (suggestion.type) {
      case 'add': return 'Add'
      case 'delete': return 'Delete'
      case 'replace': return 'Replace'
      default: return 'Change'
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {getActionLabel()} Suggestion
                </span>
                <span className={cn(
                  "px-2 py-0.5 text-xs rounded-full",
                  suggestion.type === 'add' ? "bg-green-100 text-green-700" :
                  suggestion.type === 'delete' ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                )}>
                  {suggestion.position.type}
                </span>
              </div>
              <p className="text-sm text-gray-500">{suggestion.reasoning}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onPreview(suggestion)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onReject(suggestion.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => onAccept(suggestion)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-2">
            {suggestion.content.original && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Original:</p>
                <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                  {suggestion.content.original}
                </p>
              </div>
            )}
            {suggestion.content.replacement && (
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {suggestion.type === 'add' ? 'New Content:' : 'Replacement:'}
                </p>
                <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                  {suggestion.content.replacement}
                </p>
              </div>
            )}
            {suggestion.position.type !== 'replace' && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Position:</p>
                <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                  {suggestion.position.type === 'before' ? 'Before: ' : 'After: '}
                  "{suggestion.position.reference}"
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Reasoning:</p>
              <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 