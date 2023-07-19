import puppeteer from 'puppeteer';
import axe from '@axe-core/puppeteer';

interface AccessibilityResult {
  score: number;
  report: {
    violations: Array<{
      impact: 'minor' | 'moderate' | 'serious' | 'critical';
      help: string;
      description: string;
      nodes: Array<{
        html: string;
        target: string[];
      }>;
    }>;
    passes: number;
    incomplete: number;
  };
}

export async function analyzeAccessibility(url: string): Promise<AccessibilityResult> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const results = await axe.analyze(page);
    await browser.close();

    // Calculate score based on violations and their impact
    const impactWeights = {
      minor: 0.25,
      moderate: 0.5,
      serious: 0.75,
      critical: 1,
    };

    const totalIssues = results.violations.reduce((acc, v) => 
      acc + v.nodes.length, 0);
    
    const weightedIssues = results.violations.reduce((acc, v) => 
      acc + (v.nodes.length * impactWeights[v.impact]), 0);

    const score = Math.max(0, Math.round((1 - (weightedIssues / totalIssues)) * 100));

    return {
      score,
      report: {
        violations: results.violations.map(v => ({
          impact: v.impact,
          help: v.help,
          description: v.description,
          nodes: v.nodes.map(n => ({
            html: n.html,
            target: n.target,
          })),
        })),
        passes: results.passes.length,
        incomplete: results.incomplete.length,
      },
    };
  } catch (error) {
    console.error('Error analyzing accessibility:', error);
    return {
      score: 0,
      report: {
        violations: [],
        passes: 0,
        incomplete: 0,
      },
    };
  }
} 