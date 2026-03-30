import { describe, it, expect, vi, beforeEach } from "vitest";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Rendering", () => {
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

  it("renders main component structure", () => {
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

    expect(wrapper.find(".container").exists()).toBe(true);
  });

  it("renders get news button", () => {
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

    const button = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Generate Briefing"));
    expect(button).toBeDefined();
    expect(button?.exists()).toBe(true);
    expect(button?.text()).toContain("Generate Briefing");
  });

  it("renders category filter buttons", () => {
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

    const categoryButtons = wrapper.findAll("button");
    expect(categoryButtons.length).toBeGreaterThan(1);
  });

  it("has news loading functionality", () => {
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

    expect(wrapper.vm.refreshNews).toBeDefined();
    expect(typeof wrapper.vm.refreshNews).toBe("function");
  });

  it("renders NewsCard components when news is loaded", async () => {
    const mockBriefingCard = {
      name: "BriefingCard",
      props: ["briefing"],
      template: '<div class="briefing-card">{{ briefing.mainHeadline }}</div>',
    };
    const wrapper = mountReader({
      global: {
        components: { BriefingCard: mockBriefingCard },
      },
    });

    // Fetch news
    await wrapper.vm.refreshNews();
    await vi.waitFor(() => wrapper.vm.briefingData !== null);

    // Check that NewsCard components are rendered

    expect(wrapper.find(".briefing-card").exists()).toBe(true);
    expect(wrapper.find(".briefing-card").exists()).toBe(true);
    expect(wrapper.find(".briefing-card").exists()).toBe(true);
  });

  it("binds mobileMenuOpen to UHeader via v-model:open", () => {
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

    expect(wrapper.vm.mobileMenuOpen).toBe(false);
    expect(wrapper.find(".u-header").exists()).toBe(true);
  });
});
