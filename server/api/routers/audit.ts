import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { startAuditProcess } from '@/lib/audit/process';
import { ValidationService } from '@/lib/services/validation';

export const auditRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      url: z.string().url()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate URL
        const validation = ValidationService.validateUrl(input.url);
        if (!validation.isValid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: validation.error || 'Invalid URL'
          });
        }

        // Check for recent audit
        const recentAudit = await ctx.prisma.audit.findFirst({
          where: {
            url: input.url,
            createdAt: {
              gte: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
            }
          }
        });

        if (recentAudit) {
          return recentAudit;
        }

        // Create new audit
        const audit = await ctx.prisma.audit.create({
          data: {
            url: input.url,
            status: 'PENDING',
            userId: ctx.session?.user?.id
          }
        });

        // Start audit process in background
        startAuditProcess(audit.id).catch(error => {
          console.error('Audit process failed:', error);
        });

        return audit;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create audit'
        });
      }
    }),

  getStatus: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const audit = await ctx.prisma.audit.findUnique({
        where: { id: input },
        include: {
          website: true
        }
      });

      if (!audit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audit not found'
        });
      }

      return audit;
    })
}); 