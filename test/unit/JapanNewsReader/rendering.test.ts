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
            name: "NewsCard",
            props: ["news"],
            template: '<div class="news-card">{{ news.title }}</div>',
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
            name: "NewsCard",
            props: ["news"],
            template: '<div class="news-card">{{ news.title }}</div>',
          },
        },
      },
    });

    const button = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Get News"));
    expect(button).toBeDefined();
    expect(button?.exists()).toBe(true);
    expect(button?.text()).toContain("Get News");
  });

  it("renders category filter buttons", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: {
            name: "NewsCard",
            props: ["news"],
            template: '<div class="news-card">{{ news.title }}</div>',
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
            name: "NewsCard",
            props: ["news"],
            template: '<div class="news-card">{{ news.title }}</div>',
          },
        },
      },
    });

    expect(wrapper.vm.refreshNews).toBeDefined();
    expect(typeof wrapper.vm.refreshNews).toBe("function");
  });

  it("renders NewsCard components when news is loaded", async () => {
    const NewsCardMock = {
      name: "NewsCard",
      props: ["news"],
      template: '<div class="news-card">{{ news.title }}</div>',
    };
    const wrapper = mountReader({
      global: {
        components: { NewsCard: NewsCardMock },
      },
    });

    // Fetch news
    await wrapper.vm.refreshNews();
    await vi.waitFor(() => wrapper.vm.news.length > 0);

    // Check that NewsCard components are rendered
    const newsCards = wrapper.findAllComponents(NewsCardMock);
    expect(newsCards.length).toBe(2);
    expect(newsCards[0].props("news").title).toBe("Tech News");
    expect(newsCards[1].props("news").title).toBe("Politics News");
  });

  it("binds mobileMenuOpen to UHeader via v-model:open", () => {
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: {
            name: "NewsCard",
            props: ["news"],
            template: '<div class="news-card">{{ news.title }}</div>',
          },
        },
      },
    });

    expect(wrapper.vm.mobileMenuOpen).toBe(false);
    expect(wrapper.find(".u-header").exists()).toBe(true);
  });
});
