/**
 * A fixed-window request limiter, kept in process memory only: a client's
 * address is held for one window and then forgotten, never written to Redis or
 * anywhere else. Each server instance counts for itself, so on a platform that
 * runs several instances the limit is per instance. It is a brake on a runaway
 * client, not a quota.
 */

export const RATE_LIMIT = { limit: 120, windowMs: 60_000 } as const;

/** What the limiter guards: the JSON API and the share images, the two places
 *  a request does real work. Pages are cached by the CDN; the cron has its own
 *  secret. */
export function isRateLimited(path: string): boolean {
  if (/^\/api\/cron(\/|$)/.test(path)) return false;
  return path.startsWith("/api/") || path === "/og.png";
}

export interface RateVerdict {
  allowed: boolean;
  /** Whole seconds until the client's window resets (at least 1). */
  retryAfter: number;
}

export function createRateLimiter(
  limit: number = RATE_LIMIT.limit,
  windowMs: number = RATE_LIMIT.windowMs,
) {
  const windows = new Map<string, { start: number; count: number }>();

  function sweep(now: number) {
    for (const [key, w] of windows) {
      if (now - w.start >= windowMs) windows.delete(key);
    }
  }

  return {
    hit(key: string, now: number = Date.now()): RateVerdict {
      // Expired windows are dropped as the map grows, so it cannot fill up
      // with every address ever seen.
      if (windows.size > 1000) sweep(now);
      let w = windows.get(key);
      if (!w || now - w.start >= windowMs) {
        w = { start: now, count: 0 };
        windows.set(key, w);
      }
      w.count += 1;
      return {
        allowed: w.count <= limit,
        retryAfter: Math.max(1, Math.ceil((w.start + windowMs - now) / 1000)),
      };
    },
    get size() {
      return windows.size;
    },
  };
}
