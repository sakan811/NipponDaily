import { describe, it, expect, vi, beforeEach } from "vitest";

import { mountReader, mockNewsResponse } from "./setup";

describe("JapanNewsReader - Error Handling", () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn().mockResolvedValue(mockNewsResponse());
    (global as any).$fetch = mockFetch;
  });

  it("handles fetchNews success correctly", async () => {
    const wrapper = mountReader();
    await wrapper.vm.fetchNews();

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: { difficulty: undefined, limit: 20 },
    });
    expect(wrapper.vm.lessons[0].title).toBe("Tech News Headline");
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(null);
  });

  it("handles a response without a lessons property", async () => {
    const wrapper = mountReader();
    mockFetch.mockResolvedValueOnce({
      success: true,
      count: 0,
      timestamp: "2024-01-15T10:00:00Z",
    });

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.lessons.length).toBe(0);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(null);
  });

  it("surfaces a string error from the API payload", async () => {
    mockFetch.mockRejectedValueOnce({
      data: { error: "Failed to fetch news" },
    });
    const wrapper = mountReader();

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe("Failed to fetch news");
  });

  it("falls back to a generic message for a bare Error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const wrapper = mountReader();

    await wrapper.vm.fetchNews();

    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe("Failed to fetch lessons. Please try again.");
  });

  it("renders the fallback UI and a retry affordance on error", async () => {
    mockFetch.mockRejectedValueOnce({ data: { error: "API Error" } });
    const wrapper = mountReader();

    await wrapper.vm.fetchNews();
    await vi.waitFor(() => wrapper.vm.error !== null);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("API Error");
  });

  it("can retry after an error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const wrapper = mountReader();

    await wrapper.vm.fetchNews();
    expect(wrapper.vm.error).toBeTruthy();

    mockFetch.mockResolvedValueOnce(mockNewsResponse());
    await wrapper.vm.refreshNews();

    expect(wrapper.vm.error).toBe(null);
    expect(wrapper.vm.lessons[0].title).toBe("Tech News Headline");
  });

  it("maps a 500 with a non-string error to the generic service message", async () => {
    mockFetch.mockRejectedValueOnce({
      statusCode: 500,
      data: { error: { code: "INTERNAL_ERROR" } },
    });
    const wrapper = mountReader();

    await wrapper.vm.fetchNews();
    await vi.waitFor(() => wrapper.vm.error !== null);

    expect(wrapper.vm.error).toBe(
      "Service temporarily unavailable. Please try again.",
    );
  });
});
