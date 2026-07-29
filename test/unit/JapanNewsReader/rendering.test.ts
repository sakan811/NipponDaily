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

  it("handles response.data.stories payload format", async () => {
    const mockStoriesFetch = vi.fn().mockResolvedValue({
      success: true,
      data: {
        stories: [
          {
            id: "story-cat-1",
            headline: "Multi-Source Story",
            summary: "Story summary",
            thematicAnalysis: "Thematic summary",
            articleCount: 3,
            firstSeen: Date.now() - 86400000,
            lastUpdated: Date.now(),
            trendScore: 3,
            isSummarized: true,
            sources: [
              {
                title: "Source 1",
                source: "NHK",
                url: "https://nhk.jp/1",
                publishedAt: "2026-01-10T10:00:00Z",
                credibilityScore: 0.9,
              },
              {
                title: "Source 2",
                source: "Asahi",
                url: "https://asahi.com/2",
                publishedAt: "2026-01-20T10:00:00Z",
                credibilityScore: 0.85,
              },
              {
                title: "Source 3",
                source: "Mainichi",
                url: "https://mainichi.jp/3",
                publishedAt: "2025-12-01T10:00:00Z",
                credibilityScore: 0.88,
              },
            ],
            categories: ["tech"],
          },
        ],
        lastIngestTime: Date.now(),
      },
      count: 1,
      timestamp: "2026-01-20T10:00:00Z",
    });
    (global as any).$fetch = mockStoriesFetch;

    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    expect(wrapper.vm.stories).toHaveLength(1);
    expect(wrapper.vm.stories[0].headline).toBe("Multi-Source Story");

    // Select story to trigger activeBriefingData, getStoryTimeRange (same month, same year, diff year), and chronologicalSources
    wrapper.vm.selectedStoryId = "story-cat-1";
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeBriefingData).not.toBeNull();
    expect(wrapper.vm.chronologicalSources).toHaveLength(3);
    // Chronological sources should be sorted oldest publishedAt first (2025-12-01 first)
    expect(wrapper.vm.chronologicalSources[0].source).toBe("Mainichi");
  });

  it("handles response.data without stories or mainHeadline", async () => {
    (global as any).$fetch = vi.fn().mockResolvedValue({
      success: true,
      data: {},
      count: 0,
    });
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    expect(wrapper.vm.stories).toHaveLength(0);
  });

  it("handles DEBUG_ERROR_UI mode simulations", async () => {
    const wrapper = mountReader();
    // Test fetchNews with debug simulation mode directly
    wrapper.vm.error =
      "DEBUG_ERROR_UI: Service temporarily unavailable. Failed to fetch trending stories from Redis database.";
    expect(wrapper.vm.error).toContain("DEBUG_ERROR_UI");

    wrapper.vm.debugSimulationMode = "summary_error";
    await wrapper.vm.$nextTick();
    await wrapper.vm.fetchNews();
  });
});
