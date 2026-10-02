import type { H3Event } from "h3";

/**
 * The site's public origin (no trailing slash) for absolute URLs in the
 * sitemap and robots.txt: `NUXT_PUBLIC_SITE_URL` when set (the canonical
 * domain), otherwise the origin the request came in on.
 */
export function siteOrigin(event: H3Event): string {
  const configured = String(
    useRuntimeConfig(event).public?.siteUrl ?? "",
  ).trim();
  return (configured || getRequestURL(event).origin).replace(/\/+$/, "");
}
