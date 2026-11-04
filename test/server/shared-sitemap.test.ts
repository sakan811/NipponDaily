import { describe, it, expect } from "vitest";
import {
  CRAWL_DELAY_SECONDS,
  SCRAPER_AGENTS,
  SITEMAP_RECENT_DAYS,
  robotsTxt,
  sitemapPaths,
  sitemapXml,
} from "~~/shared/sitemap";
import { partsIndex } from "~~/shared/parts";
import { WORD_ENTRIES } from "~~/shared/words";

const FIRST = WORD_ENTRIES[0]!.date;
const SECOND = WORD_ENTRIES[1]!.date;
const THIRD = WORD_ENTRIES[2]!.date;

describe("sitemap", () => {
  it("lists the static pages and every open word, never an upcoming one", () => {
    const paths = sitemapPaths(SECOND);

    expect(paths).toEqual(
      expect.arrayContaining(["/", "/explore", "/patterns", "/parts", "/kana"]),
    );
    expect(paths).toContain(`/words/${FIRST}`);
    expect(paths).toContain(`/words/${SECOND}`);
    expect(paths).not.toContain(`/words/${THIRD}`);
    expect(paths.filter((p) => p.startsWith("/words/"))).toHaveLength(2);
  });

  it("lists only the newest open days, not the whole archive", () => {
    const today = "2026-10-05";
    const words = sitemapPaths(today).filter((p) => p.startsWith("/words/"));
    const open = WORD_ENTRIES.filter((e) => e.date <= today);

    expect(open.length).toBeGreaterThan(SITEMAP_RECENT_DAYS);
    expect(words).toHaveLength(SITEMAP_RECENT_DAYS);
    expect(words.at(-1)).toBe(`/words/${today}`);
    expect(words[0]).toBe(
      `/words/${open[open.length - SITEMAP_RECENT_DAYS]!.date}`,
    );
    expect(words).not.toContain(`/words/${FIRST}`);
  });

  it("lists only parts seen in more than one open word, encoded", () => {
    const paths = sitemapPaths("2026-03-08");
    const partPaths = paths.filter((p) => p.startsWith("/parts/"));

    expect(partPaths).toContain(`/parts/${encodeURIComponent("日")}`);
    expect(partPaths).toHaveLength(
      partsIndex("2026-03-08").filter((p) => p.count > 1).length,
    );
  });

  it("renders absolute, XML-escaped URLs", () => {
    const xml = sitemapXml("https://example.test", FIRST);

    expect(xml).toContain(`<loc>https://example.test/words/${FIRST}</loc>`);
    expect(xml).not.toContain(SECOND);
  });

  it("points robots.txt at the sitemap and keeps crawlers off the API", () => {
    const robots = robotsTxt("https://example.test");

    expect(robots).toContain("Sitemap: https://example.test/sitemap.xml");
    expect(robots).toContain("Disallow: /api/");
  });

  it("turns the bulk scrapers away and asks the rest to slow down", () => {
    const robots = robotsTxt("https://example.test");

    for (const agent of SCRAPER_AGENTS) {
      expect(robots).toContain(`User-agent: ${agent}\n`);
    }
    expect(robots).toMatch(/User-agent: PerplexityBot\nDisallow: \/\n/);
    expect(robots).toContain(
      `User-agent: *\nCrawl-delay: ${CRAWL_DELAY_SECONDS}\nDisallow: /api/`,
    );
    expect(robots.endsWith("\n")).toBe(true);
  });
});
