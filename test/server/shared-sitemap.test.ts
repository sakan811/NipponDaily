import { describe, it, expect } from "vitest";
import { robotsTxt, sitemapPaths, sitemapXml } from "~~/shared/sitemap";
import { partsIndex } from "~~/shared/parts";
import { WORD_ENTRIES } from "~~/shared/words";

const FIRST = WORD_ENTRIES[0]!.date;
const SECOND = WORD_ENTRIES[1]!.date;
const THIRD = WORD_ENTRIES[2]!.date;

describe("sitemap", () => {
  it("lists the static pages and every open word, never an upcoming one", () => {
    const paths = sitemapPaths(SECOND);

    expect(paths).toEqual(
      expect.arrayContaining([
        "/",
        "/words",
        "/explore",
        "/patterns",
        "/parts",
        "/kana",
      ]),
    );
    expect(paths).toContain(`/words/${FIRST}`);
    expect(paths).toContain(`/words/${SECOND}`);
    expect(paths).not.toContain(`/words/${THIRD}`);
    expect(paths.filter((p) => p.startsWith("/words/"))).toHaveLength(2);
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
});
