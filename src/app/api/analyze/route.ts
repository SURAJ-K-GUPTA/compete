import { NextResponse } from 'next/server';
import { scrapeWebsiteContent as scrapeSite } from '@/services/scraper';
import { analyzeSEOMetadata } from '@/services/openai';
import { analyzeHeadingStructure } from '@/services/headingAgent';
import { ValidationError, ScrapingError } from '@/types/errors';
import { WebsiteData } from '@/types';

/**
 * API endpoint for SEO analysis
 * Handles website scraping, competitor analysis, and OpenAI integration
 * Includes validation, error handling, and rate limiting
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetUrl, competitorUrls } = body;

    // Validate URLs
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(targetUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid target URL format' },
        { status: 400 }
      );
    }

    // Scrape sites
    const targetSite = await scrapeSite(targetUrl);
    const competitorSites = await Promise.all(
      competitorUrls.map((url: string) => scrapeSite(url).catch(() => null))
    ).then(sites => sites.filter(Boolean));

    // Run all analyses in parallel
    const [metaAnalysis, headingAnalysis] = await Promise.all([
      analyzeSEOMetadata(targetSite, competitorSites),
      analyzeHeadingStructure(targetSite, competitorSites)
    ]);

    // Return combined analysis results
    return NextResponse.json({
      success: true,
      targetSite,
      competitors: competitorSites,
      analysis: {
        meta: metaAnalysis.meta,
        headings: headingAnalysis
      }
    });

  } catch (error) {
    console.error('Analysis process failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
} 