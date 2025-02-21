import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { SYSTEM_PROMPT, TASK_PROMPTS } from './config'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { content, task } = await req.json()

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `
Analyze this content and provide specific suggestions for improvement.
Format your response exactly as shown in the schema, with clear original/replacement text pairs.

Content to analyze:
${content}

Remember:
1. For text additions, specify the reference text and whether to add before/after
2. For replacements, include both original and new text
3. Keep reasoning short and clear
4. Provide exact text to change, not general suggestions`
        }
      ],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 2000
    })

    // Log the raw response for debugging
    console.log('Raw AI response:', completion.choices[0].message.content)

    let result
    try {
      // Try to clean the response if it contains backticks or markdown formatting
      const rawContent = completion.choices[0].message.content || '{}'
      const cleanContent = rawContent
        .replace(/```json\n?/g, '') // Remove JSON code block start
        .replace(/```\n?/g, '')     // Remove code block end
        .trim()                      // Remove whitespace
      
      result = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('JSON Parse error:', parseError)
      // Return a more graceful error response instead of throwing
      return NextResponse.json({
        analysis: {
          summary: "Failed to parse AI response. Please try again.",
          score: 0
        },
        suggestions: []
      }, { status: 500 })
    }

    // Validate and ensure the response has the correct structure
    if (!result.analysis || !result.suggestions) {
      console.error('Invalid response structure:', result)
      return NextResponse.json({
        analysis: {
          summary: "AI response was not in the expected format. Please try again.",
          score: 0
        },
        suggestions: []
      }, { status: 500 })
    }

    // Add unique IDs to suggestions if they don't exist
    const processedResult = {
      ...result,
      suggestions: result.suggestions.map((suggestion: any, index: number) => ({
        ...suggestion,
        id: suggestion.id || `${task}-${index + 1}`
      }))
    }

    return NextResponse.json(processedResult)

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      analysis: {
        summary: "An error occurred while analyzing the content",
        score: 0
      },
      suggestions: []
    }, { status: 500 })
  }
} 