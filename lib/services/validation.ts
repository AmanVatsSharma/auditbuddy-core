import { z } from 'zod';
import { logger } from '@/lib/utils/logger';

const urlSchema = z.string().url().max(2048);

export class ValidationService {
  static validateUrl(url: string): { isValid: boolean; error?: string } {
    try {
      // Ensure URL has protocol
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
      
      // Validate URL format
      urlSchema.parse(urlWithProtocol);
      
      // Additional custom validations
      const urlObj = new URL(urlWithProtocol);
      
      // Check for invalid or suspicious TLDs
      const invalidTLDs = ['.xyz', '.tk', '.ml'];
      if (invalidTLDs.some(tld => urlObj.hostname.endsWith(tld))) {
        return {
          isValid: false,
          error: 'Domain TLD not supported'
        };
      }

      return { isValid: true };
    } catch (error) {
      logger.error('URL validation error', { url, error });
      return {
        isValid: false,
        error: 'Please enter a valid URL'
      };
    }
  }
} 