export interface WebsiteData {
  url: string;
  title: string;
  metaDescription: string;
  content: string;
  headings: {
    level: number;
    text: string;
    position: number;
  }[];
  metaKeywords: string[];
  readabilityScore?: number;
}

export interface ScrapeResult {
  targetSite: WebsiteData;
  competitors: WebsiteData[];
}

export interface MetaAnalysis {
  titleLength: number;
  descriptionLength: number;
  titleScore: number;
  descriptionScore: number;
  powerWords: string[];
  searchIntent: string;
  uniqueValue: string;
  suggestions: MetaSuggestion[];
}

export interface MetaSuggestion {
  type: 'title' | 'description';
  original: string;
  suggested: string;
  reasoning: string;
  powerWords: string[];
  improvement: string;
}

export interface HeadingAnalysis {
  headingDepthScore: number;
  topicCoverage: number;
  missingTopics: string[];
  searchTermOptimization: number;
  hierarchyScore: number;
  suggestions: HeadingSuggestion[];
  competitorInsights: string[];
}

export interface HeadingSuggestion {
  type: 'structure' | 'topic' | 'searchTerm' | 'hierarchy';
  original: string;
  suggested: string;
  reasoning: string;
  priority: number;
  position: number;
}

export interface CustomAgent {
  id: string;
  name: string;
  prompt: string;
  analysis: CustomAnalysis | null;
  systemPrompt?: string;
  userPrompt?: string;
}

export interface CustomAnalysis {
  score: number;
  suggestions: CustomSuggestion[];
  insights: string[];
}

export interface CustomSuggestion {
  original: string;
  suggested: string;
  reasoning: string;
  score: number;
}

export interface Preview {
  type: 'title' | 'description' | 'heading' | 'custom';
  original: string;
  suggested: string;
  html?: string;
  context?: string; // For custom suggestions context
} 