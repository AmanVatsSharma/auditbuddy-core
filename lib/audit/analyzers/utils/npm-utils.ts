import { axiosInstance } from '../technologies';
import { logger } from '@/lib/utils/logger';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface PackageResult {
  data: PackageJson | null;
  error?: string;
}

export async function getPackageJson(url: string): Promise<PackageResult> {
  try {
    const packageJsonUrl = new URL('/package.json', url).toString();
    const response = await axiosInstance.get(packageJsonUrl, {
      timeout: 5000, // Shorter timeout for package.json
    });

    if (response.status === 404) {
      return { 
        data: null,
        error: 'Package.json not found'
      };
    }

    if (response.status >= 400) {
      return {
        data: null,
        error: `Failed to fetch package.json: ${response.status}`
      };
    }

    return { data: response.data };
  } catch (error) {
    logger.debug('Package.json fetch failed', { url, error });
    return {
      data: null,
      error: 'Unable to access package.json'
    };
  }
}