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

  it("applies correct category color classes", () => {
    const testCases = [
      { category: "Politics", expectedClass: "badge-politics" },
      { category: "Business", expectedClass: "badge-business" },
      { category: "Technology", expectedClass: "badge-technology" },
      { category: "Culture", expectedClass: "badge-culture" },
      { category: "Sports", expectedClass: "badge-sports" },
      { category: "Unknown", expectedClass: "bg-[var(--color-accent)]" },
      { category: "Random", expectedClass: "bg-[var(--color-accent)]" },
    ];

    testCases.forEach(({ category, expectedClass }) => {
      const newsWithCategory = { ...mockNews, category };
      const wrapper = mount(NewsCard, {
        props: { news: newsWithCategory },
      });

      const categoryBadge = wrapper.find("span.inline-block");
      const classes = categoryBadge.classes();
      expect(
        classes.some((cls) => cls.includes(expectedClass.split(" ")[0])),
      ).toBe(true);
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

      expect(wrapper.vm.credibilityTextColor).toBe(
        "text-[var(--color-text-muted)]",
      );
    });

    it("returns primary color for high credibility (>= 0.8)", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.85 } },
      });

      expect(wrapper.vm.credibilityTextColor).toBe(
        "text-[var(--color-primary)]",
      );
    });

    it("returns yellow for medium credibility (>= 0.5 < 0.8)", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.65 } },
      });

      expect(wrapper.vm.credibilityTextColor).toBe("text-yellow-700");
    });

    it("returns secondary color for low credibility (< 0.5)", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.3 } },
      });

      expect(wrapper.vm.credibilityTextColor).toBe(
        "text-[var(--color-secondary)]",
      );
    });
  });

  describe("credibilityIconColor", () => {
    it("returns muted text color when no credibility score", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: undefined } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe(
        "text-[var(--color-text-muted)]",
      );
    });

    it("returns primary color for high credibility (>= 0.8)", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.9 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe(
        "text-[var(--color-primary)]",
      );
    });

    it("returns primary color for exactly 0.8 credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.8 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe(
        "text-[var(--color-primary)]",
      );
    });

    it("returns yellow for medium credibility (>= 0.5 < 0.8)", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.6 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe("text-yellow-600");
    });

    it("returns yellow for exactly 0.5 credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.5 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe("text-yellow-600");
    });

    it("returns secondary color for low credibility (< 0.5)", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0.3 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe(
        "text-[var(--color-secondary)]",
      );
    });

    it("returns muted text color for zero credibility", () => {
      const wrapper = mount(NewsCard, {
        props: { news: { ...mockNews, credibilityScore: 0 } },
      });

      expect(wrapper.vm.credibilityIconColor).toBe(
        "text-[var(--color-text-muted)]",
      );
    });
  });
});
