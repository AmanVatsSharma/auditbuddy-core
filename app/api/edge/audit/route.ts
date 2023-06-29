import { NextResponse } from 'next/server';
import { redis } from '@/lib/config/redis';
import { logger } from '@/lib/utils/logger';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const auditId = searchParams.get('id');

  if (!auditId) {
    return NextResponse.json({ error: 'Audit ID is required' }, { status: 400 });
  }

  try {
    const cachedResult = await redis.get(`audit:${auditId}`);
    if (cachedResult) {
      return NextResponse.json(JSON.parse(cachedResult));
    }

    return NextResponse.json({ status: 'NOT_FOUND' }, { status: 404 });
  } catch (error) {
    logger.error('Edge function error', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 