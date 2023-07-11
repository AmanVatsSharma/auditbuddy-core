import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (typeof window !== 'undefined') {
    return NextResponse.json(
      { error: 'This endpoint can only be accessed from the server' },
      { status: 400 }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/trpc/:path*',
}; 