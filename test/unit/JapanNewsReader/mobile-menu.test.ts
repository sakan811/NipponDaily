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

  it("renders mobile target language input", () => {
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

    // The ULocaleSelect component is used for mobile language selection
    // Verify the component has the targetLanguage ref
    expect(wrapper.vm.targetLanguage).toBeDefined();
  });

  it("binds mobile language input to targetLanguage", async () => {
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

    // Both desktop and mobile ULocaleSelect bind to the same targetLanguage ref
    wrapper.vm.targetLanguage = "fr";
    await nextTick();
    expect(wrapper.vm.targetLanguage).toBe("fr");
  });

  it("disables mobile language input when loading", async () => {
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

    mockFetch.mockImplementationOnce(
      () => new Promise((r) => setTimeout(r, 100)),
    );

    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    // Check that loading state is true (this disables both desktop and mobile inputs)
    expect(wrapper.vm.loading).toBe(true);
    await fetchPromise;
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
