import { Redis } from "@upstash/redis";

// IP address validation patterns
const IP_PATTERNS = {
  // IPv4 pattern: 0-255.0-255.0-255.0-255
  ipv4: /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
  // IPv6 pattern (simplified - handles most common formats)
  ipv6: /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$|^::1$|^::$/,
} as const;

// Private IP ranges that should be rejected from forwarded headers
const PRIVATE_IP_RANGES = [
  // IPv4 private ranges
  { start: "10.0.0.0", end: "10.255.255.255" }, // Private Class A
  { start: "172.16.0.0", end: "172.31.255.255" }, // Private Class B
  { start: "192.168.0.0", end: "192.168.255.255" }, // Private Class C
  { start: "127.0.0.0", end: "127.255.255.255" }, // Loopback
  { start: "169.254.0.0", end: "169.254.255.255" }, // Link-local
  { start: "0.0.0.0", end: "0.255.255.255" }, // Current network
  // IPv4 multicast and reserved
  { start: "224.0.0.0", end: "239.255.255.255" }, // Multicast
  { start: "255.255.255.0", end: "255.255.255.255" }, // Broadcast
] as const;

/**
 * Check if an IPv4 address is within a given range
 */
function isInRange(ip: string, start: string, end: string): boolean {
  const ipToNum = (ipStr: string): number => {
    const parts = ipStr.split(".").map(Number);
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  };

  const ipNum = ipToNum(ip);
  return ipNum >= ipToNum(start) && ipNum <= ipToNum(end);
}

/**
 * Check if an IP address is a private/internal address
 * Private IPs in forwarded headers are likely spoofed
 */
function isPrivateIp(ip: string): boolean {
  // Check for IPv6 loopback
  if (ip === "::1" || ip === "::") {
    return true;
  }

  // Check IPv4 private ranges
  for (const range of PRIVATE_IP_RANGES) {
    if (isInRange(ip, range.start, range.end)) {
      return true;
    }
  }

  return false;
}

/**
 * Validate IPv4 address format and octet values
 */
function isValidIPv4(ip: string): boolean {
  const match = ip.match(IP_PATTERNS.ipv4);
  if (!match) {
    return false;
  }

  // Check that each octet is 0-255
  const [, ...octets] = match;
  return octets.every((octet) => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Validate IPv6 address format (basic validation)
 */
function isValidIPv6(ip: string): boolean {
  return IP_PATTERNS.ipv6.test(ip) || ip.includes(":");
}

/**
 * Sanitize and validate IP address to prevent spoofing
 * @param ip - IP address string to validate
 * @returns Sanitized IP or "unknown" if invalid
 */
function sanitizeIp(ip: string | undefined): string {
  if (!ip || typeof ip !== "string") {
    return "unknown";
  }

  // Trim whitespace
  const sanitized = ip.trim();

  // Validate IPv4
  if (sanitized.includes(".")) {
    if (!isValidIPv4(sanitized)) {
      return "unknown";
    }
    // Reject private IPs (potential spoofing)
    if (isPrivateIp(sanitized)) {
      return "unknown";
    }
    return sanitized;
  }

  // Validate IPv6 (basic check)
  if (sanitized.includes(":")) {
    if (!isValidIPv6(sanitized)) {
      return "unknown";
    }
    // Reject loopback
    if (sanitized === "::1" || sanitized === "::") {
      return "unknown";
    }
    return sanitized;
  }

  return "unknown";
}

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
 * Extract and validate client IP address from Nuxt event
 * Protects against IP spoofing by validating forwarded headers
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
  // We validate the leftmost (original client) IP
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    const sanitized = sanitizeIp(firstIp);
    if (sanitized !== "unknown") {
      return sanitized;
    }
    // If first IP is invalid/private, try the rightmost (last proxy)
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    for (let i = ips.length - 1; i >= 0; i--) {
      const validated = sanitizeIp(ips[i]);
      if (validated !== "unknown") {
        return validated;
      }
    }
  }

  // Try other common headers (from trusted proxies/services)
  if (cfConnectingIp) {
    const sanitized = sanitizeIp(cfConnectingIp);
    if (sanitized !== "unknown") {
      return sanitized;
    }
  }
  if (flyClientIp) {
    const sanitized = sanitizeIp(flyClientIp);
    if (sanitized !== "unknown") {
      return sanitized;
    }
  }
  if (trueClientIp) {
    const sanitized = sanitizeIp(trueClientIp);
    if (sanitized !== "unknown") {
      return sanitized;
    }
  }

  // Fall back to direct connection IP (from socket)
  // Note: This may be a private IP behind a reverse proxy
  const directIp = event.node.req.socket?.remoteAddress;
  if (directIp) {
    // For direct connection, we're more lenient since it's the actual connection
    const sanitized = directIp.trim();
    // Basic format validation
    if (isValidIPv4(sanitized) || isValidIPv6(sanitized)) {
      return sanitized;
    }
  }

  return "unknown";
}
