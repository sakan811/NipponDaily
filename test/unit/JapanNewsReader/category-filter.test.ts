import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Category Filter", () => {
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

  it("filters news by selected category", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Fetch news first
    await wrapper.vm.refreshNews();
    await nextTick();

    // Initially should show all news
    expect(wrapper.vm.filteredNews.length).toBe(2);

    // Select Technology category
    const categoryButtons = wrapper.findAll("button");
    const techButton = categoryButtons.find((btn) =>
      btn.text().includes("Technology"),
    );
    expect(techButton).toBeDefined();

    await techButton?.trigger("click");
    await nextTick();

    // Should filter to only Technology news
    expect(wrapper.vm.filteredNews.length).toBe(1);
    expect(wrapper.vm.filteredNews[0].category).toBe("Technology");
  });

  it("changes button appearance when category is selected", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    const categoryButtons = wrapper.findAll("button");
    const techButton = categoryButtons.find((btn) =>
      btn.text().includes("Technology"),
    );

    // Initially "All News" should be selected
    const allButton = categoryButtons.find((btn) =>
      btn.text().includes("All News"),
    );
    expect(allButton?.classes()).toContain("bg-[var(--color-primary)]");

    // Click Technology button
    await techButton?.trigger("click");
    await nextTick();

    // Technology button should now be primary
    expect(techButton?.classes()).toContain("bg-[var(--color-primary)]");
    expect(allButton?.classes()).toContain("border");
  });

  it("handles fetchNews with category filter correctly", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Set category to Technology
    wrapper.vm.selectedCategory = "technology";
    await wrapper.vm.fetchNews();

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: "technology",
        timeRange: "week",
        language: "English",
        limit: 10,
      },
    });
  });
});
