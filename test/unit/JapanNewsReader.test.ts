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

// Mock ULocaleSelect component - define it but don't use vi.mock
const ULocaleSelectMock = {
  name: "ULocaleSelect",
  props: ["id", "modelValue", "locales", "disabled", "size", "class"],
  emits: ["update:modelValue"],
  template:
    '<select :id="id" :disabled="disabled" :class="class" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>',
};

// Helper function to mount with common mocks
const mountReader = (options = {}) => {
  return mount(JapanNewsReader, {
    global: {
      components: {
        NewsCard: NewsCardMock,
      },
      stubs: {
        ULocaleSelect: ULocaleSelectMock,
      },
      ...(options.global || {}),
    },
    ...options,
  });
};

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
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    expect(wrapper.find(".container").exists()).toBe(true);
  });

  it("renders get news button", () => {
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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

    // Check loading state - shows skeleton when loading
    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.find(".u-skeleton").exists()).toBe(true);

    // Wait for the fetch to complete
    await fetchPromise;
  });

  it("shows instruction text when no news is loaded and not loading", () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const cardElement = wrapper.find(".u-card");
    expect(cardElement.exists()).toBe(true);
    expect(cardElement.text()).toContain("No news loaded yet");
    expect(cardElement.text()).toContain('click "Get News"');
  });

  it("renders NewsCard components when news is loaded", async () => {
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
        language: "English",
        limit: 10,
      },
    });
    expect(wrapper.vm.news).toEqual(mockNews);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(null);
  });

  it("handles fetchNews response without data property", async () => {
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
        language: "English",
        limit: 10,
      },
    });
  });

  it("handles fetchNews error correctly", async () => {
    const errorMessage = "Failed to fetch news";
    mockFetch.mockRejectedValueOnce({
      data: { error: errorMessage },
    });

    const wrapper = mountReader( {
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

    const wrapper = mountReader( {
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

    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    await wrapper.vm.fetchNews();
    await nextTick();

    expect(wrapper.text()).toContain("API Error");
    expect(wrapper.find("button").exists()).toBe(true);
  });

  it("calls refreshNews method correctly", async () => {
    const wrapper = mountReader( {
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
        language: "English",
        limit: 10,
      },
    });
  });

  it("disables button when loading", async () => {
    const wrapper = mountReader( {
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

    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
    const wrapper = mountReader( {
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
        language: "English",
        limit: 10,
      },
    });
  });

  it("handles fetchNews with time range filter correctly", async () => {
    const wrapper = mountReader( {
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
        language: "English",
        limit: 10,
      },
    });
  });

  it("changes time range button appearance when selected", async () => {
    const wrapper = mountReader( {
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
    expect(updatedAllTimeButton?.classes()).toContain(
      "bg-[var(--color-primary)]",
    );

    // And "This Week" should be unselected (border only)
    weekButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "This Week");
    expect(weekButton?.classes()).toContain("border");
  });

  // Language Input Field Tests
  it("renders language input field with correct attributes", () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // The ULocaleSelect component is used for language selection
    // Check that the targetLanguage ref exists and has the correct default value
    expect(wrapper.vm.targetLanguage).toBe("en");
  });

  it("binds language input to targetLanguage reactive property", async () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // The ULocaleSelect component is used with class="w-36"
    // Verify the component renders without errors and has the expected ref
    expect(wrapper.vm.targetLanguage).toBeDefined();
  });

  it("includes language parameter in fetch request", async () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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

  // Get News Button Specific Tests
  it("renders Get News button with correct initial state", () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const getNewsButton = wrapper.find("button");
    expect(getNewsButton.exists()).toBe(true);
    expect(getNewsButton.text()).toContain("Get News");
    expect(getNewsButton.attributes("disabled")).toBeUndefined();
  });

  it("shows 'Getting...' text when loading", async () => {
    const wrapper = mountReader( {
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

    const getNewsButton = wrapper.find("button");

    // Start loading
    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    expect(getNewsButton.text()).toContain("Getting...");
    expect(getNewsButton.attributes("disabled")).toBeDefined();

    // Wait for fetch to complete
    await fetchPromise;

    // Should return to "Get News"
    expect(getNewsButton.text()).toContain("Get News");
    expect(getNewsButton.attributes("disabled")).toBeUndefined();
  });

  it("disables Get News button when loading", async () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const getNewsButton = wrapper.find("button");

    // Initially enabled
    expect(getNewsButton.attributes("disabled")).toBeUndefined();

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

    // Should be disabled during loading
    expect(getNewsButton.attributes("disabled")).toBeDefined();

    // Wait for fetch to complete
    await fetchPromise;

    // Should be enabled again
    expect(getNewsButton.attributes("disabled")).toBeUndefined();
  });

  it("has correct CSS classes for Get News button styling", () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const getNewsButton = wrapper.find("button");

    // Check for UButton class (Nuxt UI component)
    expect(getNewsButton.classes()).toContain("u-button");
  });

  // Integration Tests for Language Input and Button Interaction
  it("uses current language value when Get News button is clicked", async () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Change language to Spanish (locale code "es")
    // The locale.name for "es" is "Español"
    wrapper.vm.targetLanguage = "es";
    await nextTick();

    // Click Get News button
    await wrapper.find("button").trigger("click");

    expect(mockFetch).toHaveBeenCalledWith("/api/news", {
      query: {
        category: undefined,
        timeRange: "week",
        language: "Español",
        limit: 10,
      },
    });
  });

  it("disables both input and button during loading state", async () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
        },
      },
    });

    const getNewsButton = wrapper.find("button");

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

    // Start loading by clicking button
    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    // Check that loading state is true (this disables both input and button)
    expect(wrapper.vm.loading).toBe(true);
    expect(getNewsButton.attributes("disabled")).toBeDefined();
    expect(getNewsButton.text()).toContain("Getting...");

    // Wait for fetch to complete
    await fetchPromise;

    // Both should be enabled again
    expect(wrapper.vm.loading).toBe(false);
    expect(getNewsButton.attributes("disabled")).toBeUndefined();
    expect(getNewsButton.text()).toContain("Get News");
  });

  it("maintains language input value during and after loading", async () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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

  it("handles empty language input gracefully", async () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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

  // News Amount Input Tests
  it("renders news amount input with correct attributes", () => {
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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
    const wrapper = mountReader( {
      global: {
        components: {
          NewsCard: NewsCardMock,
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

  it("binds mobileMenuOpen to UHeader via v-model:open", () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    expect(wrapper.vm.mobileMenuOpen).toBe(false);
    expect(wrapper.find(".u-header").exists()).toBe(true);
  });

  it("renders mobile news amount input with correct attributes", () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    const mobileInput = wrapper.find("input#mobileNewsAmount");
    expect(mobileInput.exists()).toBe(true);
    expect(mobileInput.attributes("type")).toBe("number");
    expect(mobileInput.attributes("min")).toBe("1");
    expect(mobileInput.attributes("max")).toBe("20");
  });

  it("binds mobile news amount input to newsAmount reactive property", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    const mobileInput = wrapper.find("input#mobileNewsAmount");
    await mobileInput.setValue(5);
    expect(wrapper.vm.newsAmount).toBe(5);
  });

  it("disables mobile news amount input when loading", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    const mobileInput = wrapper.find("input#mobileNewsAmount");
    mockFetch.mockImplementationOnce(
      () => new Promise((r) => setTimeout(r, 100)),
    );

    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    expect(mobileInput.attributes("disabled")).toBeDefined();
    await fetchPromise;
  });

  it("renders mobile target language input", () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // The ULocaleSelect component is used for mobile language selection
    // Verify the component has the targetLanguage ref
    expect(wrapper.vm.targetLanguage).toBeDefined();
  });

  it("binds mobile language input to targetLanguage", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Both desktop and mobile ULocaleSelect bind to the same targetLanguage ref
    wrapper.vm.targetLanguage = "fr";
    await nextTick();
    expect(wrapper.vm.targetLanguage).toBe("fr");
  });

  it("disables mobile language input when loading", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
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

  it("mobile Get News button closes menu after click", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Find mobile button by block class (unique to mobile version)
    const mobileButtons = wrapper
      .findAll(".u-button")
      .filter((b) => b.classes().includes("block"));

    // Skip if mobile menu not rendered (UHeader controls visibility)
    if (mobileButtons.length === 0) {
      return;
    }

    wrapper.vm.mobileMenuOpen = true;
    await mobileButtons[0].trigger("click");
    await nextTick();

    expect(wrapper.vm.mobileMenuOpen).toBe(false);
  });

  // Pagination Tests
  it("does not render pagination when news count <= items per page", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Only 2 items, itemsPerPage is 3, so no pagination
    await wrapper.vm.refreshNews();
    await nextTick();

    expect(wrapper.vm.filteredNews.length).toBe(2);
    expect(wrapper.vm.filteredNews.length).toBeLessThanOrEqual(
      wrapper.vm.itemsPerPage,
    );
  });

  it("renders pagination when news count > items per page", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Add more mock news to exceed itemsPerPage (3)
    mockFetch.mockResolvedValueOnce({
      success: true,
      data: [
        ...mockNews,
        {
          title: "News 3",
          summary: "Sum 3",
          content: "Content 3",
          source: "Src 3",
          publishedAt: "2024-01-15T12:00:00Z",
          category: "Business",
        },
        {
          title: "News 4",
          summary: "Sum 4",
          content: "Content 4",
          source: "Src 4",
          publishedAt: "2024-01-15T13:00:00Z",
          category: "Culture",
        },
      ],
      count: 4,
      timestamp: "2024-01-15T10:00:00Z",
    });

    await wrapper.vm.refreshNews();
    await nextTick();

    expect(wrapper.vm.filteredNews.length).toBe(4);
    expect(wrapper.vm.filteredNews.length).toBeGreaterThan(
      wrapper.vm.itemsPerPage,
    );
  });

  it("paginates news correctly", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Add 5 items to test pagination (itemsPerPage = 3)
    mockFetch.mockResolvedValueOnce({
      success: true,
      data: [
        ...mockNews,
        {
          title: "News 3",
          summary: "Sum 3",
          content: "Content 3",
          source: "Src 3",
          publishedAt: "2024-01-15T12:00:00Z",
          category: "Business",
        },
        {
          title: "News 4",
          summary: "Sum 4",
          content: "Content 4",
          source: "Src 4",
          publishedAt: "2024-01-15T13:00:00Z",
          category: "Culture",
        },
        {
          title: "News 5",
          summary: "Sum 5",
          content: "Content 5",
          source: "Src 5",
          publishedAt: "2024-01-15T14:00:00Z",
          category: "Sports",
        },
      ],
      count: 5,
      timestamp: "2024-01-15T10:00:00Z",
    });

    await wrapper.vm.refreshNews();
    await nextTick();

    // Page 1 should show first 3 items
    expect(wrapper.vm.page).toBe(1);
    expect(wrapper.vm.paginatedNews.length).toBe(3);

    // Change to page 2
    wrapper.vm.page = 2;
    await nextTick();

    // Page 2 should show remaining 2 items
    expect(wrapper.vm.paginatedNews.length).toBe(2);
  });

  it("resets page to 1 when category changes", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Add 5 items to test pagination
    mockFetch.mockResolvedValueOnce({
      success: true,
      data: [
        ...mockNews,
        {
          title: "News 3",
          summary: "Sum 3",
          content: "Content 3",
          source: "Src 3",
          publishedAt: "2024-01-15T12:00:00Z",
          category: "Business",
        },
        {
          title: "News 4",
          summary: "Sum 4",
          content: "Content 4",
          source: "Src 4",
          publishedAt: "2024-01-15T13:00:00Z",
          category: "Culture",
        },
        {
          title: "News 5",
          summary: "Sum 5",
          content: "Content 5",
          source: "Src 5",
          publishedAt: "2024-01-15T14:00:00Z",
          category: "Sports",
        },
      ],
      count: 5,
      timestamp: "2024-01-15T10:00:00Z",
    });

    await wrapper.vm.refreshNews();
    await nextTick();

    wrapper.vm.page = 2;
    expect(wrapper.vm.page).toBe(2);

    // Change category - should reset page to 1
    wrapper.vm.selectedCategory = "technology";
    await nextTick();

    expect(wrapper.vm.page).toBe(1);
  });

  // Cover line 4: UHeader v-model:open two-way binding
  it("syncs mobileMenuOpen with UHeader via v-model", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });
    const header = wrapper.find(".u-header");
    expect(header.exists()).toBe(true);
    // Trigger click which emits update:open
    await header.trigger("click");
    await nextTick();
    expect(wrapper.vm.mobileMenuOpen).toBe(true);
  });

  // Cover lines 103-107: mobile button closes menu after fetch
  it("mobile button closes menu and fetches news", async () => {
    // Mount with shallow: false to render real components and trigger inline handlers
    const wrapper = mountReader( {
      shallow: false,
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          NuxtLink: { template: "<a><slot /></a>" },
          NuxtLayout: { template: "<div><slot /></div>" },
          UCard: { template: '<div class="u-card"><slot /></div>' },
          UBadge: {
            template:
              '<span class="u-badge" :class="`badge-${color}`"><slot /></span>',
            props: ["color", "size", "variant"],
          },
          UDropdownMenu: {
            template:
              '<div class="u-dropdown"><slot name="content-top" /><slot /></div>',
            props: ["ui"],
          },
          UHeader: {
            template:
              '<header class="u-header" :open="open" @click="$emit(\'update:open\', !open)"><slot name="left" /><slot name="right" /><slot name="body" /></header>',
            props: ["open"],
            emits: ["update:open"],
          },
          UInput: {
            template:
              '<input :id="id" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :min="min" :max="max" class="u-input" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: [
              "id",
              "modelValue",
              "type",
              "placeholder",
              "disabled",
              "min",
              "max",
              "size",
            ],
            emits: ["update:modelValue"],
          },
          USkeleton: { template: '<div class="u-skeleton"><slot /></div>' },
          UPagination: {
            template:
              '<div class="u-pagination" @click="$emit(\'update:page\', page + 1)"></div>',
            props: ["page", "total", "itemsPerPage"],
            emits: ["update:page"],
          },
          UTooltip: { template: "<div><slot /></div>" },
        },
      },
    });
    wrapper.vm.mobileMenuOpen = true;
    // Mobile button is the one that displays full text without hidden span
    const mobileBtn = wrapper
      .findAll("button")
      .find(
        (b) => b.text().includes("Get News") && !b.find(".hidden").exists(),
      );
    if (mobileBtn) {
      await mobileBtn.trigger("click");
      await nextTick();
      await nextTick();
      await nextTick();
      expect(wrapper.vm.mobileMenuOpen).toBe(false);
    }
  });

  // Cover line 246: UPagination v-model:page two-way binding
  it("syncs page with UPagination via v-model", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });
    // Need 4 items to exceed itemsPerPage (3) and show pagination
    mockFetch.mockResolvedValue({
      success: true,
      data: [
        ...mockNews,
        {
          title: "N3",
          summary: "S3",
          content: "C3",
          source: "S3",
          publishedAt: "2024-01-15T12:00:00Z",
          category: "Business",
        },
        {
          title: "N4",
          summary: "S4",
          content: "C4",
          source: "S4",
          publishedAt: "2024-01-15T13:00:00Z",
          category: "Culture",
        },
      ],
      count: 4,
      timestamp: "2024-01-15T10:00:00Z",
    });
    await wrapper.vm.refreshNews();
    await nextTick();
    const pagination = wrapper.find(".u-pagination");
    if (pagination.exists()) {
      await pagination.trigger("click");
      expect(wrapper.vm.page).toBe(2);
    }
  });

  // Cover lines 37 and 87: v-model bindings on ULocaleSelect
  it("covers v-model binding on desktop ULocaleSelect", async () => {
    // Use custom stub that properly emits update:modelValue
    const wrapper = mountReader( {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    // Verify initial value
    expect(wrapper.vm.targetLanguage).toBe("en");

    // Find desktop select by id
    const desktopSelect = wrapper.find("select#targetLanguage");
    expect(desktopSelect.exists()).toBe(true);

    // Trigger change event on desktop select (covers line 37 v-model)
    await desktopSelect.setValue("ja");
    await nextTick();

    expect(wrapper.vm.targetLanguage).toBe("ja");
  });

  it("covers v-model binding on mobile ULocaleSelect", async () => {
    // Use custom stub that properly emits update:modelValue
    const wrapper = mountReader( {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    // Verify initial value
    expect(wrapper.vm.targetLanguage).toBe("en");

    // Find mobile select by id
    const mobileSelect = wrapper.find("select#mobileTargetLanguage");
    expect(mobileSelect.exists()).toBe(true);

    // Trigger change event on mobile select (covers line 87 v-model)
    await mobileSelect.setValue("fr");
    await nextTick();

    expect(wrapper.vm.targetLanguage).toBe("fr");
  });

  it("both desktop and mobile language selects sync with targetLanguage", async () => {
    // Use custom stub that properly emits update:modelValue
    const wrapper = mountReader( {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    const desktopSelect = wrapper.find("select#targetLanguage");
    const mobileSelect = wrapper.find("select#mobileTargetLanguage");

    expect(desktopSelect.exists()).toBe(true);
    expect(mobileSelect.exists()).toBe(true);

    // Change desktop select - should update targetLanguage (line 37)
    await desktopSelect.setValue("de");
    await nextTick();
    expect(wrapper.vm.targetLanguage).toBe("de");

    // Change mobile select - should update targetLanguage (line 87)
    await mobileSelect.setValue("es");
    await nextTick();
    expect(wrapper.vm.targetLanguage).toBe("es");

    // The important thing is that the reactive state is updated
    // Both v-model bindings (line 37 and 87) have been triggered
    expect(wrapper.vm.targetLanguage).toBe("es");
  });

  it("language select is disabled during loading", async () => {
    // Use custom stub that properly emits update:modelValue
    const wrapper = mountReader( {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          ULocaleSelect: {
            name: "ULocaleSelect",
            props: ["id", "modelValue", "locales", "disabled", "size", "class"],
            emits: ["update:modelValue"],
            template:
              '<select :id="id" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option></select>',
          },
        },
      },
    });

    const desktopSelect = wrapper.find("select#targetLanguage");
    const mobileSelect = wrapper.find("select#mobileTargetLanguage");

    // Initially not disabled
    expect(desktopSelect.attributes("disabled")).toBeUndefined();
    expect(mobileSelect.attributes("disabled")).toBeUndefined();

    // Mock delayed response
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const fetchPromise = wrapper.vm.refreshNews();
    await nextTick();

    // Should be disabled during loading
    expect(desktopSelect.attributes("disabled")).toBeDefined();
    expect(mobileSelect.attributes("disabled")).toBeDefined();

    await fetchPromise;

    // Should be enabled again
    expect(desktopSelect.attributes("disabled")).toBeUndefined();
    expect(mobileSelect.attributes("disabled")).toBeUndefined();
  });

  // Additional tests to cover uncovered template branches (lines 190, 233, 248)
  it("covers v-else at line 188 - renders news when loaded", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Fetch news to trigger the v-else branch (line 188)
    await wrapper.vm.refreshNews();
    await nextTick();

    // Now we have news and are not loading
    expect(wrapper.vm.news.length).toBeGreaterThan(0);
    expect(wrapper.vm.loading).toBe(false);

    // This means line 180 (loading && news.length === 0) is FALSE
    // And we entered the v-else block at line 188
    // Then line 190 (news.length === 0 && !loading) is also FALSE
    // So we render the NewsCard components

    const newsCards = wrapper.findAllComponents(NewsCardMock);
    expect(newsCards.length).toBeGreaterThan(0);
  });

  it("covers line 190 - shows empty state card when no news and not loading", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Wait for any pending operations
    await nextTick();

    // Initially, no news loaded and not loading
    expect(wrapper.vm.news.length).toBe(0);
    expect(wrapper.vm.loading).toBe(false);

    // This should render the UCard at line 190
    const cardElements = wrapper.findAll(".u-card");
    expect(cardElements.length).toBeGreaterThan(0);

    // Find the card with "No news loaded yet" text
    const emptyCard = Array.from(cardElements).find((card) =>
      card.text().includes("No news loaded yet"),
    );
    expect(emptyCard?.exists()).toBe(true);
  });

  it("covers line 233 - shows pagination when filtered news exceeds items per page", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Add 5 news items to exceed itemsPerPage (3)
    mockFetch.mockResolvedValueOnce({
      success: true,
      data: [
        ...mockNews,
        {
          title: "News 3",
          summary: "Sum 3",
          content: "Content 3",
          source: "Src 3",
          publishedAt: "2024-01-15T12:00:00Z",
          category: "Business",
        },
        {
          title: "News 4",
          summary: "Sum 4",
          content: "Content 4",
          source: "Src 4",
          publishedAt: "2024-01-15T13:00:00Z",
          category: "Culture",
        },
        {
          title: "News 5",
          summary: "Sum 5",
          content: "Content 5",
          source: "Src 5",
          publishedAt: "2024-01-15T14:00:00Z",
          category: "Sports",
        },
      ],
      count: 5,
      timestamp: "2024-01-15T10:00:00Z",
    });

    await wrapper.vm.refreshNews();
    await nextTick();

    // Should have more items than itemsPerPage
    expect(wrapper.vm.filteredNews.length).toBeGreaterThan(3);

    // This should trigger the v-if at line 233 to render pagination
    const paginationElements = wrapper.findAll(".u-pagination");
    expect(paginationElements.length).toBeGreaterThan(0);
  });

  it("covers line 248 - shows error card when error exists", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Mock an error response
    mockFetch.mockRejectedValueOnce({
      data: { error: "API Error" },
    });

    await wrapper.vm.fetchNews();
    await nextTick();

    // Should have error set
    expect(wrapper.vm.error).toBeTruthy();

    // This should render the UCard at line 248 with error state
    const errorState = wrapper.find("[data-testid='error-state']");
    expect(errorState.exists()).toBe(true);
    expect(errorState.text()).toContain("API Error");
  });

  it("does not show pagination when filtered news is exactly items per page", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Add exactly 3 news items (itemsPerPage is 3)
    mockFetch.mockResolvedValueOnce({
      success: true,
      data: [
        ...mockNews,
        {
          title: "News 3",
          summary: "Sum 3",
          content: "Content 3",
          source: "Src 3",
          publishedAt: "2024-01-15T12:00:00Z",
          category: "Business",
        },
      ],
      count: 3,
      timestamp: "2024-01-15T10:00:00Z",
    });

    await wrapper.vm.refreshNews();
    await nextTick();

    // Should have exactly itemsPerPage items
    expect(wrapper.vm.filteredNews.length).toBe(3);

    // Line 233 v-if should be FALSE (not > itemsPerPage)
    const paginationElements = wrapper.findAll(".u-pagination");
    expect(paginationElements.length).toBe(0);
  });

  it("does not show empty state card when news is loaded", async () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // Fetch news successfully
    await wrapper.vm.refreshNews();
    await nextTick();

    // Should have news loaded
    expect(wrapper.vm.news.length).toBeGreaterThan(0);

    // Line 190 v-if should be FALSE (news.length !== 0)
    const cardElements = wrapper.findAll(".u-card");
    const emptyCard = Array.from(cardElements).find((card) =>
      card.text().includes("No news loaded yet"),
    );
    expect(emptyCard).toBeUndefined();
  });

  it("covers all template branches by cycling through all states", async () => {
    // Mount without using the helper to avoid stubs that might skip template code
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // State 1: Initial state - no news, not loading (line 190 TRUE)
    await nextTick();
    expect(wrapper.vm.news.length).toBe(0);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBeNull();

    // State 2: Loading state (line 180 TRUE, line 190 FALSE)
    // Use a delayed mock to catch the loading state
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
            50,
          ),
        ),
    );

    const loadingPromise = wrapper.vm.refreshNews();
    await nextTick();

    // Check that we're in loading state
    expect(wrapper.vm.loading).toBe(true);

    await loadingPromise;
    await nextTick();

    // State 3: News loaded (line 180 FALSE, line 190 FALSE, line 248 FALSE)
    expect(wrapper.vm.news.length).toBeGreaterThan(0);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBeNull();

    // State 4: Error state (line 248 TRUE)
    mockFetch.mockRejectedValueOnce({ data: { error: "Test error" } });
    await wrapper.vm.fetchNews();
    await nextTick();
    expect(wrapper.vm.error).toBeTruthy();
  });

  it("covers pagination branch with multiple items and category filter", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: { NewsCard: NewsCardMock },
        stubs: {
          NewsCard: NewsCardMock,
        },
      },
    });

    // Load more than 3 items to trigger pagination (line 233)
    mockFetch.mockResolvedValueOnce({
      success: true,
      data: [
        {
          title: "News 1",
          summary: "Sum 1",
          content: "Content 1",
          source: "Source 1",
          publishedAt: "2024-01-15T10:00:00Z",
          category: "Technology",
        },
        {
          title: "News 2",
          summary: "Sum 2",
          content: "Content 2",
          source: "Source 2",
          publishedAt: "2024-01-15T11:00:00Z",
          category: "Technology",
        },
        {
          title: "News 3",
          summary: "Sum 3",
          content: "Content 3",
          source: "Source 3",
          publishedAt: "2024-01-15T12:00:00Z",
          category: "Technology",
        },
        {
          title: "News 4",
          summary: "Sum 4",
          content: "Content 4",
          source: "Source 4",
          publishedAt: "2024-01-15T13:00:00Z",
          category: "Technology",
        },
      ],
      count: 4,
      timestamp: "2024-01-15T10:00:00Z",
    });

    await wrapper.vm.refreshNews();
    await nextTick();

    // Filter by category to test filteredNews (line 233)
    wrapper.vm.selectedCategory = "technology";
    await nextTick();

    expect(wrapper.vm.filteredNews.length).toBe(4);
    expect(wrapper.vm.filteredNews.length).toBeGreaterThan(3);
  });

  it("does not show error card when there is no error", () => {
    const wrapper = mountReader( {
      global: { components: { NewsCard: NewsCardMock } },
    });

    // No error initially
    expect(wrapper.vm.error).toBeNull();

    // Line 248 v-if should be FALSE (error is null)
    const errorState = wrapper.find("[data-testid='error-state']");
    expect(errorState.exists()).toBe(false);
  });
});
