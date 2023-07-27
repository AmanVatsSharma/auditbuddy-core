import axios from 'axios';
import { load } from 'cheerio';

interface CarbonResult {
  score: number;
  report: {
    totalSize: number; // in bytes
    co2PerPage: number; // in grams
    annualEmissions: number; // in kg, assuming 10,000 page views/month
    cleanerThan: number; // percentage of websites
    recommendations: Array<{
      type: string;
      potential: number;
      description: string;
    }>;
  };
}

export async function analyzeCarbonFootprint(url: string): Promise<CarbonResult> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = load(html);
    
    // Calculate total page size
    const pageSize = response.headers['content-length'] 
      ? parseInt(response.headers['content-length']) 
      : Buffer.byteLength(html);

    // Calculate image sizes
    const imageSize = await calculateImageSize($);
    
    // Calculate script sizes
    const scriptSize = await calculateScriptSize($);
    
    // CO2 calculations based on Sustainable Web Design model
    // https://sustainablewebdesign.org/calculating-digital-emissions/
    const bytesToKB = (pageSize + imageSize + scriptSize) / 1024;
    const energyPerKB = 0.2; // kWh per KB transferred
    const co2PerKWh = 442; // global average grid carbon intensity
    
    const co2PerPage = (bytesToKB * energyPerKB * co2PerKWh) / 1000; // in grams
    const annualEmissions = (co2PerPage * 120000) / 1000; // assuming 10k monthly views, in kg
    
    // Calculate score (0-100) based on emissions
    const score = Math.max(0, 100 - (co2PerPage * 10));
    
    return {
      score: Math.round(score),
      report: {
        totalSize: pageSize + imageSize + scriptSize,
        co2PerPage,
        annualEmissions,
        cleanerThan: calculatePercentileRank(co2PerPage),
        recommendations: generateRecommendations($, pageSize, imageSize, scriptSize),
      },
    };
  } catch (error) {
    console.error('Error analyzing carbon footprint:', error);
    throw error;
  }
}

async function calculateImageSize($: cheerio.Root): Promise<number> {
  const images = $('img').toArray();
  let totalSize = 0;

  for (const img of images) {
    const src = $(img).attr('src');
    if (src) {
      try {
        const response = await axios.head(src);
        totalSize += parseInt(response.headers['content-length'] || '0');
      } catch (error) {
        console.warn(`Failed to get size for image: ${src}`);
      }
    }
  }

  return totalSize;
}

async function calculateScriptSize($: cheerio.Root): Promise<number> {
  const scripts = $('script[src]').toArray();
  let totalSize = 0;

  for (const script of scripts) {
    const src = $(script).attr('src');
    if (src) {
      try {
        const response = await axios.head(src);
        totalSize += parseInt(response.headers['content-length'] || '0');
      } catch (error) {
        console.warn(`Failed to get size for script: ${src}`);
      }
    }
  }

  return totalSize;
}

function generateRecommendations(
  $: cheerio.Root, 
  pageSize: number, 
  imageSize: number, 
  scriptSize: number
): Array<{ type: string; potential: number; description: string }> {
  const recommendations = [];

  if (imageSize > 500000) {
    recommendations.push({
      type: 'images',
      potential: Math.round((imageSize - 500000) / 1024),
      description: 'Optimize and compress images to reduce their size',
    });
  }

  if (scriptSize > 300000) {
    recommendations.push({
      type: 'javascript',
      potential: Math.round((scriptSize - 300000) / 1024),
      description: 'Minimize JavaScript and remove unused code',
    });
  }

  return recommendations;
}

function calculatePercentileRank(co2: number): number {
  // Based on HTTP Archive data
  const percentiles = [
    { value: 0.5, rank: 90 },
    { value: 1.0, rank: 75 },
    { value: 2.0, rank: 50 },
    { value: 4.0, rank: 25 },
    { value: 6.0, rank: 10 },
  ];

  for (const { value, rank } of percentiles) {
    if (co2 <= value) return rank;
  }

  return 0;
} 