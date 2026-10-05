import { dayCacheControl, isDayCacheable } from "../utils/day-cache";

/**
 * Lets a CDN keep every successful GET answer until the next midnight in Japan
 * (see `server/utils/day-cache.ts`). Only a `200` is marked: an error is never
 * cached, and a route that already set its own `cache-control` keeps it.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event) => {
    if (event.method !== "GET" || event.node.res.statusCode !== 200) return;
    const path = event.path.split("?")[0] ?? "";
    if (!isDayCacheable(path)) return;
    if (getResponseHeader(event, "cache-control")) return;
    setResponseHeader(event, "cache-control", dayCacheControl());
  });
});
