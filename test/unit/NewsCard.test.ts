import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NewsCard from "~/app/components/NewsCard.vue";

const mockNews = {
  title: "Test News Article",
  summary: "This is a test summary",
  content: "Full content here",
  source: "Test News Network",
  publishedAt: "2024-01-15T10:30:00Z",
  category: "Technology",
  url: "https://example.com/news/test-article",
};

describe("NewsCard", () => {
  it("renders news information correctly", () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews },
    });

    expect(wrapper.text()).toContain(mockNews.title);
    expect(wrapper.text()).toContain(mockNews.summary);
    expect(wrapper.text()).toContain(mockNews.source);
    expect(wrapper.text()).toContain(mockNews.category);
  });

  it("displays formatted date", () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews },
    });

    expect(wrapper.text()).toContain("Jan 15, 2024");
  });

  it("renders external link when URL is provided", () => {
    const wrapper = mount(NewsCard, {
      props: { news: mockNews },
    });

    const link = wrapper.find(
      'a[href="https://example.com/news/test-article"]',
    );
    expect(link.exists()).toBe(true);
    expect(link.attributes("target")).toBe("_blank");
  });

  it("handles missing URL gracefully", () => {
    const newsWithoutUrl = { ...mockNews, url: undefined };
    const wrapper = mount(NewsCard, {
      props: { news: newsWithoutUrl },
    });

    expect(wrapper.find("a").exists()).toBe(false);
  });

  it("handles invalid date formats", () => {
    const newsWithInvalidDate = { ...mockNews, publishedAt: "invalid-date" };
    const wrapper = mount(NewsCard, {
      props: { news: newsWithInvalidDate },
    });

    expect(wrapper.text()).toContain("Date not available");
  });

  it("handles date parsing exceptions", () => {
    // Mock Date constructor to throw an exception
    const originalDate = global.Date;
    global.Date = class extends Date {
      constructor(...args: any[]) {
        if (args[0] === "problematic-date") {
          throw new Error("Invalid date");
        }
        return new originalDate(...args);
      }
    };

    const newsWithProblematicDate = {
      ...mockNews,
      publishedAt: "problematic-date",
    };
    const wrapper = mount(NewsCard, {
      props: { news: newsWithProblematicDate },
    });

    expect(wrapper.text()).toContain("Date not available");

    // Restore original Date constructor
    global.Date = originalDate;
  });

  it("applies correct category colors via UBadge", () => {
    const testCases = [
      { category: "Politics", expectedColor: "error" },
      { category: "Business", expectedColor: "primary" },
      { category: "Technology", expectedColor: "info" },
      { category: "Culture", expectedColor: "warning" },
      { category: "Sports", expectedColor: "success" },
      { category: "Unknown", expectedColor: "neutral" },
      { category: "Random", expectedColor: "neutral" },
    ];

    testCases.forEach(({ category, expectedColor }) => {
      const newsWithCategory = { ...mockNews, category };
      const wrapper = mount(NewsCard, {
        props: { news: newsWithCategory },
      });

      expect(wrapper.vm.categoryColor).toBe(expectedColor);
    });
  });

  it("handles empty/null URL gracefully", () => {
    const newsWithNullUrl = { ...mockNews, url: null };
    const wrapper = mount(NewsCard, {
      props: { news: newsWithNullUrl },
    });

    expect(wrapper.find("a").exists()).toBe(false);
  });

  it("handles null or undefined publishedAt date", () => {
    const newsWithNullDate = { ...mockNews, publishedAt: null };
    const wrapper = mount(NewsCard, {
      props: { news: newsWithNullDate },
    });

    expect(wrapper.text()).toContain("Date not available");
  });

  it("handles undefined publishedAt date", () => {
    const newsWithUndefinedDate = { ...mockNews, publishedAt: undefined };
    const wrapper = mount(NewsCard, {
      props: { news: newsWithUndefinedDate },
    });

    expect(wrapper.text()).toContain("Date not available");
  });

  describe("credibilityTextColor", () => {
    it("returns muted text color when no credibility score", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: undefined } },
      });

      expect(wrapper.vm.credibilityTextColor).toBe("var(--color-text-muted)");
    });

    it("returns green color for 100% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 1.0 } },
      });

      // Green (hue 120) at 70% saturation, 45% lightness
      expect(wrapper.vm.credibilityTextColor).toBe("hsl(120, 70%, 45%)");
    });

    it("returns yellow color for 50% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.5 } },
      });

      // Yellow (hue 60) at 70% saturation, 45% lightness
      expect(wrapper.vm.credibilityTextColor).toBe("hsl(60, 70%, 45%)");
    });

    it("returns red color for 0% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0 } },
      });

      // Red (hue 0) at 70% saturation, 45% lightness
      expect(wrapper.vm.credibilityTextColor).toBe("hsl(0, 70%, 45%)");
    });

    it("returns correct intermediate hue for 75% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.75 } },
      });

      // 75% of 120 = 90 (yellow-green)
      expect(wrapper.vm.credibilityTextColor).toBe("hsl(90, 70%, 45%)");
    });

    it("returns correct intermediate hue for 25% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.25 } },
      });

      // 25% of 120 = 30 (orange-red)
      expect(wrapper.vm.credibilityTextColor).toBe("hsl(30, 70%, 45%)");
    });
  });

  describe("credibilityIconColor", () => {
    it("returns muted text color when no credibility score", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: undefined } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe("var(--color-text-muted)");
    });

    it("returns green color for 100% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 1.0 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe("hsl(120, 70%, 45%)");
    });

    it("returns yellow color for 50% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.5 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe("hsl(60, 70%, 45%)");
    });

    it("returns red color for 0% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe("hsl(0, 70%, 45%)");
    });

    it("returns correct intermediate hue for 85% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.85 } },
      });

      // 85% of 120 = 102 (green-yellow)
      expect(wrapper.vm.credibilityIconColor).toBe("hsl(102, 70%, 45%)");
    });

    it("returns correct intermediate hue for 30% credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.3 } },
      });

      // 30% of 120 = 36 (yellow-orange)
      expect(wrapper.vm.credibilityIconColor).toBe("hsl(36, 70%, 45%)");
    });
  });

  describe("credibility metadata dropdown", () => {
    it("renders dropdown when credibilityMetadata exists", () => {
      const wrapper = mount(NewsCard, {
        props: {
          news: {
            ...mockNews,
            credibilityScore: 0.75,
            credibilityMetadata: {
              sourceReputation: 0.85,
              domainTrust: 0.72,
              contentQuality: 0.9,
              aiConfidence: 0.65,
            },
          },
        },
      });

      expect(wrapper.find(".u-dropdown").exists()).toBe(true);
    });

    it("does not render dropdown when credibilityMetadata is missing", () => {
      const wrapper = mount(NewsCard, {
        props: {
          news: {
            ...mockNews,
            credibilityScore: 0.75,
            credibilityMetadata: undefined,
          },
        },
      });

      expect(wrapper.find(".u-dropdown").exists()).toBe(false);
    });

    it("does not render dropdown when credibilityMetadata is null", () => {
      const wrapper = mount(NewsCard, {
        props: {
          news: {
            ...mockNews,
            credibilityScore: 0.75,
            credibilityMetadata: null,
          },
        },
      });

      expect(wrapper.find(".u-dropdown").exists()).toBe(false);
    });

    it("calculates correct percentage values for all metadata fields", () => {
      const wrapper = mount(NewsCard, {
        props: {
          news: {
            ...mockNews,
            credibilityScore: 0.75,
            credibilityMetadata: {
              sourceReputation: 0.85,
              domainTrust: 0.72,
              contentQuality: 0.9,
              aiConfidence: 0.65,
            },
          },
        },
      });

      expect(wrapper.vm.sourceReputationPercent).toBe(85);
      expect(wrapper.vm.domainTrustPercent).toBe(72);
      expect(wrapper.vm.contentQualityPercent).toBe(90);
      expect(wrapper.vm.aiConfidencePercent).toBe(65);
    });

    it("rounds decimal percentage values correctly", () => {
      const wrapper = mount(NewsCard, {
        props: {
          news: {
            ...mockNews,
            credibilityScore: 0.75,
            credibilityMetadata: {
              sourceReputation: 0.845,
              domainTrust: 0.724,
              contentQuality: 0.899,
              aiConfidence: 0.656,
            },
          },
        },
      });

      expect(wrapper.vm.sourceReputationPercent).toBe(85);
      expect(wrapper.vm.domainTrustPercent).toBe(72);
      expect(wrapper.vm.contentQualityPercent).toBe(90);
      expect(wrapper.vm.aiConfidencePercent).toBe(66);
    });

    it("returns zero when credibilityMetadata is undefined", () => {
      const wrapper = mount(NewsCard, {
        props: {
          news: {
            ...mockNews,
            credibilityScore: 0.75,
            credibilityMetadata: undefined,
          },
        },
      });

      expect(wrapper.vm.sourceReputationPercent).toBe(0);
      expect(wrapper.vm.domainTrustPercent).toBe(0);
      expect(wrapper.vm.contentQualityPercent).toBe(0);
      expect(wrapper.vm.aiConfidencePercent).toBe(0);
    });
  });
});
