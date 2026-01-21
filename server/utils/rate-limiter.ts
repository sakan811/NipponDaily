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

// In-memory rate limiter for fallback when Redis is unavailable
interface InMemoryEntry {
  timestamps: number[];
  resetTime: number;
}

// Use a Map for in-memory rate limiting (per-identifier tracking)
const inMemoryStore = new Map<string, InMemoryEntry>();

// Cleanup interval for in-memory store (run every hour)
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.windowSeconds * 1000;

  for (const [key, entry] of inMemoryStore.entries()) {
    // Remove old timestamps outside the window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    // Remove empty entries
    if (entry.timestamps.length === 0 && now > entry.resetTime) {
      inMemoryStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Get Redis client instance
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

/**
 * Check rate limit using in-memory storage (fallback when Redis unavailable)
 * @param identifier - Unique identifier for the rate limit (e.g., IP address)
 * @returns RateLimitResult with allowed status and metadata
 */
function checkInMemoryRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.windowSeconds * 1000;
  const key = `ratelimit:${identifier}`;

  // Get or create entry for this identifier
  let entry = inMemoryStore.get(key);

  if (!entry) {
    entry = {
      timestamps: [],
      resetTime: now + RATE_LIMIT_CONFIG.windowSeconds * 1000,
    };
    inMemoryStore.set(key, entry);
  }

  // Clean up old timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  const currentCount = entry.timestamps.length;
  const allowed = currentCount < RATE_LIMIT_CONFIG.maxRequests;

  // Add current request timestamp if allowed
  if (allowed) {
    entry.timestamps.push(now);
  }

  // Update reset time if window has passed
  if (now > entry.resetTime) {
    entry.resetTime = now + RATE_LIMIT_CONFIG.windowSeconds * 1000;
  }

  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxRequests - entry.timestamps.length);

  return {
    allowed,
    remaining,
    resetTime: new Date(entry.resetTime),
    limit: RATE_LIMIT_CONFIG.maxRequests,
  };
}

/**
 * Check if a request should be rate limited
 * Uses Upstash Redis as primary, in-memory storage as fallback
 * @param identifier - Unique identifier for the rate limit (e.g., IP address)
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  // If Redis is not configured, use in-memory rate limiting
  if (!redis) {
    return checkInMemoryRateLimit(identifier);
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
    // Fallback to in-memory rate limiting if Redis fails
    console.warn("Redis rate limit failed, using in-memory fallback:", error);
    return checkInMemoryRateLimit(identifier);
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
