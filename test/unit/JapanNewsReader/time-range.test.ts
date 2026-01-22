import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick as _nextTick } from "vue";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Time Range", () => {
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

  it("renders time range filter buttons", () => {
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

    expect(wrapper.vm.selectedTimeRange).toBe("week");

    const weekButton = wrapper
      .findAll("button")
      .find((button) => button.text() === "This Week");

    expect(weekButton?.classes()).toContain("bg-[var(--color-primary)]");
  });

  it("handles time range selection correctly", async () => {
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
});
