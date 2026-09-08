import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNewsResponse } from "./setup";

describe("JapanNewsReader - Loading State", () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn().mockResolvedValue(mockNewsResponse());
    (global as any).$fetch = mockFetch;
  });

  it("shows the loading skeleton while fetching", async () => {
    const wrapper = mountReader();

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockNewsResponse()), 100),
        ),
    );

    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.find(".u-skeleton").exists()).toBe(true);

    await fetchPromise;
  });

  it("shows the empty-state text when there are no lessons and not loading", async () => {
    mockFetch.mockResolvedValue(mockNewsResponse([]));
    const wrapper = mountReader();
    await wrapper.vm.refreshNews();
    await nextTick();

    expect(wrapper.text()).toContain("No lessons at this level");
  });
});
