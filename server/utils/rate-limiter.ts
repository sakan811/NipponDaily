import { Redis } from "@upstash/redis";

// Rate limit configuration - max requests per day (RPD)
const RATE_LIMIT_WINDOW_SECONDS = 86400; // 24 * 60 * 60;

// Rate limit configuration type
export interface RateLimitConfig {
  upstashRedisRestUrl?: string;
  upstashRedisRestToken?: string;
  rateLimitMaxRequests?: number;
}

// Rate limit result type
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
}

// Rate limit error class
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Get max requests from config or default
 */
function getMaxRequests(config?: RateLimitConfig): number {
  if (config?.rateLimitMaxRequests) {
    return config.rateLimitMaxRequests;
  }
  return 3; // default
}

/**
 * Get Redis client instance
 */
function getRedisClient(config: RateLimitConfig): Redis {
  const url = config.upstashRedisRestUrl;
  const token = config.upstashRedisRestToken;

  if (!url || !token) {
    throw new RateLimitError(
      "Redis not configured: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required for rate limiting",
    );
  }

  return new Redis({
    url,
    token,
  });
}

/**
 * Check if a request should be rate limited
 * Uses Upstash Redis - requires Redis to be configured and operational
 * @param identifier - Unique identifier for the rate limit (e.g., IP address)
 * @param config - Rate limit configuration from runtime config
 * @returns RateLimitResult with allowed status and metadata
 * @throws RateLimitError if Redis is not configured or fails
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {},
): Promise<RateLimitResult> {
  let redis: Redis;

  try {
    redis = getRedisClient(config);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error("Rate limit error:", error.message);
      throw error;
    }
    throw new RateLimitError(
      `Redis initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  try {
    const maxRequests = getMaxRequests(config);
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_SECONDS * 1000;
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
    pipeline.expire(key, RATE_LIMIT_WINDOW_SECONDS);

    const results = await pipeline.exec<[number, number, string, boolean]>();

    if (!results || results.length < 4 || results[1] === null) {
      throw new Error("Failed to execute rate limit pipeline");
    }

    const currentCount = results[1] as number;
    const remaining = Math.max(0, maxRequests - currentCount);
    const allowed = currentCount < maxRequests;

    return {
      allowed,
      remaining,
      resetTime: new Date(now + RATE_LIMIT_WINDOW_SECONDS * 1000),
      limit: maxRequests,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Redis rate limit failed: ${message}`);
    throw new RateLimitError(`Redis not available or not working: ${message}`);
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

  // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
  // Use the first (leftmost) IP as the client IP
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  // Try other common headers (from trusted proxies/services)
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  if (flyClientIp) {
    return flyClientIp;
  }
  if (trueClientIp) {
    return trueClientIp;
  }

  // Fall back to direct connection IP (from socket)
  return event.node.req.socket?.remoteAddress || "unknown";
}
