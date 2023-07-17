import { prisma } from '@/server/db';
import { analyzeSEO } from './analyzers/seo';
import { analyzePerformance } from './analyzers/performance';
import { analyzeAccessibility } from './analyzers/accessibility';
import { analyzeSecurityHeaders } from './analyzers/security';
import { analyzeTechnologies } from './analyzers/technologies';

export async function startAudit(auditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { website: true },
  });

  if (!audit) return;

  try {
    // Update status to running
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: 'RUNNING' },
    });

    // Run all analyzers in parallel
    const [
      seoResults,
      performanceResults,
      accessibilityResults,
      securityResults,
      technologiesResults
    ] = await Promise.all([
      analyzeSEO(audit.website.url),
      analyzePerformance(audit.website.url),
      analyzeAccessibility(audit.website.url),
      analyzeSecurityHeaders(audit.website.url),
      analyzeTechnologies(audit.website.url),
    ]);

    // Update audit with results
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        seoScore: seoResults.score,
        seoReport: seoResults.report,
        performanceScore: performanceResults.score,
        performanceReport: performanceResults.report,
        accessibilityScore: accessibilityResults.score,
        accessibilityReport: accessibilityResults.report,
        securityScore: securityResults.score,
        securityReport: securityResults.report,
        technologies: technologiesResults,
      },
    });
  } catch (error) {
    console.error('Error running audit:', error);
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    });
  }
} 