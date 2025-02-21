import { NextResponse } from 'next/server';
import { analyzeHeadingStructure } from '@/services/headingAgent';
import { WebsiteData } from '@/types';
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetSite, competitors } = body as {
      targetSite: WebsiteData;
      competitors: WebsiteData[];
    };

    // Validate input
    if (!targetSite?.headings) {
      return NextResponse.json({
        success: false,
        error: 'Target site headings are required',
        analysis: null
      }, { status: 400 });
    }

    // Run heading analysis
    const analysis = await analyzeHeadingStructure(
      targetSite,
      competitors || [],
      [] // Optional search terms can be added here
    );

    // Return analysis results
    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Heading analysis failed:', error);
    // Return a structured error response
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze headings',
      analysis: null
    }, { status: 500 });
  }
} 