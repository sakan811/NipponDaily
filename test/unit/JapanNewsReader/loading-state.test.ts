import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Loading State", () => {
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

  it("shows loading skeleton when loading news", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Mock a delayed response to show loading state
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: mockNews,
                count: 2,
                timestamp: "2024-01-15T10:00:00Z",
              }),
            100,
          ),
        ),
    );

    // Start the fetch process
    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    // Check loading state - shows skeleton when loading
    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.find(".u-skeleton").exists()).toBe(true);

    // Wait for the fetch to complete
    await fetchPromise;
  });

  it("shows instruction text when no news is loaded and not loading", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Find the empty state div (replaced UCard with native div for LCP optimization)
    const emptyState = wrapper.find('[style*="contain: layout style paint"]');
    expect(emptyState.exists()).toBe(true);
    expect(emptyState.text()).toContain("No news loaded yet");
    expect(emptyState.text()).toContain('click "Get News"');
  });

  it("disables button when loading", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Mock delayed response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: mockNews,
                count: 2,
                timestamp: "2024-01-15T10:00:00Z",
              }),
            100,
          ),
        ),
    );

    // Start loading
    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    const getNewsButton = wrapper
      .findAll("button")
      .find(
        (b) => b.text().includes("Getting...") || b.text().includes("Get News"),
      );
    expect(getNewsButton).toBeDefined();
    expect(getNewsButton?.attributes("disabled")).toBeDefined();
    expect(getNewsButton?.text()).toContain("Getting...");

    // Wait for the fetch to complete
    await fetchPromise;
  });
});
