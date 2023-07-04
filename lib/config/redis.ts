import { Redis } from 'ioredis';
import { logger } from '@/lib/utils/logger';

const initRedis = async () => {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  
  try {
    await redis.connect();
    logger.info('Redis connected');
    return redis;
  } catch (err) {
    logger.error('Redis connection error:', err);
    throw err;
  }
};

export const redis = await initRedis(); 