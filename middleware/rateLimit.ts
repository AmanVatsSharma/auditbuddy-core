import { redis } from '@/lib/config/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60;

export async function rateLimit(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const key = `rate-limit:${ip}`;

  const requests = await redis.incr(key);
  
  if (requests === 1) {
    await redis.pexpire(key, WINDOW_SIZE);
  }

  if (requests > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return NextResponse.next();
} 