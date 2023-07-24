import axios from 'axios';
import { load } from 'cheerio';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

interface BundleResult {
  score: number;
  report: {
    totalSize: number;
    bundles: Array<{
      name: string;
      size: number;
      type: 'js' | 'css';
      gzipSize: number;
      treeshakeable: boolean;
      coverage: number;
    }>;
    issues: Array<{
      severity: 'high' | 'medium' | 'low';
      description: string;
      suggestion: string;
    }>;
    recommendations: Array<{
      type: string;
      impact: 'high' | 'medium' | 'low';
      description: string;
      potentialSavings: number;
    }>;
  };
}

async function analyzeJavaScriptBundles($: cheerio.Root): Promise<any[]> {
  const scripts = $('script[src]').toArray();
  const bundles = [];

  for (const script of scripts) {
    const src = $(script).attr('src');
    if (!src || src.includes('data:')) continue;

    try {
      const response = await axios.get(src, { responseType: 'text' });
      const content = response.data;
      const size = Buffer.byteLength(content);
      const gzipSize = (await gzipAsync(Buffer.from(content))).length;

      bundles.push({
        name: src.split('/').pop() || src,
        size,
        type: 'js' as const,
        gzipSize,
        treeshakeable: detectTreeshaking(content),
        coverage: await estimateCodeCoverage(content),
      });
    } catch (error) {
      console.warn(`Failed to analyze JS bundle: ${src}`, error);
    }
  }

  return bundles;
}

async function analyzeCSSBundles($: cheerio.Root): Promise<any[]> {
  const stylesheets = $('link[rel="stylesheet"]').toArray();
  const bundles = [];

  for (const stylesheet of stylesheets) {
    const href = $(stylesheet).attr('href');
    if (!href || href.includes('data:')) continue;

    try {
      const response = await axios.get(href, { responseType: 'text' });
      const content = response.data;
      const size = Buffer.byteLength(content);
      const gzipSize = (await gzipAsync(Buffer.from(content))).length;

      bundles.push({
        name: href.split('/').pop() || href,
        size,
        type: 'css' as const,
        gzipSize,
        treeshakeable: true,
        coverage: await estimateCSSCoverage(content, $),
      });
    } catch (error) {
      console.warn(`Failed to analyze CSS bundle: ${href}`, error);
    }
  }

  return bundles;
}

function detectTreeshaking(content: string): boolean {
  // Check for common module patterns that support tree-shaking
  return (
    content.includes('export ') ||
    content.includes('import ') ||
    content.includes('module.exports') ||
    content.includes('require(')
  );
}

async function estimateCodeCoverage(content: string): Promise<number> {
  // This is a simplified coverage estimation
  // In a real implementation, you'd want to use something like Istanbul
  const lines = content.split('\n');
  const nonEmptyLines = lines.filter(line => 
    line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('/*')
  ).length;
  
  // Assume 70% coverage as a baseline for now
  return 70;
}

async function estimateCSSCoverage(content: string, $: cheerio.Root): Promise<number> {
  const rules = content.match(/[^}]+{[^}]+}/g) || [];
  let usedRules = 0;

  for (const rule of rules) {
    const selector = rule.split('{')[0].trim();
    try {
      if ($(selector).length > 0) {
        usedRules++;
      }
    } catch {
      // Invalid selector, skip
    }
  }

  return Math.round((usedRules / rules.length) * 100);
}

function generateBundleRecommendations(bundles: any[]) {
  const issues: Array<{
    severity: 'high' | 'medium' | 'low';
    description: string;
    suggestion: string;
  }> = [];

  const recommendations: Array<{
    type: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
    potentialSavings: number;
  }> = [];

  // Check bundle sizes
  bundles.forEach(bundle => {
    if (bundle.type === 'js' && bundle.size > 250000) {
      issues.push({
        severity: 'high',
        description: `Large JavaScript bundle: ${bundle.name} (${Math.round(bundle.size / 1024)}KB)`,
        suggestion: 'Consider code splitting or lazy loading',
      });

      recommendations.push({
        type: 'code-splitting',
        impact: 'high',
        description: `Split ${bundle.name} into smaller chunks`,
        potentialSavings: Math.round(bundle.size * 0.4), // Estimate 40% savings
      });
    }

    if (bundle.coverage < 50) {
      issues.push({
        severity: 'medium',
        description: `Low code coverage in ${bundle.name} (${bundle.coverage}%)`,
        suggestion: 'Remove unused code through tree-shaking',
      });

      recommendations.push({
        type: 'dead-code-elimination',
        impact: 'medium',
        description: `Remove unused code from ${bundle.name}`,
        potentialSavings: Math.round(bundle.size * (1 - bundle.coverage / 100)),
      });
    }
  });

  return { issues, recommendations };
}

function calculateBundleScore(
  totalSize: number,
  bundles: any[],
  issues: Array<{ severity: 'high' | 'medium' | 'low' }>
): number {
  let score = 100;

  // Deduct points for total size
  if (totalSize > 1000000) score -= 20; // > 1MB
  else if (totalSize > 500000) score -= 10; // > 500KB

  // Deduct points for individual large bundles
  bundles.forEach(bundle => {
    if (bundle.size > 250000) score -= 5;
    if (bundle.coverage < 50) score -= 5;
  });

  // Deduct points for issues
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'low':
        score -= 2;
        break;
    }
  });

  return Math.max(0, Math.min(100, score));
}

export async function analyzeBundles(url: string): Promise<BundleResult> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = load(html);
    
    // Analyze JavaScript bundles
    const jsBundles = await analyzeJavaScriptBundles($);
    
    // Analyze CSS bundles
    const cssBundles = await analyzeCSSBundles($);
    
    // Combine all bundles
    const bundles = [...jsBundles, ...cssBundles];
    
    // Calculate total size
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    
    // Generate issues and recommendations
    const { issues, recommendations } = generateBundleRecommendations(bundles);
    
    // Calculate score based on sizes and issues
    const score = calculateBundleScore(totalSize, bundles, issues);
    
    return {
      score,
      report: {
        totalSize,
        bundles,
        issues,
        recommendations,
      },
    };
  } catch (error) {
    console.error('Error analyzing bundles:', error);
    throw error;
  }
} 