import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // requests per minute

/**
 * API middleware for rate limiting and CORS
 * Protects API from abuse and enables cross-origin requests
 */
export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const ip = request.ip || 'anonymous';
  const now = Date.now();
  const windowData = rateLimit.get(ip);

  if (windowData) {
    if (now - windowData.timestamp < WINDOW_SIZE) {
      // Inside window
      if (windowData.count >= MAX_REQUESTS) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      windowData.count++;
    } else {
      // Outside window, reset
      windowData.count = 1;
      windowData.timestamp = now;
    }
  } else {
    rateLimit.set(ip, { count: 1, timestamp: now });
  }

  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}

export const config = {
  matcher: '/api/:path*',
}; 