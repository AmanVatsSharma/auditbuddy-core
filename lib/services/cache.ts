import { redis } from '@/lib/config/redis';
import { logger } from '@/lib/utils/logger';

export class CacheService {
  private static instance: CacheService;
  private readonly defaultTTL = 3600; // 1 hour

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setEx(key, ttl, serialized);
      } else {
        await redis.setEx(key, this.defaultTTL, serialized);
      }
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      logger.error('Cache invalidate pattern error', { pattern, error });
    }
  }
}

export const cacheService = CacheService.getInstance(); 