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
  const prompt = `
    Analyze the following website meta information and its competitors and return a JSON response:
    
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
    
    Return a JSON object with the following structure:
    {
      "titleLength": number,
      "descriptionLength": number,
      "titleScore": number (0-100),
      "descriptionScore": number (0-100),
      "powerWords": string[],
      "searchIntent": string,
      "uniqueValue": string,
      "suggestions": [
        {
          "type": "title" | "description",
          "original": string,
          "suggested": string,
          "reasoning": string,
          "powerWords": string[],
          "improvement": string
        }
      ]
    }

    Ensure all fields are present and properly formatted.
  `;

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
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '{}';
    const parsedResponse = JSON.parse(content);
    
    return {
      meta: { ...defaultMetaAnalysis, ...parsedResponse },
      headings: null // Heading analysis will be handled separately
    };
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    return {
      meta: defaultMetaAnalysis,
      headings: null
    };
  }
} 