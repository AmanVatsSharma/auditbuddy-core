import { prisma } from '@/server/db';
import { analyzeSEO } from './analyzers/seo';
import { analyzePerformance } from './analyzers/performance';
import { analyzeAccessibility } from './analyzers/accessibility';
import { analyzeSecurityHeaders } from './analyzers/security';
import { analyzeTechnologies } from './analyzers/technologies';
import { logger } from '@/lib/utils/logger';

export async function startAuditProcess(auditId: string) {
  try {
    // Get audit
    const audit = await prisma.audit.findUnique({
      where: { id: auditId }
    });

    if (!audit) {
      throw new Error('Audit not found');
    }

    // Update status to running
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: 'RUNNING' }
    });

    // Run analyzers
    const [seoResult, performanceResult, accessibilityResult, securityResult, techResult] = await Promise.allSettled([
      analyzeSEO(audit.url),
      analyzePerformance(audit.url),
      analyzeAccessibility(audit.url),
      analyzeSecurityHeaders(audit.url),
      analyzeTechnologies(audit.url)
    ]);

    // Process results
    const results = {
      seo: seoResult.status === 'fulfilled' ? seoResult.value : null,
      performance: performanceResult.status === 'fulfilled' ? performanceResult.value : null,
      accessibility: accessibilityResult.status === 'fulfilled' ? accessibilityResult.value : null,
      security: securityResult.status === 'fulfilled' ? securityResult.value : null,
      technologies: techResult.status === 'fulfilled' ? techResult.value : null
    };

    // Update audit with results
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        results: results as any
      }
    });

  } catch (error) {
    logger.error('Audit process failed:', { auditId, error });
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        completedAt: new Date()
      }
    });
  }
} 