import { ValidationService } from '@/lib/services/validation';
import { startAuditProcess } from '@/lib/audit/process';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/config/redis';
import { logger } from '@/lib/utils/logger';
import { GraphQLError } from 'graphql';

export const auditResolvers = {
  Mutation: {
    createAudit: async (_, { url }, { user }) => {
      try {
        // Validate URL
        const validation = ValidationService.validateUrl(url);
        if (!validation.isValid) {
          throw new GraphQLError(validation.error || 'Invalid URL');
        }

        // Check if there's a recent audit for this URL
        const recentAudit = await prisma.audit.findFirst({
          where: {
            url: validation.normalizedUrl,
            createdAt: {
              gte: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            },
          },
        });

        if (recentAudit) {
          return recentAudit;
        }

        // Create new audit
        const audit = await prisma.audit.create({
          data: {
            url: validation.normalizedUrl,
            status: 'PENDING',
            userId: user?.id,
          },
        });

        // Initialize cache
        await redis.set(`audit:${audit.id}`, JSON.stringify({
          status: 'PENDING',
          progress: 0,
          currentStep: 'Initializing',
        }));

        // Start audit process
        startAuditProcess(audit.id).catch(error => {
          logger.error('Audit process failed', { auditId: audit.id, error });
        });

        return audit;
      } catch (error) {
        logger.error('Create audit error', { url, error });
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to start audit. Please try again later.');
      }
    },
  },
}; 