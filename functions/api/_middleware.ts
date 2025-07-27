import type { PagesFunction, Env } from '../types';
import { verifyJWT, extractBearerToken } from '../lib/auth';
import { checkRateLimit, getRateLimitHeaders } from '../lib/rateLimit';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next } = context;

  // CORS headers
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Skip auth for health check
  if (request.url.includes('/api/health')) {
    return next();
  }

  // Extract and verify JWT
  const authHeader = request.headers.get('Authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Rate limiting
  const rateLimitKey = `api:${payload.userId}`;
  const { allowed, remaining, resetTime } = checkRateLimit(rateLimitKey);

  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...getRateLimitHeaders(remaining, resetTime),
      },
    });
  }

  // Add user context to request
  const modifiedRequest = new Request(request, {
    headers: new Headers(request.headers),
  });

  // Store user info in headers for downstream handlers
  modifiedRequest.headers.set('X-User-Id', payload.userId);
  modifiedRequest.headers.set('X-User-Email', payload.email);
  modifiedRequest.headers.set('X-Organization-Id', payload.organizationId);
  modifiedRequest.headers.set('X-User-Role', payload.role);

  // Continue to the API handler
  const response = await next(modifiedRequest);

  // Add CORS and rate limit headers to response
  const modifiedResponse = new Response(response.body, response);
  modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
  Object.entries(getRateLimitHeaders(remaining, resetTime)).forEach(([key, value]) => {
    modifiedResponse.headers.set(key, value);
  });

  return modifiedResponse;
};
