import { describe, it, expect, vi, beforeEach } from "vitest";

import { mountReader } from "./setup";

const now = Date.now();

const buildStoriesResponse = (overrides: Partial<any>[] = []) => ({
  success: true,
  data: {
    stories: [
      {
        id: "story-trending",
        headline: "Trending Story Headline",
        summary: "- summary point",
        thematicAnalysis: "- theme point",
        articleCount: 2,
        firstSeen: now - 86400000,
        lastUpdated: now,
        trendScore: 10,
        isSummarized: true,
        sources: [
          {
            title: "Source One",
            source: "NHK",
            url: "https://nhk.jp/1",
            publishedAt: new Date(now - 3600000).toISOString(),
            credibilityScore: 0.9,
          },
          {
            title: "Source Two",
            source: "Asahi",
            url: "https://asahi.com/2",
            publishedAt: new Date(now - 7200000).toISOString(),
            credibilityScore: 0.85,
          },
        ],
        categories: ["tech"],
        ...(overrides[0] || {}),
      },
      {
        id: "story-unsummarized",
        headline: "Unsummarized Story",
        summary: "",
        thematicAnalysis: "",
        articleCount: 1,
        firstSeen: now,
        lastUpdated: now,
        trendScore: 1,
        isSummarized: false,
        sources: [
          {
            title: "Source Three",
            source: "Mainichi",
            url: "https://mainichi.jp/3",
            publishedAt: new Date(now).toISOString(),
            credibilityScore: 0.8,
          },
        ],
        categories: ["society"],
        ...(overrides[1] || {}),
      },
    ],
    lastIngestTime: now,
  },
  count: 2,
  timestamp: new Date(now).toISOString(),
});

describe("JapanNewsReader - Story detail navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue(buildStoriesResponse());
  });

  it("renders trending badge and summarizing badge on story cards", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Trending");
    expect(wrapper.text()).toContain("Summarizing...");
  });

  it("selects a story by clicking its card and shows the briefing summary", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    await wrapper.vm.$nextTick();

    const cards = wrapper.findAll(".cursor-pointer");
    expect(cards.length).toBeGreaterThan(0);
    await cards[0]!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.selectedStoryId).toBe("story-trending");
    expect(wrapper.vm.detailSubPage).toBe("summary");
    expect(wrapper.find(".briefing-card").exists()).toBe(true);
  });

  it("navigates to the timeline sub-page and lists chronological sources", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedStoryId = "story-trending";
    await wrapper.vm.$nextTick();

    const timelineButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("View Story Timeline"));
    expect(timelineButton).toBeDefined();
    await timelineButton!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.detailSubPage).toBe("timeline");
    expect(wrapper.text()).toContain("Story Timeline");
    expect(wrapper.text()).toContain("Source One");
    expect(wrapper.text()).toContain("Source Two");
  });

  it("navigates back from timeline to summary", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedStoryId = "story-trending";
    await wrapper.vm.$nextTick();
    wrapper.vm.detailSubPage = "timeline";
    await wrapper.vm.$nextTick();

    const backButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Back to Summary"));
    expect(backButton).toBeDefined();
    await backButton!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.detailSubPage).toBe("summary");
  });

  it("navigates back to the trending grid from the summary sub-page", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedStoryId = "story-trending";
    wrapper.vm.detailSubPage = "summary";
    await wrapper.vm.$nextTick();

    const backButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Back to Trending Topics"));
    expect(backButton).toBeDefined();
    await backButton!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.selectedStoryId).toBeNull();
  });

  it("navigates back to the trending grid from the timeline sub-page", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedStoryId = "story-trending";
    await wrapper.vm.$nextTick();
    wrapper.vm.detailSubPage = "timeline";
    await wrapper.vm.$nextTick();

    const backButtons = wrapper
      .findAll("button")
      .filter((b) => b.text().includes("Back to Trending Topics"));
    expect(backButtons.length).toBeGreaterThan(0);
    await backButtons[backButtons.length - 1]!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.selectedStoryId).toBeNull();
  });

  it("shows SummaryFallback instead of the briefing card for an unsummarized story", async () => {
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    wrapper.vm.selectedStoryId = "story-unsummarized";
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".briefing-card").exists()).toBe(false);
  });
});
