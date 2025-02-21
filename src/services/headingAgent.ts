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
  const prompt = `
    Analyze the heading structure and topic organization and return a JSON response:

    Target Site:
    URL: ${targetSite.url}
    Headings: ${JSON.stringify(targetSite.headings)}
    
    Competitors:
    ${competitors.map(comp => `
      URL: ${comp.url}
      Headings: ${JSON.stringify(comp.headings)}
    `).join('\n')}

    Search Terms: ${searchTerms.join(', ')}

    Analyze and provide in JSON format:
    1. Heading depth analysis (H2, H3, H4 usage)
    2. Topic segmentation comparison
    3. Missing key topics from competitors
    4. Search term optimization in headings
    5. Information hierarchy suggestions

    Return a JSON object with:
    {
      "headingDepthScore": number (0-100),
      "topicCoverage": number (0-100),
      "missingTopics": string[],
      "searchTermOptimization": number (0-100),
      "hierarchyScore": number (0-100),
      "suggestions": [
        {
          "type": "structure" | "topic" | "searchTerm" | "hierarchy",
          "original": string,
          "suggested": string,
          "reasoning": string,
          "priority": number (1-5),
          "position": number
        }
      ],
      "competitorInsights": string[]
    }
  `;

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
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '{}';
    const parsedResponse = JSON.parse(content);
    return { ...defaultAnalysis, ...parsedResponse };
  } catch (error) {
    console.error('Heading analysis failed:', error);
    return defaultAnalysis;
  }
}