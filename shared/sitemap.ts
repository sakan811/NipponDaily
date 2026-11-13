/**
 * The sitemap and robots.txt bodies, kept pure so they can be tested without
 * a server. Only open days are listed — an upcoming word's URL must not be
 * advertised any more than its text may be served — and only the most recent
 * of them: the archive is reached through Explore and each page's related
 * words, and a sitemap of every day invites a crawler to render
 * the whole archive at once.
 */
import { DOC_PATHS } from "./docs";
import { kanjiIndex } from "./kanji";
import { partsIndex } from "./parts";
import { API_PREFIX, ROUTES } from "./routes";
import { WORD_ENTRIES, todayJst } from "./words";

/** How many of the newest open days the sitemap lists. */
export const SITEMAP_RECENT_DAYS = 60;

/** Bulk scrapers that gather pages to train or feed AI models. They fetch every
 *  page of the archive and send nobody back, so robots.txt turns them away. */
export const SCRAPER_AGENTS = [
  "Amazonbot",
  "anthropic-ai",
  "Bytespider",
  "CCBot",
  "ClaudeBot",
  "Diffbot",
  "GPTBot",
  "ImagesiftBot",
  "meta-externalagent",
  "Omgilibot",
  "PerplexityBot",
] as const;

/** Seconds a polite crawler is asked to wait between requests. */
export const CRAWL_DELAY_SECONDS = 10;

const STATIC_PATHS = [
  "/",
  "/explore",
  "/patterns",
  "/parts",
  "/kanji",
  "/kana",
  ...DOC_PATHS,
];

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Every page worth indexing: the static pages, the newest open words
 *  (`SITEMAP_RECENT_DAYS` of them), and each part or kanji seen in more than
 *  one open word (one seen once is a thin page). */
export function sitemapPaths(today: string = todayJst()): string[] {
  const words = WORD_ENTRIES.filter((e) => e.date <= today)
    .slice(-SITEMAP_RECENT_DAYS)
    .map((e) => `/words/${e.date}`);
  const parts = partsIndex(today)
    .filter((p) => p.count > 1)
    .map((p) => `/parts/${encodeURIComponent(p.text)}`);
  const kanji = kanjiIndex(today)
    .filter((k) => k.count > 1)
    .map((k) => `/kanji/${encodeURIComponent(k.char)}`);
  return [...STATIC_PATHS, ...words, ...parts, ...kanji];
}

export function sitemapXml(origin: string, today: string = todayJst()): string {
  const urls = sitemapPaths(today)
    .map((path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(origin: string): string {
  const scrapers = SCRAPER_AGENTS.map((agent) => `User-agent: ${agent}`).join(
    "\n",
  );
  return (
    [
      `${scrapers}\nDisallow: /`,
      `User-agent: *\nCrawl-delay: ${CRAWL_DELAY_SECONDS}\nDisallow: ${API_PREFIX}`,
      `Sitemap: ${origin}${ROUTES.sitemap}`,
    ].join("\n\n") + "\n"
  );
}
