import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';

interface AccessibilityResult {
  score: number;
  report: {
    violations: Array<{
      impact: 'critical' | 'serious' | 'moderate' | 'minor';
      help: string;
      description: string;
      nodes: Array<{
        html: string;
        target: string[];
      }>;
    }>;
    passes: Array<{
      id: string;
      description: string;
      nodes: Array<{
        html: string;
        target: string[];
      }>;
    }>;
    incomplete: Array<{
      id: string;
      description: string;
      nodes: Array<{
        html: string;
        target: string[];
      }>;
    }>;
  };
}

export async function analyzeAccessibility(url: string): Promise<AccessibilityResult> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const results = await new AxePuppeteer(page).analyze();

    // Calculate score based on violations
    const totalIssues = results.violations.length;
    const criticalIssues = results.violations.filter(v => v.impact === 'critical').length;
    const seriousIssues = results.violations.filter(v => v.impact === 'serious').length;
    const moderateIssues = results.violations.filter(v => v.impact === 'moderate').length;

    // Score calculation: Start with 100 and subtract based on severity
    const score = Math.max(0, 100 - (
      criticalIssues * 15 +
      seriousIssues * 10 +
      moderateIssues * 5
    ));

    return {
      score,
      report: {
        violations: results.violations.map(violation => ({
          impact: violation.impact as 'critical' | 'serious' | 'moderate' | 'minor',
          help: violation.help,
          description: violation.description,
          nodes: violation.nodes.map(node => ({
            html: node.html,
            target: node.target,
          })),
        })),
        passes: results.passes.map(pass => ({
          id: pass.id,
          description: pass.description,
          nodes: pass.nodes.map(node => ({
            html: node.html,
            target: node.target,
          })),
        })),
        incomplete: results.incomplete.map(inc => ({
          id: inc.id,
          description: inc.description,
          nodes: inc.nodes.map(node => ({
            html: node.html,
            target: node.target,
          })),
        })),
      },
    };
  } catch (error) {
    console.error('Error analyzing accessibility:', error);
    return {
      score: 0,
      report: {
        violations: [{
          impact: 'critical',
          help: 'Error analyzing accessibility',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          nodes: [],
        }],
        passes: [],
        incomplete: [],
      },
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 