import axios from 'axios';
import { load } from 'cheerio';

interface PWAResult {
  score: number;
  report: {
    manifest: {
      exists: boolean;
      issues: string[];
      properties: Record<string, any>;
    };
    serviceWorker: {
      exists: boolean;
      issues: string[];
      capabilities: string[];
    };
    installability: {
      canBeInstalled: boolean;
      missingRequirements: string[];
    };
    performance: {
      offlineCapable: boolean;
      cacheStrategy: string;
      loadTime: number;
    };
  };
}

export async function analyzePWAReadiness(url: string): Promise<PWAResult> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = load(html);
    
    // Check manifest
    const manifestLink = $('link[rel="manifest"]').attr('href');
    const manifest = manifestLink ? await fetchManifest(new URL(manifestLink, url)) : null;
    
    // Check service worker
    const serviceWorker = await checkServiceWorker($, url);
    
    // Check installability
    const installability = checkInstallability(manifest, serviceWorker);
    
    // Check performance
    const performance = await checkPWAPerformance(url);
    
    // Calculate score
    const score = calculatePWAScore(manifest, serviceWorker, installability, performance);
    
    return {
      score,
      report: {
        manifest: {
          exists: !!manifest,
          issues: getManifestIssues(manifest),
          properties: manifest || {},
        },
        serviceWorker: {
          exists: serviceWorker.exists,
          issues: serviceWorker.issues,
          capabilities: serviceWorker.capabilities,
        },
        installability,
        performance,
      },
    };
  } catch (error) {
    console.error('Error analyzing PWA readiness:', error);
    throw error;
  }
}

async function fetchManifest(manifestUrl: URL): Promise<Record<string, any> | null> {
  try {
    const response = await axios.get(manifestUrl.toString());
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch manifest:', error);
    return null;
  }
}

async function checkServiceWorker($: cheerio.Root, url: string) {
  const swScript = $('script').filter((_, el) => {
    const text = $(el).text();
    return text.includes('serviceWorker') || text.includes('navigator.serviceWorker');
  });

  const result = {
    exists: swScript.length > 0,
    issues: [] as string[],
    capabilities: [] as string[],
  };

  if (!result.exists) {
    result.issues.push('No service worker registration found');
    return result;
  }

  try {
    const response = await axios.get(new URL('/sw.js', url).toString());
    const swContent = response.data;

    // Check for common service worker capabilities
    if (swContent.includes('cache.addAll')) {
      result.capabilities.push('Static Asset Caching');
    }
    if (swContent.includes('fetch')) {
      result.capabilities.push('Network Interception');
    }
    if (swContent.includes('push')) {
      result.capabilities.push('Push Notifications');
    }
    if (swContent.includes('sync')) {
      result.capabilities.push('Background Sync');
    }
  } catch (error) {
    result.issues.push('Service worker file not accessible');
  }

  return result;
}

function checkInstallability(
  manifest: Record<string, any> | null,
  serviceWorker: { exists: boolean; issues: string[] }
) {
  const missingRequirements: string[] = [];

  if (!manifest) {
    missingRequirements.push('Web App Manifest');
  } else {
    if (!manifest.name && !manifest['short_name']) {
      missingRequirements.push('Manifest name or short_name');
    }
    if (!manifest.icons || !manifest.icons.length) {
      missingRequirements.push('Suitable icons in manifest');
    }
    if (!manifest.start_url) {
      missingRequirements.push('start_url in manifest');
    }
    if (!manifest.display) {
      missingRequirements.push('display mode in manifest');
    }
  }

  if (!serviceWorker.exists) {
    missingRequirements.push('Service Worker');
  }

  return {
    canBeInstalled: missingRequirements.length === 0,
    missingRequirements,
  };
}

async function checkPWAPerformance(url: string) {
  try {
    const startTime = Date.now();
    const response = await axios.get(url);
    const loadTime = Date.now() - startTime;

    return {
      offlineCapable: true, // This should be tested with service worker
      cacheStrategy: detectCacheStrategy(response.headers),
      loadTime,
    };
  } catch (error) {
    return {
      offlineCapable: false,
      cacheStrategy: 'none',
      loadTime: 0,
    };
  }
}

function detectCacheStrategy(headers: Record<string, string>): string {
  const cacheControl = headers['cache-control'] || '';
  
  if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
    return 'no-cache';
  }
  if (cacheControl.includes('immutable')) {
    return 'immutable';
  }
  if (cacheControl.includes('max-age')) {
    return 'time-based';
  }
  return 'default';
}

function getManifestIssues(manifest: Record<string, any> | null): string[] {
  const issues: string[] = [];

  if (!manifest) {
    issues.push('No web app manifest found');
    return issues;
  }

  // Check required properties
  if (!manifest.name && !manifest['short_name']) {
    issues.push('Missing name or short_name');
  }
  if (!manifest.icons || !manifest.icons.length) {
    issues.push('Missing icons');
  } else {
    const hasSuitableIcon = manifest.icons.some((icon: any) => 
      icon.sizes === '192x192' || icon.sizes === '512x512'
    );
    if (!hasSuitableIcon) {
      issues.push('Missing suitable icons (192x192 and 512x512 recommended)');
    }
  }
  if (!manifest.start_url) {
    issues.push('Missing start_url');
  }
  if (!manifest.display) {
    issues.push('Missing display mode');
  }
  if (!manifest.background_color) {
    issues.push('Missing background_color');
  }
  if (!manifest.theme_color) {
    issues.push('Missing theme_color');
  }

  return issues;
}

function calculatePWAScore(
  manifest: Record<string, any> | null,
  serviceWorker: { exists: boolean; issues: string[] },
  installability: { canBeInstalled: boolean; missingRequirements: string[] },
  performance: { offlineCapable: boolean; cacheStrategy: string; loadTime: number }
): number {
  let score = 0;

  // Manifest scoring (40 points max)
  if (manifest) {
    score += 20;
    score += manifest.name ? 5 : 0;
    score += manifest.icons?.length ? 5 : 0;
    score += manifest.start_url ? 5 : 0;
    score += manifest.display ? 5 : 0;
  }

  // Service Worker scoring (30 points max)
  if (serviceWorker.exists) {
    score += 20;
    score += serviceWorker.capabilities?.length * 2;
  }

  // Installability scoring (20 points)
  if (installability.canBeInstalled) {
    score += 20;
  }

  // Performance scoring (10 points max)
  if (performance.offlineCapable) score += 5;
  if (performance.loadTime < 3000) score += 5;
  else if (performance.loadTime < 5000) score += 3;

  return Math.min(100, score);
} 