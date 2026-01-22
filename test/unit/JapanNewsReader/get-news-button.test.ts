import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Get News Button", () => {
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

  it("renders Get News button with correct initial state", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    const getNewsButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Get News"));
    expect(getNewsButton).toBeDefined();
    expect(getNewsButton?.exists()).toBe(true);
    expect(getNewsButton?.text()).toContain("Get News");
    expect(getNewsButton?.attributes("disabled")).toBeUndefined();
  });

  it("shows 'Getting...' text when loading", async () => {
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

    // Find Get News button
    const getNewsButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Get News"));
    expect(getNewsButton).toBeDefined();

    // Start loading
    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    expect(getNewsButton?.text()).toContain("Getting...");
    expect(getNewsButton?.attributes("disabled")).toBeDefined();

    // Wait for fetch to complete
    await fetchPromise;

    // Should return to "Get News"
    expect(getNewsButton?.text()).toContain("Get News");
    expect(getNewsButton?.attributes("disabled")).toBeUndefined();
  });

  it("disables Get News button when loading", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    const getNewsButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Get News"));
    expect(getNewsButton).toBeDefined();

    // Initially enabled
    expect(getNewsButton?.attributes("disabled")).toBeUndefined();

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

    // Should be disabled during loading
    expect(getNewsButton?.attributes("disabled")).toBeDefined();

    // Wait for fetch to complete
    await fetchPromise;

    // Should be enabled again
    expect(getNewsButton?.attributes("disabled")).toBeUndefined();
  });

  it("has correct CSS classes for Get News button styling", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Find the button that contains "Get News" text (not UColorModeButton)
    const getNewsButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Get News"));

    expect(getNewsButton).toBeDefined();
    // Check for UButton class (Nuxt UI component)
    expect(getNewsButton?.classes()).toContain("u-button");
  });
});
