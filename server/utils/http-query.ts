import type { H3Event } from "h3";

/**
 * getQuery(event) as used by the GET endpoints under server/api/ — wrapped
 * in a fallback for the same reason daily-game.get.ts originally needed one:
 * a raw H3Event (as opposed to the object test mocks pass) can reach here
 * without a fully-populated node request, so this re-parses the URL's own
 * search params rather than throwing.
 */
export function safeGetQuery(event: H3Event): Record<string, unknown> {
  try {
    return getQuery(event);
  } catch {
    const urlObj = new URL(
      event.path || event.node?.req?.url || "",
      "http://localhost",
    );
    return Object.fromEntries(urlObj.searchParams.entries());
  }
}
