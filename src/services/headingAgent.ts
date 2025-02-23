import OpenAI from 'openai';
import { WebsiteData, HeadingAnalysis } from '@/types';
import { config } from '@/config/env';

const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

interface HeadingStructure {
  level: number;
  text: string;
  position: number;
}

export async function analyzeHeadingStructure(
  targetSite: WebsiteData,
  competitors: WebsiteData[],
  searchTerms: string[] = []
): Promise<HeadingAnalysis> {
  const defaultAnalysis: HeadingAnalysis = {
    headingDepthScore: 0,
    topicCoverage: 0,
    missingTopics: [],
    searchTermOptimization: 0,
    hierarchyScore: 0,
    suggestions: [],
    competitorInsights: []
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an SEO expert. Analyze the heading structure and topic organization of the provided website and its competitors."
        },
        {
          role: "user",
          content: `
            Analyze the heading structure and topic organization:

            Target Site:
            URL: ${targetSite.url}
            Headings: ${JSON.stringify(targetSite.headings)}
            
            Competitors:
            ${competitors.map(comp => `
              URL: ${comp.url}
              Headings: ${JSON.stringify(comp.headings)}
            `).join('\n')}

            Search Terms: ${searchTerms.join(', ')}
          `
        }
      ],
      functions: [
        {
          name: "analyze_headings",
          description: "Analyzes the heading structure and topic organization of a website and its competitors.",
          parameters: {
            type: "object",
            properties: {
              headingDepthScore: { type: "number", minimum: 0, maximum: 100 },
              topicCoverage: { type: "number", minimum: 0, maximum: 100 },
              missingTopics: { type: "array", items: { type: "string" } },
              searchTermOptimization: { type: "number", minimum: 0, maximum: 100 },
              hierarchyScore: { type: "number", minimum: 0, maximum: 100 },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["structure", "topic", "searchTerm", "hierarchy"] },
                    original: { type: "string" },
                    suggested: { type: "string" },
                    reasoning: { type: "string" },
                    priority: { type: "number", minimum: 1, maximum: 5 },
                    position: { type: "number" }
                  },
                  required: ["type", "original", "suggested", "reasoning", "priority", "position"]
                }
              },
              competitorInsights: { type: "array", items: { type: "string" } }
            },
            required: [
              "headingDepthScore",
              "topicCoverage",
              "missingTopics",
              "searchTermOptimization",
              "hierarchyScore",
              "suggestions",
              "competitorInsights"
            ]
          }
        }
      ],
      function_call: { name: "analyze_headings" },
      temperature: 0.7,
    });

    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.name === "analyze_headings") {
      const parsedResponse = JSON.parse(functionCall.arguments);
      return { ...defaultAnalysis, ...parsedResponse };
    } else {
      throw new Error("Function call not returned by the model.");
    }
  } catch (error) {
    console.error('Heading analysis failed:', error);
    return defaultAnalysis;
  }
}