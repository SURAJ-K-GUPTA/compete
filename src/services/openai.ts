import OpenAI from 'openai';
import { WebsiteData, MetaAnalysis, HeadingAnalysis } from '@/types';
import { config } from '@/config/env';

const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

/**
 * Analyzes website metadata using OpenAI to provide SEO recommendations
 * Compares target site with competitors and generates actionable insights
 */
export async function analyzeSEOMetadata(
  targetSite: WebsiteData,
  competitors: WebsiteData[]
): Promise<{ meta: MetaAnalysis; headings: HeadingAnalysis | null }> {
  const defaultMetaAnalysis: MetaAnalysis = {
    titleLength: targetSite.title.length,
    descriptionLength: targetSite.metaDescription.length,
    titleScore: 0,
    descriptionScore: 0,
    powerWords: [],
    searchIntent: '',
    uniqueValue: '',
    suggestions: []
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are an SEO expert. Analyze the provided website metadata and its competitors to generate SEO recommendations. And make sure each property is returned in correct form" },
        { role: "user", content: `
          Analyze the following website meta information and its competitors:
          
          Target Site:
          URL: ${targetSite.url}
          Title: ${targetSite.title} (${targetSite.title.length} chars)
          Meta Description: ${targetSite.metaDescription} (${targetSite.metaDescription.length} chars)
          
          Competitors:
          ${competitors.map(comp => `
            URL: ${comp.url}
            Title: ${comp.title} (${comp.title.length} chars)
            Meta Description: ${comp.metaDescription} (${comp.metaDescription.length} chars)
          `).join('\n')}
        `}
      ],
      functions: [
        {
          name: "analyze_metadata",
          description: "Analyzes website metadata and provides SEO recommendations.",
          parameters: {
            type: "object",
            properties: {
              titleLength: { type: "number" },
              descriptionLength: { type: "number" },
              titleScore: { type: "number", minimum: 0, maximum: 100 },
              descriptionScore: { type: "number", minimum: 0, maximum: 100 },
              powerWords: { type: "array", items: { type: "string" } },
              searchIntent: { type: "string" },
              uniqueValue: { type: "string" },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["title", "description"] },
                    original: { type: "string" },
                    suggested: { type: "string" },
                    reasoning: { type: "string" },
                    powerWords: { type: "array", items: { type: "string" } },
                    improvement: { type: "string" }
                  },
                  required: ["type", "original", "suggested", "reasoning", "powerWords", "improvement"]
                }
              }
            },
            required: ["titleLength", "descriptionLength", "titleScore", "descriptionScore", "powerWords", "searchIntent", "uniqueValue", "suggestions"]
          }
        }
      ],
      function_call: { name: "analyze_metadata" },
      temperature: 0.7,
    });

    const functionCall = response.choices[0].message.function_call;
    if (functionCall && functionCall.name === "analyze_metadata") {
      const parsedResponse = JSON.parse(functionCall.arguments);
      return {
        meta: { ...defaultMetaAnalysis, ...parsedResponse },
        headings: null // Heading analysis will be handled separately
      };
    } else {
      throw new Error("Function call not returned by the model.");
    }
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    return {
      meta: defaultMetaAnalysis,
      headings: null
    };
  }
}