/**
 * The sitemap and robots.txt bodies, kept pure so they can be tested without
 * a server. Only open days are listed — an upcoming word's URL must not be
 * advertised any more than its text may be served.
 */
import { partsIndex } from "./parts";
import { WORD_ENTRIES, todayJst } from "./words";

const STATIC_PATHS = ["/", "/words", "/parts", "/kana"];

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Every page worth indexing: the static pages, each open word, and each part
 *  seen in more than one open word (a part seen once is a thin page). */
export function sitemapPaths(today: string = todayJst()): string[] {
  const words = WORD_ENTRIES.filter((e) => e.date <= today).map(
    (e) => `/words/${e.date}`,
  );
  const parts = partsIndex(today)
    .filter((p) => p.count > 1)
    .map((p) => `/parts/${encodeURIComponent(p.text)}`);
  return [...STATIC_PATHS, ...words, ...parts];
}

export function sitemapXml(origin: string, today: string = todayJst()): string {
  const urls = sitemapPaths(today)
    .map((path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(origin: string): string {
  return `User-agent: *\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
}
