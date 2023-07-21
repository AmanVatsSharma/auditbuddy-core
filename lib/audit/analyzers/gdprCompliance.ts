import axios from 'axios';
import { load } from 'cheerio';

interface GDPRResult {
  score: number;
  report: {
    cookieConsent: {
      exists: boolean;
      compliant: boolean;
      issues: string[];
    };
    privacyPolicy: {
      exists: boolean;
      lastUpdated?: Date;
      issues: string[];
    };
    dataCollection: {
      forms: Array<{
        purpose: string;
        fields: string[];
        hasConsent: boolean;
        issues: string[];
      }>;
      trackers: Array<{
        name: string;
        purpose: string;
        compliant: boolean;
      }>;
    };
    dataProtection: {
      encryption: boolean;
      secureTransfer: boolean;
      issues: string[];
    };
    recommendations: Array<{
      priority: 'critical' | 'high' | 'medium' | 'low';
      description: string;
      action: string;
    }>;
  };
}

export async function analyzeGDPRCompliance(url: string): Promise<GDPRResult> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = load(html);

    // Analyze cookie consent
    const cookieConsent = analyzeCookieConsent($);

    // Analyze privacy policy
    const privacyPolicy = await analyzePrivacyPolicy($, url);

    // Analyze data collection
    const dataCollection = analyzeDataCollection($);

    // Analyze data protection
    const dataProtection = await analyzeDataProtection(url);

    // Generate recommendations
    const recommendations = generateGDPRRecommendations(
      cookieConsent,
      privacyPolicy,
      dataCollection,
      dataProtection
    );

    // Calculate overall score
    const score = calculateGDPRScore(
      cookieConsent,
      privacyPolicy,
      dataCollection,
      dataProtection
    );

    return {
      score,
      report: {
        cookieConsent,
        privacyPolicy,
        dataCollection,
        dataProtection,
        recommendations,
      },
    };
  } catch (error) {
    console.error('Error analyzing GDPR compliance:', error);
    throw error;
  }
}

function analyzeCookieConsent($: cheerio.Root) {
  const cookieKeywords = [
    'cookie',
    'cookies',
    'gdpr',
    'consent',
    'accept',
    'privacy',
  ];

  const bannerExists = $('*').toArray().some(element => {
    const text = $(element).text().toLowerCase();
    return cookieKeywords.some(keyword => text.includes(keyword));
  });

  const issues: string[] = [];
  let isCompliant = true;

  if (!bannerExists) {
    issues.push('No cookie consent banner found');
    isCompliant = false;
  } else {
    // Check for essential compliance elements
    const hasRejectOption = $('*').text().toLowerCase().includes('reject');
    const hasPreferences = $('*').text().toLowerCase().includes('preferences');
    
    if (!hasRejectOption) {
      issues.push('No option to reject non-essential cookies');
      isCompliant = false;
    }
    if (!hasPreferences) {
      issues.push('No granular cookie preferences available');
      isCompliant = false;
    }
  }

  return {
    exists: bannerExists,
    compliant: isCompliant,
    issues,
  };
}

async function analyzePrivacyPolicy($: cheerio.Root, baseUrl: string) {
  const privacyLinks = $('a').filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes('privacy') || text.includes('privacy policy');
  });

  const exists = privacyLinks.length > 0;
  const issues: string[] = [];

  if (!exists) {
    issues.push('No privacy policy link found');
    return { exists, issues };
  }

  try {
    // Try to fetch the privacy policy page
    const policyUrl = new URL(
      $(privacyLinks[0]).attr('href') || '',
      baseUrl
    ).toString();
    const response = await axios.get(policyUrl);
    const policyHtml = response.data;
    const $policy = load(policyHtml);

    // Check for required GDPR elements
    const requiredElements = [
      'personal data',
      'data protection',
      'rights',
      'consent',
      'processing',
    ];

    requiredElements.forEach(element => {
      if (!$policy('*').text().toLowerCase().includes(element)) {
        issues.push(`Privacy policy missing information about: ${element}`);
      }
    });

    // Try to find last updated date
    const lastUpdated = findLastUpdatedDate($policy);

    return {
      exists,
      lastUpdated,
      issues,
    };
  } catch (error) {
    issues.push('Unable to analyze privacy policy content');
    return { exists, issues };
  }
}

function analyzeDataCollection($: cheerio.Root) {
  const forms = $('form').map((_, form) => {
    const $form = $(form);
    const fields = $form.find('input').map((_, input) => $(input).attr('name')).get();
    const hasConsent = $form.find('input[type="checkbox"]').toArray().some(checkbox => {
      const text = $(checkbox).parent().text().toLowerCase();
      return text.includes('consent') || text.includes('agree');
    });

    const issues: string[] = [];
    if (fields.some(field => isPersonalData(field)) && !hasConsent) {
      issues.push('Form collecting personal data without explicit consent');
    }

    return {
      purpose: detectFormPurpose($form),
      fields,
      hasConsent,
      issues,
    };
  }).get();

  const trackers = detectTrackers($);

  return {
    forms,
    trackers,
  };
}

async function analyzeDataProtection(url: string) {
  const issues: string[] = [];
  let encryption = false;
  let secureTransfer = false;

  try {
    const response = await axios.get(url);
    
    // Check HTTPS
    secureTransfer = url.startsWith('https');
    if (!secureTransfer) {
      issues.push('Website not using HTTPS');
    }

    // Check security headers
    const headers = response.headers;
    encryption = !!headers['content-security-policy'];
    
    if (!headers['strict-transport-security']) {
      issues.push('HSTS not enabled');
    }
    if (!headers['x-content-type-options']) {
      issues.push('X-Content-Type-Options header missing');
    }
    if (!headers['x-frame-options']) {
      issues.push('X-Frame-Options header missing');
    }
  } catch (error) {
    issues.push('Unable to analyze security headers');
  }

  return {
    encryption,
    secureTransfer,
    issues,
  };
}

function generateGDPRRecommendations(
  cookieConsent: any,
  privacyPolicy: any,
  dataCollection: any,
  dataProtection: any
): Array<{ priority: 'critical' | 'high' | 'medium' | 'low'; description: string; action: string }> {
  const recommendations = [];

  // Add recommendations based on issues found
  if (!cookieConsent.exists) {
    recommendations.push({
      priority: 'critical',
      description: 'Missing cookie consent mechanism',
      action: 'Implement a GDPR-compliant cookie consent banner',
    });
  }

  if (!privacyPolicy.exists) {
    recommendations.push({
      priority: 'critical',
      description: 'Missing privacy policy',
      action: 'Create and publish a GDPR-compliant privacy policy',
    });
  }

  // Add more recommendations based on other findings...

  return recommendations;
}

function calculateGDPRScore(
  cookieConsent: any,
  privacyPolicy: any,
  dataCollection: any,
  dataProtection: any
): number {
  let score = 100;

  // Deduct points for critical issues
  if (!cookieConsent.exists) score -= 30;
  if (!cookieConsent.compliant) score -= 20;
  if (!privacyPolicy.exists) score -= 30;
  if (!dataProtection.secureTransfer) score -= 20;

  // Deduct points for each issue
  score -= (cookieConsent.issues.length * 5);
  score -= (privacyPolicy.issues.length * 5);
  score -= (dataProtection.issues.length * 5);

  // Deduct points for non-compliant data collection
  dataCollection.forms.forEach((form: any) => {
    if (form.issues.length > 0) score -= 10;
  });

  return Math.max(0, Math.min(100, score));
}

// Helper functions
function isPersonalData(fieldName: string): boolean {
  const personalDataFields = [
    'name',
    'email',
    'phone',
    'address',
    'birthday',
    'passport',
    'ssn',
  ];
  return personalDataFields.some(field => 
    fieldName.toLowerCase().includes(field)
  );
}

function detectFormPurpose($form: cheerio.Cheerio): string {
  const text = $form.text().toLowerCase();
  if (text.includes('newsletter')) return 'Newsletter Subscription';
  if (text.includes('contact')) return 'Contact Form';
  if (text.includes('register')) return 'Registration';
  if (text.includes('login')) return 'Authentication';
  return 'Unknown';
}

function detectTrackers($: cheerio.Root) {
  const trackers = [];
  
  // Google Analytics
  if ($('script[src*="google-analytics.com"]').length > 0) {
    trackers.push({
      name: 'Google Analytics',
      purpose: 'Analytics',
      compliant: false,
    });
  }

  // Facebook Pixel
  if ($('script[src*="facebook"]').length > 0) {
    trackers.push({
      name: 'Facebook Pixel',
      purpose: 'Marketing',
      compliant: false,
    });
  }

  return trackers;
}

function findLastUpdatedDate($: cheerio.Root): Date | undefined {
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})/;
  const text = $('*').text();
  const match = text.match(dateRegex);
  return match ? new Date(match[0]) : undefined;
} 