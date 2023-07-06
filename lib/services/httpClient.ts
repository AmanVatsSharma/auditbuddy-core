import axios, { AxiosResponse } from 'axios';
import { logger } from '@/lib/utils/logger';

interface RequestResult<T> {
  data?: T;
  error?: string;
  status?: number;
}

class HttpClient {
  async get<T>(url: string, config = {}): Promise<RequestResult<T>> {
    try {
      const response: AxiosResponse<T> = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        ...config,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebAuditBot/1.0)',
          ...config.headers,
        },
      });

      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      logger.error('HTTP request failed:', { url, error });
      
      if (axios.isAxiosError(error)) {
        return {
          error: error.message,
          status: error.response?.status
        };
      }
      
      return {
        error: 'Network request failed'
      };
    }
  }
}

export const httpClient = new HttpClient(); 