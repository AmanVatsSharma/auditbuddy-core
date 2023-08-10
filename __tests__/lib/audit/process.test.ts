import { startAuditProcess } from '@/lib/audit/process';
import { prisma } from '@/lib/prisma';
import { mockServer } from '../../mocks/server';

describe('Audit Process', () => {
  it('should complete full audit successfully', async () => {
    // Create test audit
    const audit = await prisma.audit.create({
      data: {
        url: 'https://example.com',
        status: 'PENDING',
      }
    });

    await startAuditProcess(audit.id);

    const updatedAudit = await prisma.audit.findUnique({
      where: { id: audit.id }
    });

    expect(updatedAudit?.status).toBe('COMPLETED');
    expect(updatedAudit?.results.summary.completedSteps).toBe(3); // Assuming 3 analyzers
    expect(updatedAudit?.results.summary.failedSteps).toBe(0);
  });

  it('should handle partial failures', async () => {
    // Mock one analyzer to fail
    mockServer.use(
      rest.get('https://example.com/seo', (req, res) => {
        return res.networkError('Failed to connect');
      })
    );

    const audit = await prisma.audit.create({
      data: {
        url: 'https://example.com',
        status: 'PENDING',
      }
    });

    await startAuditProcess(audit.id);

    const updatedAudit = await prisma.audit.findUnique({
      where: { id: audit.id }
    });

    expect(updatedAudit?.status).toBe('COMPLETED_WITH_ERRORS');
    expect(updatedAudit?.results.summary.failedSteps).toBe(1);
    expect(updatedAudit?.results.summary.errors).toHaveLength(1);
  });
}); 