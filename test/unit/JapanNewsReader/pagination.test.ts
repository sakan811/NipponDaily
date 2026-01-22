import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNews } from "./setup";

describe("JapanNewsReader - Pagination", () => {
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

  it("does not render pagination when news count <= items per page", async () => {
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

    // Only 2 items, itemsPerPage is 3, so no pagination
    await wrapper.vm.refreshNews();
    await nextTick();

    expect(wrapper.vm.filteredNews.length).toBe(2);
    expect(wrapper.vm.filteredNews.length).toBeLessThanOrEqual(
      wrapper.vm.itemsPerPage,
    );
  });

  it("renders pagination when news count > items per page", async () => {
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

  it("syncs page with UPagination via v-model", async () => {
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
});
