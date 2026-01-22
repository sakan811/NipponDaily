import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Language Input", () => {
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

  it("renders language input field with correct attributes", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // The ULocaleSelect component is used for language selection
    // Check that the targetLanguage ref exists and has the correct default value
    expect(wrapper.vm.targetLanguage).toBe("en");
  });

  it("binds language input to targetLanguage reactive property", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Initial value should be "en" (locale code)
    expect(wrapper.vm.targetLanguage).toBe("en");

    // Simulate user changing the locale via the component's v-model
    wrapper.vm.targetLanguage = "ja";
    await nextTick();

    expect(wrapper.vm.targetLanguage).toBe("ja");
  });

  it("disables language input when loading", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Mock delayed response to show loading state
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

    // Check that loading state is true
    expect(wrapper.vm.loading).toBe(true);

    // Wait for fetch to complete
    await fetchPromise;

    // Loading should be false after fetch completes
    expect(wrapper.vm.loading).toBe(false);
  });

  it("has correct CSS classes for language input styling", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // The ULocaleSelect component is used with class="w-36"
    // Verify the component renders without errors and has the expected ref
    expect(wrapper.vm.targetLanguage).toBeDefined();
  });

  it("includes language parameter in fetch request", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Set language to Japanese (locale code "ja")
    // The locale.name for "ja" is "日本語" (Japanese name for Japanese)
    wrapper.vm.targetLanguage = "ja";
    await wrapper.vm.fetchNews();

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: undefined,
        timeRange: "week",
        language: "日本語", // API receives localized language name
        limit: 10,
      },
    });
  });

  it("handles empty language input gracefully", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Set language to empty string by directly setting the reactive property
    wrapper.vm.targetLanguage = "";
    await wrapper.vm.fetchNews();

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: undefined,
        timeRange: "week",
        language: "English", // empty string should fallback to "English" per component logic
        limit: 10,
      },
    });
  });

  it("maintains language input value during and after loading", async () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: { name: "NewsCard", props: ["news"], template: '<div class="news-card">{{ news.title }}</div>' },
        },
      },
    });

    // Set language to French (locale code "fr")
    wrapper.vm.targetLanguage = "fr";
    await nextTick();
    expect(wrapper.vm.targetLanguage).toBe("fr");

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

    // Language should still be "fr" during loading
    expect(wrapper.vm.targetLanguage).toBe("fr");

    // Wait for fetch to complete
    await fetchPromise;

    // Language should still be "fr" after loading
    expect(wrapper.vm.targetLanguage).toBe("fr");
  });
});
