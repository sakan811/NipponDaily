import { Redis } from "@upstash/redis";

// Rate limit configuration - max requests per day (RPD)
// Can be overridden via RATE_LIMIT_MAX_REQUESTS environment variable
const RATE_LIMIT_CONFIG = {
  // Maximum requests per day (default: 3, configurable via ENV)
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "3", 10),
  // Time window in seconds (24 hours)
  windowSeconds: 86400, // 24 * 60 * 60
} as const;

// Rate limit result type
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
}

// Get Redis client instance
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "Upstash Redis credentials not configured - rate limiting disabled",
    );
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

/**
 * Check if a request should be rate limited using Upstash Redis sliding window
 * @param identifier - Unique identifier for the rate limit (e.g., IP address)
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  // If Redis is not configured, allow all requests (fail-open)
  if (!redis) {
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests,
      resetTime: new Date(Date.now() + RATE_LIMIT_CONFIG.windowSeconds * 1000),
      limit: RATE_LIMIT_CONFIG.maxRequests,
    };
  }

  try {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_CONFIG.windowSeconds * 1000;
    const key = `ratelimit:${identifier}`;

    // Use a sorted set to track request timestamps
    const pipeline = redis.pipeline();

    // Remove old entries outside the current window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count current requests in the window
    pipeline.zcard(key);

    // Add current request timestamp
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

    // Set expiration to prevent stale keys
    pipeline.expire(key, RATE_LIMIT_CONFIG.windowSeconds);

    const results = await pipeline.exec<[number, number, string, boolean]>();

    if (!results || results.length < 4 || results[1] === null) {
      throw new Error("Failed to execute rate limit pipeline");
    }

    const currentCount = results[1] as number;
    const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxRequests - currentCount);
    const allowed = currentCount < RATE_LIMIT_CONFIG.maxRequests;

    return {
      allowed,
      remaining,
      resetTime: new Date(now + RATE_LIMIT_CONFIG.windowSeconds * 1000),
      limit: RATE_LIMIT_CONFIG.maxRequests,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests,
      resetTime: new Date(Date.now() + RATE_LIMIT_CONFIG.windowSeconds * 1000),
      limit: RATE_LIMIT_CONFIG.maxRequests,
    };
  }
}

/**
 * Extract client IP address from Nuxt event
 */
export function getClientIp(event: {
  node: { req: { socket?: { remoteAddress?: string } } };
}): string {
  // Try to get IP from various headers (for proxied requests)
  const headers = (
    event.node.req as typeof event.node.req & {
      headers?: Record<string, string | undefined>;
    }
  ).headers;

  const forwardedFor = headers?.["x-forwarded-for"];
  const cfConnectingIp = headers?.["cf-connecting-ip"];
  const flyClientIp = headers?.["fly-client-ip"];
  const trueClientIp = headers?.["true-client-ip"];

  // x-forwarded-for can contain multiple IPs, use the first one
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || forwardedFor;
  }

  // Try other common headers
  if (cfConnectingIp) return cfConnectingIp;
  if (flyClientIp) return flyClientIp;
  if (trueClientIp) return trueClientIp;

  // Fall back to direct connection IP
  return event.node.req.socket?.remoteAddress || "unknown";
}
