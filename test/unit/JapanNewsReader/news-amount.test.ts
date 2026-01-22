import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - News Amount Input", () => {
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

  it("renders news amount input with correct attributes", () => {
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

    const newsAmountInput = wrapper.find("input#newsAmount");
    expect(newsAmountInput.exists()).toBe(true);
    expect(newsAmountInput.attributes("type")).toBe("number");
    expect(newsAmountInput.attributes("min")).toBe("1");
    expect(newsAmountInput.attributes("max")).toBe("20");
    expect((newsAmountInput.element as HTMLInputElement).value).toBe("10"); // default value
  });

  it("binds news amount input to newsAmount reactive property", async () => {
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

    const newsAmountInput = wrapper.find("input#newsAmount");
    expect(wrapper.vm.newsAmount).toBe(10);

    await newsAmountInput.setValue(15);
    expect(wrapper.vm.newsAmount).toBe(15);
    expect((newsAmountInput.element as HTMLInputElement).value).toBe("15");
  });

  it("validates news amount limits before fetching", async () => {
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

    wrapper.vm.newsAmount = 25; // above max
    await wrapper.vm.refreshNews();
    expect(wrapper.vm.newsAmount).toBe(20);

    wrapper.vm.newsAmount = 0; // below min
    await wrapper.vm.refreshNews();
    expect(wrapper.vm.newsAmount).toBe(1);
  });

  it("disables news amount input when loading", async () => {
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

    const newsAmountInput = wrapper.find("input#newsAmount");
    expect(newsAmountInput.attributes("disabled")).toBeUndefined();

    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    expect(newsAmountInput.attributes("disabled")).toBeDefined();
    await fetchPromise;
  });
});
