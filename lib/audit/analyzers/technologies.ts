const cheerio = require('cheerio');
import { httpClient } from '@/lib/services/httpClient';
import { logger } from '@/lib/utils/logger';

interface Technology {
  name: string;
  category: string;
  confidence: number;
  version?: string;
}

interface AnalyzerResult {
  technologies: Technology[];
  errors: string[];
  success: boolean;
}

export async function analyzeTechnologies(url: string): Promise<AnalyzerResult> {
  const result: AnalyzerResult = {
    technologies: [],
    errors: [],
    success: false
  };

  try {
    const response = await httpClient.get<string>(url, { 
      responseType: 'text',
      validateStatus: () => true
    });
    
    if (response.error || response.status >= 400) {
      result.errors.push(`Failed to fetch site: ${response.error || response.status}`);
      return result;
    }

    const html = response.data;
    
    // Validate HTML content
    if (!html || (typeof html === 'string' && !html.includes('<!DOCTYPE') && !html.includes('<html'))) {
      result.errors.push('Invalid HTML response received');
      return result;
    }

    const $ = cheerio.load(html);

    // CMS Detection
    try {
      const generator = $('meta[name="generator"]').attr('content');
      if (generator) {
        result.technologies.push({
          name: generator,
          category: 'CMS',
          confidence: 1,
        });
      }
    } catch (error) {
      result.errors.push('CMS detection failed');
      logger.error('CMS detection error', { url, error });
    }

    // Framework Detection - Continue even if previous steps failed
    try {
      if (html.includes('react')) {
        result.technologies.push({
          name: 'React',
          category: 'Frontend Framework',
          confidence: 0.9,
        });
      }
    } catch (error) {
      result.errors.push('Framework detection failed');
      logger.error('Framework detection error', { url, error });
    }

    // Mark as success if we found any technologies, even with some errors
    result.success = result.technologies.length > 0;
    return result;

  } catch (error) {
    logger.error('Technology analysis failed', { url, error });
    result.errors.push('Technology analysis failed unexpectedly');
    return result;
  }
} 