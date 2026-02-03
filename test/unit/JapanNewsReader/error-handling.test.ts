import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

import JapanNewsReader from "~/app/components/JapanNewsReader.vue";
import { NewsCardMock, mockNews } from "./setup";

describe("JapanNewsReader - Error Handling", () => {
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

  it("handles fetchNews success correctly", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    await wrapper.vm.fetchNews();

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: undefined,
        timeRange: "week",
        language: "en",
        limit: 10,
      },
    });
    expect(wrapper.vm.news).toEqual(mockNews);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(null);
  });

  it("handles fetchNews response without data property", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Mock response without data property
    mockFetch.mockResolvedValueOnce({
      success: true,
      count: 0,
      timestamp: "2024-01-15T10:00:00Z",
    });

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.news).toEqual([]);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(null);
  });

  it("handles fetchNews error correctly", async () => {
    const errorMessage = "Failed to fetch news";
    mockFetch.mockRejectedValueOnce({
      data: { error: errorMessage },
    });

    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(errorMessage);
  });

  it("handles fetchNews error with fallback message", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe("Failed to fetch news. Please try again.");
  });

  it("shows error state when error occurs", async () => {
    mockFetch.mockRejectedValueOnce({
      data: { error: "API Error" },
    });

    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    await wrapper.vm.fetchNews();
    await vi.waitFor(() => wrapper.vm.error !== null);

    expect(wrapper.text()).toContain("API Error");
    const getNewsButton = wrapper
      .findAll("button")
      .find(
        (b) => b.text().includes("Try Again") || b.text().includes("Get News"),
      );
    expect(getNewsButton).toBeDefined();
  });

  it("shows rate limit error with reset time", async () => {
    const resetTime = "2024-01-16T10:00:00.000Z";
    mockFetch.mockRejectedValueOnce({
      statusCode: 429,
      data: {
        error:
          "Daily rate limit exceeded (3 requests/day). Please try again tomorrow.",
        resetTime: resetTime,
        limit: 3,
      },
    });

    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    await wrapper.vm.fetchNews();
    await vi.waitFor(() => wrapper.vm.isRateLimitError === true);

    // Check for rate limit specific UI elements
    expect(wrapper.vm.isRateLimitError).toBe(true);
    expect(wrapper.vm.rateLimitResetTime).toBe(resetTime);
    expect(wrapper.text()).toContain("Daily Limit Reached");
    expect(wrapper.text()).toContain("Daily rate limit exceeded");
    expect(wrapper.text()).toContain("Resets at:");

    // Check that the try again button is present and has warning color
    const buttons = wrapper.findAll("button");
    const tryAgainButton = buttons.find((b) => b.text().includes("Try Again"));
    expect(tryAgainButton).toBeDefined();
  });

  it("can retry fetching news after error", async () => {
    // First call fails
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    await wrapper.vm.fetchNews();
    expect(wrapper.vm.error).toBeTruthy();

    // Reset mock to succeed
    mockFetch.mockResolvedValueOnce({
      success: true,
      data: mockNews,
      count: 2,
      timestamp: "2024-01-15T10:00:00Z",
    });

    // Retry
    await wrapper.vm.refreshNews();

    expect(wrapper.vm.error).toBe(null);
    expect(wrapper.vm.news).toEqual(mockNews);
  });

  it("calls refreshNews method correctly", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Call refreshNews directly - it should internally call fetchNews
    // which we can verify by checking if $fetch was called
    const initialCallCount = mockFetch.mock.calls.length;
    await wrapper.vm.refreshNews();

    expect(mockFetch).toHaveBeenCalledTimes(initialCallCount + 1);
    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: undefined,
        timeRange: "week",
        language: "en",
        limit: 10,
      },
    });
  });

  it("handles HTTP 500 error with Redis not configured message", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Mock HTTP 500 error with Redis not configured message
    mockFetch.mockRejectedValueOnce({
      statusCode: 500,
      data: {
        error:
          "Redis not configured: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required for rate limiting",
      },
    });

    await wrapper.vm.fetchNews();
    await vi.waitFor(() => wrapper.vm.error !== null);

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(
      "Rate limiting service is unavailable. Please contact the administrator to configure Redis.",
    );
  });

  it("handles HTTP 500 error with generic error message (not Redis)", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Mock HTTP 500 error with generic message
    mockFetch.mockRejectedValueOnce({
      statusCode: 500,
      data: {
        error: "Internal server error occurred",
      },
    });

    await wrapper.vm.fetchNews();
    await vi.waitFor(() => wrapper.vm.error !== null);

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe("Internal server error occurred");
  });

  it("handles HTTP 500 error with non-string error message", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Mock HTTP 500 error with non-string error
    mockFetch.mockRejectedValueOnce({
      statusCode: 500,
      data: {
        error: { code: "INTERNAL_ERROR" },
      },
    });

    await wrapper.vm.fetchNews();
    await vi.waitFor(() => wrapper.vm.error !== null);

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(
      "Service temporarily unavailable. Please try again.",
    );
  });

  it("handles HTTP 500 error with no error data", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Mock HTTP 500 error with no error message
    mockFetch.mockRejectedValueOnce({
      statusCode: 500,
      data: {},
    });

    await wrapper.vm.fetchNews();
    await vi.waitFor(() => wrapper.vm.error !== null);

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(
      "Service temporarily unavailable. Please try again.",
    );
  });
});
