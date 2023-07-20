import puppeteer from 'puppeteer';
import { load } from 'cheerio';

interface SEOResult {
  score: number;
  report: {
    title: {
      value: string;
      length: number;
      status: 'good' | 'warning' | 'bad';
      message: string;
    };
    description: {
      value: string;
      length: number;
      status: 'good' | 'warning' | 'bad';
      message: string;
    };
    headings: {
      h1Count: number;
      h1Text: string[];
      status: 'good' | 'warning' | 'bad';
      message: string;
    };
    images: {
      total: number;
      missing: number;
      status: 'good' | 'warning' | 'bad';
      message: string;
    };
    links: {
      internal: number;
      external: number;
      broken: number;
      status: 'good' | 'warning' | 'bad';
      message: string;
    };
  };
}

export async function analyzeSEO(url: string): Promise<SEOResult> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    const html = await page.content();
    const $ = load(html);
    
    // Analyze title
    const title = $('title').text().trim();
    const titleAnalysis = analyzeTitleTag(title);

    // Analyze meta description
    const description = $('meta[name="description"]').attr('content') || '';
    const descriptionAnalysis = analyzeMetaDescription(description);

    // Analyze headings
    const headingsAnalysis = analyzeHeadings($);

    // Analyze images
    const imagesAnalysis = analyzeImages($);

    // Analyze links
    const linksAnalysis = analyzeLinks($, url);

    // Calculate overall score
    const score = calculateScore({
      title: titleAnalysis.status,
      description: descriptionAnalysis.status,
      headings: headingsAnalysis.status,
      images: imagesAnalysis.status,
      links: linksAnalysis.status,
    });

    await browser.close();

    return {
      score,
      report: {
        title: titleAnalysis,
        description: descriptionAnalysis,
        headings: headingsAnalysis,
        images: imagesAnalysis,
        links: linksAnalysis,
      },
    };
  } catch (error) {
    console.error('Error analyzing SEO:', error);
    return {
      score: 0,
      report: {
        title: {
          value: '',
          length: 0,
          status: 'bad',
          message: 'Error analyzing title tag',
        },
        description: {
          value: '',
          length: 0,
          status: 'bad',
          message: 'Error analyzing meta description',
        },
        headings: {
          h1Count: 0,
          h1Text: [],
          status: 'bad',
          message: 'Error analyzing headings',
        },
        images: {
          total: 0,
          missing: 0,
          status: 'bad',
          message: 'Error analyzing images',
        },
        links: {
          internal: 0,
          external: 0,
          broken: 0,
          status: 'bad',
          message: 'Error analyzing links',
        },
      },
    };
  }
}

function analyzeTitleTag(title: string) {
  const length = title.length;
  
  if (length === 0) {
    return {
      value: title,
      length,
      status: 'bad' as const,
      message: 'Missing title tag',
    };
  }

  if (length < 30 || length > 60) {
    return {
      value: title,
      length,
      status: 'warning' as const,
      message: `Title length (${length} characters) is ${length < 30 ? 'too short' : 'too long'}. Optimal length is 30-60 characters.`,
    };
  }

  return {
    value: title,
    length,
    status: 'good' as const,
    message: 'Title tag is well-optimized',
  };
}

function analyzeMetaDescription(description: string) {
  const length = description.length;

  if (length === 0) {
    return {
      value: description,
      length,
      status: 'bad' as const,
      message: 'Missing meta description',
    };
  }

  if (length < 120 || length > 155) {
    return {
      value: description,
      length,
      status: 'warning' as const,
      message: `Description length (${length} characters) is ${length < 120 ? 'too short' : 'too long'}. Optimal length is 120-155 characters.`,
    };
  }

  return {
    value: description,
    length,
    status: 'good' as const,
    message: 'Meta description is well-optimized',
  };
}

function analyzeHeadings($: cheerio.Root) {
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  const h1Text = h1Elements.map((_, el) => $(el).text().trim()).get();

  if (h1Count === 0) {
    return {
      h1Count,
      h1Text,
      status: 'bad' as const,
      message: 'Missing H1 heading',
    };
  }

  if (h1Count > 1) {
    return {
      h1Count,
      h1Text,
      status: 'warning' as const,
      message: 'Multiple H1 headings found. Consider using only one main H1 heading.',
    };
  }

  return {
    h1Count,
    h1Text,
    status: 'good' as const,
    message: 'H1 heading is properly used',
  };
}

function analyzeImages($: cheerio.Root) {
  const images = $('img');
  const total = images.length;
  const missing = images.filter((_, el) => !$(el).attr('alt')).length;

  if (total === 0) {
    return {
      total,
      missing,
      status: 'warning' as const,
      message: 'No images found on the page',
    };
  }

  if (missing > 0) {
    return {
      total,
      missing,
      status: 'warning' as const,
      message: `${missing} out of ${total} images are missing alt text`,
    };
  }

  return {
    total,
    missing,
    status: 'good' as const,
    message: 'All images have alt text',
  };
}

function analyzeLinks($: cheerio.Root, baseUrl: string) {
  const links = $('a');
  const internal = links.filter((_, el) => {
    const href = $(el).attr('href') || '';
    return href.startsWith('/') || href.includes(new URL(baseUrl).hostname);
  }).length;
  
  const external = links.length - internal;

  return {
    internal,
    external,
    broken: 0, // Would require additional HTTP checks
    status: links.length > 0 ? 'good' : 'warning',
    message: links.length > 0 
      ? `Found ${links.length} links (${internal} internal, ${external} external)`
      : 'No links found on the page',
  };
}

function calculateScore(statuses: Record<string, 'good' | 'warning' | 'bad'>) {
  const weights = {
    good: 1,
    warning: 0.5,
    bad: 0,
  };

  const totalFactors = Object.keys(statuses).length;
  const score = Object.values(statuses).reduce((acc, status) => 
    acc + weights[status], 0) / totalFactors * 100;

  return Math.round(score);
} 