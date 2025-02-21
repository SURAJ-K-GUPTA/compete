'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WebsiteData, MetaAnalysis, HeadingAnalysis } from '@/types';
import ComparisonDashboard from '@/components/ComparisonDashboard';
import UrlInput from '@/components/UrlInput';
import LoadingState from '@/components/LoadingState';
import ErrorMessage from '@/components/ErrorMessage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    meta: MetaAnalysis;
    headings?: HeadingAnalysis | null;
  } | null>(null);
  const [targetSite, setTargetSite] = useState<WebsiteData | null>(null);
  const [competitors, setCompetitors] = useState<WebsiteData[]>([]);

  const handleAnalysis = async (targetUrl: string, competitorUrls: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl, competitorUrls })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysis({
        meta: data.analysis,
        headings: null
      });
      setTargetSite(data.targetSite);
      setCompetitors(data.competitors);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.h1 
            className="text-4xl font-bold text-blue-900 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            SEO Meta Comparison Tool
          </motion.h1>

          <UrlInput onAnalyze={handleAnalysis} />

          {error && <ErrorMessage message={error} />}
          {loading && <LoadingState />}

          {analysis && targetSite && (
            <ComparisonDashboard
              analysis={analysis}
              targetSite={targetSite}
              competitors={competitors}
            />
          )}
        </div>
      </main>
    </ErrorBoundary>
  );
} 