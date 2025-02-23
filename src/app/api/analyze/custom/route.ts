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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: body.systemPrompt || "You are an SEO and content analysis expert. Analyze the target website based on the provided criteria and use competitors as reference."
        },
        {
          role: "user",
          content:`
            Analyze the following website and its competitors based on this criteria:
            ${body.userPrompt || body.prompt}

            Target Site:
            URL: ${body.targetSite.url}
            Title: ${body.targetSite.title}
            Content: ${body.targetSite.content}
            
            Competitors:
            ${body.competitors.map((comp: WebsiteData) => `
              URL: ${comp.url}
              Title: ${comp.title}
              Content: ${comp.content}
            `).join('\n')}

            Only analyze the target site based on the criteria and use competitors as only for reference.
            You can give any number of suggestions for the target site but give suggestions separately for each paragraph.
          `
        }
      ],
      functions: [
        {
          name: "analyze_custom_content",
          description: "Analyzes the target website based on the provided criteria and uses competitors as reference.",
          parameters: {
            type: "object",
            properties: {
              score: { type: "number", minimum: 0, maximum: 100 },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    original: { type: "string" },
                    suggested: { type: "string" },
                    reasoning: { type: "string" },
                    score: { type: "number" }
                  },
                  required: ["original", "suggested", "reasoning", "score"]
                }
              },
              insights: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["score", "suggestions", "insights"]
          }
        }
      ],
      function_call: { name: "analyze_custom_content" },
      temperature: 0.7,
    });

    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.name === "analyze_custom_content") {
      const analysis = JSON.parse(functionCall.arguments) as CustomAnalysis;
      return NextResponse.json({
        success: true,
        analysis
      });
    } else {
      throw new Error("Function call not returned by the model.");
    }
  } catch (error) {
    console.error('Custom analysis failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run custom analysis',
      analysis: null
    }, { status: 500 });
  }
}