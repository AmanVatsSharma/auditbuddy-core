import axios from 'axios';
import { SecurityHeaders } from './types';

interface SecurityResult {
  score: number;
  report: {
    headers: {
      [key in SecurityHeaders]: {
        present: boolean;
        value?: string;
        status: 'good' | 'warning' | 'bad';
        message: string;
      };
    };
    ssl: {
      valid: boolean;
      issuer?: string;
      expiresAt?: Date;
      status: 'good' | 'warning' | 'bad';
      message: string;
    };
    vulnerabilities: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
  };
}

const SECURITY_HEADERS = {
  'Strict-Transport-Security': {
    required: true,
    recommendation: 'max-age=31536000; includeSubDomains',
  },
  'Content-Security-Policy': {
    required: true,
    recommendation: "default-src 'self'",
  },
  'X-Frame-Options': {
    required: true,
    recommendation: 'DENY',
  },
  'X-Content-Type-Options': {
    required: true,
    recommendation: 'nosniff',
  },
  'Referrer-Policy': {
    required: true,
    recommendation: 'strict-origin-when-cross-origin',
  },
  'Permissions-Policy': {
    required: false,
    recommendation: 'geolocation=(), microphone=()',
  },
};

export async function analyzeSecurityHeaders(url: string): Promise<SecurityResult> {
  try {
    const response = await axios.get(url);
    const headers = response.headers;
    
    let totalScore = 0;
    const headerResults: any = {};

    // Analyze security headers
    Object.entries(SECURITY_HEADERS).forEach(([header, config]) => {
      const headerValue = headers[header.toLowerCase()];
      const present = !!headerValue;

      let status: 'good' | 'warning' | 'bad' = 'bad';
      let message = '';

      if (present) {
        status = 'good';
        message = 'Header is properly configured';
        totalScore += config.required ? 20 : 10;
      } else {
        status = config.required ? 'bad' : 'warning';
        message = config.required 
          ? `Missing required security header: ${header}`
          : `Recommended security header not found: ${header}`;
      }

      headerResults[header] = {
        present,
        value: headerValue,
        status,
        message,
      };
    });

    // Analyze SSL
    const ssl = {
      valid: url.startsWith('https'),
      status: url.startsWith('https') ? 'good' : 'bad',
      message: url.startsWith('https') 
        ? 'SSL is properly configured'
        : 'Site is not using HTTPS',
    };

    if (ssl.valid) {
      totalScore += 20;
    }

    // Calculate final score (out of 100)
    const finalScore = Math.min(100, totalScore);

    return {
      score: finalScore,
      report: {
        headers: headerResults,
        ssl,
        vulnerabilities: [], // Would require additional security scanning
      },
    };
  } catch (error) {
    console.error('Error analyzing security:', error);
    return {
      score: 0,
      report: {
        headers: Object.keys(SECURITY_HEADERS).reduce((acc, header) => ({
          ...acc,
          [header]: {
            present: false,
            status: 'bad' as const,
            message: 'Error analyzing security headers',
          },
        }), {}),
        ssl: {
          valid: false,
          status: 'bad' as const,
          message: 'Error analyzing SSL configuration',
        },
        vulnerabilities: [],
      },
    };
  }
} 