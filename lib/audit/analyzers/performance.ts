import { logger } from '@/lib/utils/logger';

let lighthouse: typeof import('lighthouse');
let chromeLauncher: typeof import('chrome-launcher');

// Dynamically import Lighthouse only on server-side
async function initLighthouse() {
  if (!lighthouse) {
    lighthouse = await import('lighthouse');
  }
  if (!chromeLauncher) {
    chromeLauncher = await import('chrome-launcher');
  }
  return { lighthouse, chromeLauncher };
}

interface PerformanceResult {
  score: number;
  report: {
    metrics: {
      FCP: { score: number; value: number };
      LCP: { score: number; value: number };
      CLS: { score: number; value: number };
      TTI: { score: number; value: number };
      TBT: { score: number; value: number };
      SI: { score: number; value: number };
    };
    opportunities: Array<{
      title: string;
      description: string;
      score: number;
      savings: number;
    }>;
  };
}

export async function analyzePerformance(url: string): Promise<PerformanceResult> {
  try {
    const { lighthouse, chromeLauncher } = await initLighthouse();
    
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });

    const options = {
      logLevel: 'error',
      output: 'json',
      port: chrome.port,
      onlyCategories: ['performance'],
    };

    try {
      const runnerResult = await lighthouse(url, options);
      await chrome.kill();

      if (!runnerResult) {
        throw new Error('Lighthouse analysis failed');
      }

      const audits = runnerResult.lhr.audits;

      const metrics = {
        FCP: {
          score: audits['first-contentful-paint'].score || 0,
          value: audits['first-contentful-paint'].numericValue,
        },
        LCP: {
          score: audits['largest-contentful-paint'].score || 0,
          value: audits['largest-contentful-paint'].numericValue,
        },
        CLS: {
          score: audits['cumulative-layout-shift'].score || 0,
          value: audits['cumulative-layout-shift'].numericValue,
        },
        TTI: {
          score: audits['interactive'].score || 0,
          value: audits['interactive'].numericValue,
        },
        TBT: {
          score: audits['total-blocking-time'].score || 0,
          value: audits['total-blocking-time'].numericValue,
        },
        SI: {
          score: audits['speed-index'].score || 0,
          value: audits['speed-index'].numericValue,
        },
      };

      const opportunities = Object.values(audits)
        .filter(audit => audit.details?.type === 'opportunity')
        .map(audit => ({
          title: audit.title,
          description: audit.description,
          score: audit.score || 0,
          savings: audit.details?.overallSavingsMs || 0,
        }));

      return {
        score: runnerResult.lhr.categories.performance.score * 100,
        report: {
          metrics,
          opportunities,
        },
      };
    } catch (error) {
      await chrome.kill();
      throw error;
    }
  } catch (error) {
    logger.error('Performance analysis failed:', error);
    return {
      score: 0,
      report: {
        metrics: {
          FCP: { score: 0, value: 0 },
          LCP: { score: 0, value: 0 },
          CLS: { score: 0, value: 0 },
          TTI: { score: 0, value: 0 },
          TBT: { score: 0, value: 0 },
          SI: { score: 0, value: 0 },
        },
        opportunities: [],
      },
    };
  }
} 