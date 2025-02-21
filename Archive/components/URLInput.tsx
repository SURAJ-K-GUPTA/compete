import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface URLInputProps {
  onSubmit: (url: string) => void
  loading: boolean
}

export function URLInput({ onSubmit, loading }: URLInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="url"
        placeholder="Enter URL to scrape..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 border-gray-200 focus-visible:ring-blue-500"
        required
      />
      <Button 
        type="submit" 
        disabled={loading}
        className="bg-gray-900 hover:bg-gray-800 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scraping...
          </>
        ) : (
          'Scrape'
        )}
      </Button>
    </form>
  )
} 