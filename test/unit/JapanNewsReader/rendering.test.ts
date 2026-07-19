import { describe, it, expect, vi, beforeEach } from "vitest";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Rendering", () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn().mockResolvedValue({
      success: true,
      data: mockNews,
      count: 2,
      timestamp: "2024-01-15T10:00:00Z",
    });
    (global as any).$fetch = mockFetch;
  });

  it("renders main component structure", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: {
            name: "BriefingCard",
            props: ["briefing"],
            template:
              '<div class="briefing-card">{{ briefing.mainHeadline }}</div>',
          },
        },
      },
    });

    expect(wrapper.find(".container").exists()).toBe(true);
  });

  it("renders category filter buttons", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: {
            name: "BriefingCard",
            props: ["briefing"],
            template:
              '<div class="briefing-card">{{ briefing.mainHeadline }}</div>',
          },
        },
      },
    });

    const categoryButtons = wrapper.findAll("button");
    expect(categoryButtons.length).toBeGreaterThan(1);
  });

  it("has news loading functionality", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: {
            name: "BriefingCard",
            props: ["briefing"],
            template:
              '<div class="briefing-card">{{ briefing.mainHeadline }}</div>',
          },
        },
      },
    });

    expect(wrapper.vm.refreshNews).toBeDefined();
    expect(typeof wrapper.vm.refreshNews).toBe("function");
  });

  it("renders NewsCard components when news is loaded", async () => {
    const mockBriefingCard = {
      name: "BriefingCard",
      props: ["briefing"],
      template: '<div class="briefing-card">{{ briefing.mainHeadline }}</div>',
    };
    const wrapper = mountReader({
      global: {
        components: { BriefingCard: mockBriefingCard },
      },
    });

    // Fetch news
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedStoryId = wrapper.vm.filteredStories[0]?.id || "story-1";
    await wrapper.vm.$nextTick();

    // Check that NewsCard components are rendered
    expect(wrapper.find(".briefing-card").exists()).toBe(true);
  });

  it("binds mobileMenuOpen to UHeader via v-model:open", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: {
            name: "BriefingCard",
            props: ["briefing"],
            template:
              '<div class="briefing-card">{{ briefing.mainHeadline }}</div>',
          },
        },
      },
    });

    expect(wrapper.vm.mobileMenuOpen).toBe(false);
    expect(wrapper.find(".u-header").exists()).toBe(true);
  });

  it("renders Trending badge only when a story is trending (trendScore > 5)", async () => {
    const mockBriefingCard = {
      name: "BriefingCard",
      props: ["briefing"],
      template: '<div class="briefing-card">{{ briefing.mainHeadline }}</div>',
    };

    // Test 1: > 5 sources -> displays badge
    const mockTrendingFetch = vi.fn().mockResolvedValue({
      success: true,
      data: {
        ...mockNews,
        sourcesProcessed: Array(6)
          .fill(null)
          .map((_, i) => ({
            title: `Tech News ${i}`,
            source: `Tech Source ${i}`,
            url: `https://example.com/${i}`,
            credibilityScore: 0.9,
            publishedAt: "2024-01-15T10:00:00Z",
            category: "Tech" as any,
          })),
      },
      count: 6,
      timestamp: "2024-01-15T10:00:00Z",
    });
    (global as any).$fetch = mockTrendingFetch;

    const wrapper = mountReader({
      global: {
        components: { BriefingCard: mockBriefingCard },
      },
    });

    await wrapper.vm.refreshNews();
    await wrapper.vm.$nextTick();

    const trendingBadges = wrapper.findAll(".u-badge");
    const hasTrendingBadge = trendingBadges.some((b) =>
      b.text().includes("Trending"),
    );
    expect(hasTrendingBadge).toBe(true);

    // Test 2: <= 5 sources -> does not display badge
    const mockNotTrendingFetch = vi.fn().mockResolvedValue({
      success: true,
      data: {
        ...mockNews,
        sourcesProcessed: Array(5)
          .fill(null)
          .map((_, i) => ({
            title: `Tech News ${i}`,
            source: `Tech Source ${i}`,
            url: `https://example.com/${i}`,
            credibilityScore: 0.9,
            publishedAt: "2024-01-15T10:00:00Z",
            category: "Tech" as any,
          })),
      },
      count: 5,
      timestamp: "2024-01-15T10:00:00Z",
    });
    (global as any).$fetch = mockNotTrendingFetch;

    const wrapperNotTrending = mountReader({
      global: {
        components: { BriefingCard: mockBriefingCard },
      },
    });
    await wrapperNotTrending.vm.refreshNews();
    await wrapperNotTrending.vm.$nextTick();

    const badgesNotTrending = wrapperNotTrending.findAll(".u-badge");
    const hasTrendingBadgeNotTrending = badgesNotTrending.some((b) =>
      b.text().includes("Trending"),
    );
    expect(hasTrendingBadgeNotTrending).toBe(false);
  });
});
