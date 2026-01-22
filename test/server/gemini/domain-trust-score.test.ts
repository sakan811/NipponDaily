import { describe, it, expect, beforeEach } from "vitest";

import { getService } from "./setup";

describe("GeminiService - Domain Trust Score", () => {
  let service: any;

  beforeEach(async () => {
    service = await getService();
  });

  it("returns high scores for trusted Japanese news domains", () => {
    // Test just one domain first to isolate the issue
    const score = service["getDomainTrustScore"]("https://nhk.or.jp/news");
    expect(score).toBe(0.95);

    // Then test others
    expect(service["getDomainTrustScore"]("https://www.nikkei.com")).toBe(0.95);
    expect(service["getDomainTrustScore"]("https://japantimes.co.jp")).toBe(
      0.9,
    );
    expect(service["getDomainTrustScore"]("https://www.asahi.com")).toBe(0.9);
    expect(service["getDomainTrustScore"]("https://mainichi.jp")).toBe(0.9);
    expect(service["getDomainTrustScore"]("https://www.yomiuri.co.jp")).toBe(
      0.9,
    );
    expect(service["getDomainTrustScore"]("https://asia.nikkei.com")).toBe(
      0.95,
    );
    expect(service["getDomainTrustScore"]("https://kyodonews.net")).toBe(0.9);
    expect(service["getDomainTrustScore"]("https://www.tansa.jp")).toBe(0.9);
    expect(service["getDomainTrustScore"]("https://nhkworld.jp")).toBe(0.95);
  });

  it("returns high scores for trusted international news domains", () => {
    const trustedInternational = [
      { source: "https://reuters.com/world/asia-pacific", expected: 0.85 },
      { source: "https://bbc.com/news/world/asia", expected: 0.8 },
      { source: "https://apnews.com/japan", expected: 0.8 },
      { source: "https://bloomberg.com/asia", expected: 0.85 },
      { source: "https://nippon.com/en/japan", expected: 0.85 },
      { source: "https://www.ft.com/japan", expected: 0.8 },
      { source: "https://wsj.asia/japan", expected: 0.8 },
      {
        source: "https://fortune.com/2024/01/15/japan-business",
        expected: 0.75,
      },
    ];

    trustedInternational.forEach(({ source, expected }) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBe(expected);
    });
  });

  it("returns moderate score for unknown domains", () => {
    const unknownDomains = [
      "https://unknown-news-site.com",
      "https://random-blog.org",
      "https://some-website.net",
    ];

    unknownDomains.forEach((source) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBe(0.6);
    });
  });

  it("returns low score for malformed sources", () => {
    const malformedSources = [
      "not-a-url",
      "",
      "htp://incomplete-url",
      "javascript:malicious",
    ];

    malformedSources.forEach((source) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBe(0.4);
    });
  });

  it("handles case insensitive domain matching", () => {
    const caseVariations = [
      "https://NHK.OR.JP/news",
      "https://Nikkei.com/article",
      "https://REUTERS.COM/world",
    ];

    caseVariations.forEach((source) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBeGreaterThanOrEqual(0.8);
    });
  });

  it("handles domain-only sources", () => {
    const domainOnlySources = ["nhk.or.jp", "nikkei.com", "reuters.com"];

    domainOnlySources.forEach((source) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBeGreaterThanOrEqual(0.8);
    });
  });

  it("handles subdomains of trusted domains", () => {
    const subdomains = [
      "https://news.nhk.or.jp",
      "https://asia.nikkei.com",
      "https://www.bbc.co.uk/news",
    ];

    subdomains.forEach((source) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBeGreaterThanOrEqual(0.8);
    });
  });

  it("returns appropriate scores for Japanese news aggregators", () => {
    const aggregators = [
      { source: "https://japantoday.com", expected: 0.75 },
      { source: "https://newsonjapan.com", expected: 0.75 },
    ];

    aggregators.forEach(({ source, expected }) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBe(expected);
    });
  });

  it("recognizes regional Japanese newspapers", () => {
    const regional = [
      { source: "https://hokkaido-np.co.jp", expected: 0.8 },
      { source: "https://chugoku-np.co.jp", expected: 0.8 },
      { source: "https://kobe-np.co.jp", expected: 0.8 },
    ];

    regional.forEach(({ source, expected }) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBe(expected);
    });
  });

  it("handles invalid URLs that throw during parsing", () => {
    const invalidUrls = ["https://", "http://", "https:///"];

    invalidUrls.forEach((source) => {
      const score = service["getDomainTrustScore"](source);
      expect(score).toBe(0.4);
    });
  });
});
