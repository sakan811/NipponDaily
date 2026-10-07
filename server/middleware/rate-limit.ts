import { createRateLimiter, isRateLimited } from "../utils/rate-limit";

const limiter = createRateLimiter();

/**
 * Answers `429` with `Retry-After` when one address asks the API or the share
 * images too often (see `server/utils/rate-limit.ts`). A request with no
 * client address, such as a page asking the API in-process while it renders, is
 * never counted.
 */
export default defineEventHandler((event) => {
  const path = event.path.split("?")[0] ?? "";
  if (!isRateLimited(path)) return;

  const ip = getRequestIP(event, { xForwardedFor: true });
  if (!ip) return;

  const { allowed, retryAfter } = limiter.hit(ip);
  if (allowed) return;

  setResponseHeader(event, "retry-after", retryAfter);
  setResponseHeader(event, "cache-control", "no-store");
  throw createError({
    statusCode: 429,
    statusMessage: "Too Many Requests",
    data: { error: "Too many requests. Try again shortly." },
  });
});
