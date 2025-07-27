interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter for demo
// In production, use Cloudflare Durable Objects or KV
const rateLimitStore = new Map<string, RateLimitInfo>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const info = rateLimitStore.get(identifier);

  // Clean up old entries
  if (info && now > info.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const current = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + config.windowMs,
  };

  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  // Increment count
  current.count++;
  rateLimitStore.set(identifier, current);

  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime,
  };
}

export function getRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number = 100
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  };
}
