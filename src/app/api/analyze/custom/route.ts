import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WebsiteData, CustomAnalysis } from '@/types';
import { config } from '@/config/env';

const openai = new OpenAI({
  apiKey: config.openai.apiKey
});
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, targetSite, competitors } = body as {
      prompt: string;
      targetSite: WebsiteData;
      competitors: WebsiteData[];
    };

    if (!prompt || !targetSite) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        analysis: null
      }, { status: 400 });
    }

    const analysisPrompt = `
      Analyze the following website and its competitors based on this criteria:
      ${prompt}

      Target Site:
      URL: ${targetSite.url}
      Title: ${targetSite.title}
      Content: ${targetSite.content}
      
      Competitors:
      ${competitors.map(comp => `
        URL: ${comp.url}
        Title: ${comp.title}
        Content: ${comp.content}
      `).join('\n')}

      Only analyze the target site based on the criteria and use competitors as only for reference.
      You can give any number of suggestions for the target site but give suggestions separately for each paragraph.

      Return a JSON response with:
      {
        "score": number (0-100),
        "suggestions": [
          {
            "original": "text that needs improvement",
            "suggested": "improved version",
            "reasoning": "why this change helps",
            "score": number (improvement impact)
          }
        ],
        "insights": [
          "key insight about the analysis",
          "competitive advantage or disadvantage",
          "other relevant observations"
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '{}';
    const analysis = JSON.parse(content) as CustomAnalysis;

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Custom analysis failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run custom analysis',
      analysis: null
    }, { status: 500 });
  }
} 