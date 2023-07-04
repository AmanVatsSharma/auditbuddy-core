import { Redis } from 'redis';
import { AuditResult } from '@/types/audit';

const redis = new Redis({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 50000,
  },
});

export class CacheService {
  private static AUDIT_PREFIX = 'audit:';
  private static CACHE_TTL = 60 * 60 * 24; // 24 hours

  static async getAuditResult(auditId: string): Promise<AuditResult | null> {
    const cached = await redis.get(`${this.AUDIT_PREFIX}${auditId}`);
    return cached ? JSON.parse(cached) : null;
  }

  static async setAuditResult(auditId: string, result: AuditResult): Promise<void> {
    await redis.set(
      `${this.AUDIT_PREFIX}${auditId}`,
      JSON.stringify(result),
      { EX: this.CACHE_TTL }
    );
  }

  static async invalidateAudit(auditId: string): Promise<void> {
    await redis.del(`${this.AUDIT_PREFIX}${auditId}`);
  }
} 