import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Mobile Menu", () => {
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

  it("syncs mobileMenuOpen with UHeader via v-model", async () => {
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
    const header = wrapper.find(".u-header");
    expect(header.exists()).toBe(true);
    // Trigger click which emits update:open
    await header.trigger("click");
    await nextTick();
    expect(wrapper.vm.mobileMenuOpen).toBe(true);
  });
});
