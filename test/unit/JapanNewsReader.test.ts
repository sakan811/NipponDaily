import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import JapanNewsReader from "~/app/components/JapanNewsReader.vue";

const NewsCardMock = {
  name: "NewsCard",
  props: ["news"],
  template: '<div class="news-card">{{ news.title }}</div>',
};

vi.mock("~/app/components/NewsCard.vue", () => ({
  default: NewsCardMock,
}));

const mockNews = [
  {
    title: "Tech News",
    summary: "Tech Summary",
    content: "Tech Content",
    source: "Tech Source",
    publishedAt: "2024-01-15T10:00:00Z",
    category: "Technology",
  },
  {
    title: "Politics News",
    summary: "Politics Summary",
    content: "Politics Content",
    source: "Politics Source",
    publishedAt: "2024-01-15T11:00:00Z",
    category: "Politics",
  },
];

describe("JapanNewsReader", () => {
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
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    expect(wrapper.find(".container").exists()).toBe(true);
  });

  it("renders get news button", () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain("Get News");
  });

  it("renders category filter buttons", () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const categoryButtons = wrapper.findAll("button");
    expect(categoryButtons.length).toBeGreaterThan(1);
  });

  it("has news loading functionality", () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    expect(wrapper.vm.refreshNews).toBeDefined();
    expect(typeof wrapper.vm.refreshNews).toBe("function");
  });

  it("shows loading skeleton when loading news", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Mock a delayed response to show loading state
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

    // Start the fetch process
    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    // Check loading state
    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.find(".loading-skeleton").exists()).toBe(true);

    // Wait for the fetch to complete
    await fetchPromise;
  });

  it("shows instruction text when no news is loaded and not loading", () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const cardElement = wrapper.find(".card");
    expect(cardElement.exists()).toBe(true);
    expect(cardElement.text()).toContain("No news loaded yet");
    expect(cardElement.text()).toContain('click "Get News"');
  });

  it("renders NewsCard components when news is loaded", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Fetch news
    await wrapper.vm.refreshNews();
    await nextTick();

    // Check that NewsCard components are rendered
    const newsCards = wrapper.findAllComponents(NewsCardMock);
    expect(newsCards.length).toBe(2);
    expect(newsCards[0].props("news").title).toBe("Tech News");
    expect(newsCards[1].props("news").title).toBe("Politics News");
  });

  it("filters news by selected category", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Fetch news first
    await wrapper.vm.refreshNews();
    await nextTick();

    // Initially should show all news
    expect(wrapper.vm.filteredNews.length).toBe(2);

    // Select Technology category
    const categoryButtons = wrapper.findAll("button");
    const techButton = categoryButtons.find((btn) =>
      btn.text().includes("Technology"),
    );
    expect(techButton).toBeDefined();

    await techButton?.trigger("click");
    await nextTick();

    // Should filter to only Technology news
    expect(wrapper.vm.filteredNews.length).toBe(1);
    expect(wrapper.vm.filteredNews[0].category).toBe("Technology");
  });

  it("changes button appearance when category is selected", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const categoryButtons = wrapper.findAll("button");
    const techButton = categoryButtons.find((btn) =>
      btn.text().includes("Technology"),
    );

    // Initially "All News" should be selected
    const allButton = categoryButtons.find((btn) =>
      btn.text().includes("All News"),
    );
    expect(allButton?.classes()).toContain("bg-[var(--color-primary)]");

    // Click Technology button
    await techButton?.trigger("click");
    await nextTick();

    // Technology button should now be primary
    expect(techButton?.classes()).toContain("bg-[var(--color-primary)]");
    expect(allButton?.classes()).toContain("border");
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
        limit: 20,
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

  it("handles fetchNews with category filter correctly", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Set category to Technology
    wrapper.vm.selectedCategory = "technology";
    await wrapper.vm.fetchNews();

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: "technology",
        timeRange: "week",
        limit: 20,
      },
    });
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
    await nextTick();

    expect(wrapper.text()).toContain("API Error");
    expect(wrapper.find(".btn-primary").exists()).toBe(true);
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
        limit: 20,
      },
    });
  });

  it("disables button when loading", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
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

    // Start loading
    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    const getNewsButton = wrapper.find("button");
    expect(getNewsButton.attributes("disabled")).toBeDefined();
    expect(getNewsButton.text()).toContain("Getting...");

    // Wait for the fetch to complete
    await fetchPromise;
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

  it("renders time range filter buttons", () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const timeRangeButtons = wrapper.findAll("button").filter((button) => {
      const text = button.text();
      return [
        "All Time",
        "Today",
        "This Week",
        "This Month",
        "This Year",
      ].includes(text);
    });

    expect(timeRangeButtons.length).toBe(5);
    expect(timeRangeButtons[0].text()).toBe("All Time");
    expect(timeRangeButtons[1].text()).toBe("Today");
    expect(timeRangeButtons[2].text()).toBe("This Week");
    expect(timeRangeButtons[3].text()).toBe("This Month");
    expect(timeRangeButtons[4].text()).toBe("This Year");
  });

  it("selects 'This Week' time range by default", () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    expect(wrapper.vm.selectedTimeRange).toBe("week");

    const weekButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "This Week");

    expect(weekButton?.classes()).toContain("bg-[var(--color-primary)]");
  });

  it("handles time range selection correctly", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Find and click the "Today" button
    const todayButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "Today");

    await todayButton?.trigger("click");
    expect(wrapper.vm.selectedTimeRange).toBe("day");

    // Mock a successful fetch
    await wrapper.vm.fetchNews();

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: undefined,
        timeRange: "day",
        limit: 20,
      },
    });
  });

  it("handles fetchNews with time range filter correctly", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Set time range to "month"
    wrapper.vm.selectedTimeRange = "month";
    await wrapper.vm.fetchNews();

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: undefined,
        timeRange: "month",
        limit: 20,
      },
    });
  });

  it("changes time range button appearance when selected", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Initially "This Week" should be selected (primary background)
    let weekButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "This Week");
    expect(weekButton?.classes()).toContain("bg-[var(--color-primary)]");

    // Find and click "All Time" button
    const allTimeButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "All Time");

    await allTimeButton?.trigger("click");

    // Now "All Time" should be selected
    const updatedAllTimeButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "All Time");
    expect(updatedAllTimeButton?.classes()).toContain("bg-[var(--color-primary)]");

    // And "This Week" should be unselected (border only)
    weekButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "This Week");
    expect(weekButton?.classes()).toContain("border");
  });
});
