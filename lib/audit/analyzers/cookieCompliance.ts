import axios from 'axios';
import { load } from 'cheerio';

interface CookieResult {
  score: number;
  report: {
    cookies: Array<{
      name: string;
      domain: string;
      purpose: string;
      type: 'necessary' | 'preference' | 'statistics' | 'marketing' | 'unclassified';
      duration: string;
      isCompliant: boolean;
    }>;
    hasCookieBanner: boolean;
    hasConsentManagement: boolean;
    issues: Array<{
      severity: 'high' | 'medium' | 'low';
      description: string;
      recommendation: string;
    }>;
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
  };
}

export async function analyzeCookieCompliance(url: string): Promise<CookieResult> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = load(html);
    
    // Detect cookie banner
    const hasCookieBanner = detectCookieBanner($);
    
    // Get cookies from response headers
    const cookies = parseCookies(response.headers['set-cookie'] || []);
    
    // Analyze consent management
    const hasConsentManagement = detectConsentManagement($);
    
    // Analyze compliance issues
    const issues = analyzeComplianceIssues($, cookies, hasCookieBanner, hasConsentManagement);
    
    // Calculate compliance score
    const score = calculateComplianceScore(issues, hasCookieBanner, hasConsentManagement);
    
    return {
      score,
      report: {
        cookies,
        hasCookieBanner,
        hasConsentManagement,
        issues,
        gdprCompliant: score >= 80,
        ccpaCompliant: score >= 75,
      },
    };
  } catch (error) {
    console.error('Error analyzing cookie compliance:', error);
    throw error;
  }
}

function detectCookieBanner($: cheerio.Root): boolean {
  const cookieKeywords = ['cookie', 'cookies', 'gdpr', 'ccpa', 'consent'];
  
  return $('*').toArray().some(element => {
    const text = $(element).text().toLowerCase();
    return cookieKeywords.some(keyword => text.includes(keyword));
  });
}

function parseCookies(cookieHeaders: string[]): any[] {
  return cookieHeaders.map(header => {
    const [nameValue, ...parts] = header.split(';');
    const [name, value] = nameValue.split('=');
    
    return {
      name: name.trim(),
      domain: parts.find(p => p.includes('Domain='))?.split('=')[1] || '',
      purpose: classifyCookiePurpose(name.trim(), value),
      type: determineCookieType(name.trim()),
      duration: calculateDuration(parts),
      isCompliant: true, // Default to true, will be updated based on analysis
    };
  });
}

// Add the remaining helper functions... 