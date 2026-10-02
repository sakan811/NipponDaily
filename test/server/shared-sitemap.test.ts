import { describe, it, expect } from "vitest";
import { robotsTxt, sitemapPaths, sitemapXml } from "~~/shared/sitemap";
import { partsIndex } from "~~/shared/parts";

describe("sitemap", () => {
  it("lists the static pages and every open word, never an upcoming one", () => {
    const paths = sitemapPaths("2026-01-02");

    expect(paths).toEqual(
      expect.arrayContaining(["/", "/words", "/parts", "/kana"]),
    );
    expect(paths).toContain("/words/2026-01-01");
    expect(paths).toContain("/words/2026-01-02");
    expect(paths).not.toContain("/words/2026-01-03");
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
    const xml = sitemapXml("https://example.test", "2026-01-01");

    expect(xml).toContain("<loc>https://example.test/words/2026-01-01</loc>");
    expect(xml).not.toContain("2026-01-02");
  });

  it("points robots.txt at the sitemap and keeps crawlers off the API", () => {
    const robots = robotsTxt("https://example.test");

    expect(robots).toContain("Sitemap: https://example.test/sitemap.xml");
    expect(robots).toContain("Disallow: /api/");
  });
});
