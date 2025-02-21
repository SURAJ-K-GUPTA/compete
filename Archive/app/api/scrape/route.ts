import { NextResponse } from 'next/server'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    
    const response = await fetch(url)
    const html = await response.text()
    
    const dom = new JSDOM(html)
    const reader = new Readability(dom.window.document)
    const article = reader.parse()
    
    if (!article) {
      return NextResponse.json(
        { error: 'Could not extract content' },
        { status: 400 }
      )
    }

    return NextResponse.json({ content: article.content })
  } catch (error) {
    console.error('Error scraping content:', error)
    return NextResponse.json(
      { error: 'Failed to scrape content' },
      { status: 500 }
    )
  }
} 