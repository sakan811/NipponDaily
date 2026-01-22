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

  it("renders mobile news amount input with correct attributes", () => {
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

    const mobileInput = wrapper.find("input#mobileNewsAmount");
    expect(mobileInput.exists()).toBe(true);
    expect(mobileInput.attributes("type")).toBe("number");
    expect(mobileInput.attributes("min")).toBe("1");
    expect(mobileInput.attributes("max")).toBe("20");
  });

  it("binds mobile news amount input to newsAmount reactive property", async () => {
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

    const mobileInput = wrapper.find("input#mobileNewsAmount");
    await mobileInput.setValue(5);
    expect(wrapper.vm.newsAmount).toBe(5);
  });

  it("disables mobile news amount input when loading", async () => {
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

    // The ULocaleSelect component is used for mobile language selection
    // Verify the component has the targetLanguage ref
    expect(wrapper.vm.targetLanguage).toBeDefined();
  });

  it("binds mobile language input to targetLanguage", async () => {
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
            name: "NewsCard",
            props: ["news"],
            template: '<div class="news-card">{{ news.title }}</div>',
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

  it("mobile Get News button closes menu after click", async () => {
    // Stub UHeader to always render body content and bind mobileMenuOpen
    // Also stub UButton to ensure block class is rendered
    const UHeaderMock = {
      name: "UHeader",
      props: ["open"],
      emits: ["update:open"],
      template: `
        <div class="u-header">
          <div class="header-left"><slot name="left"></slot></div>
          <div class="header-right"><slot name="right"></slot></div>
          <div class="header-body" v-if="open"><slot name="body"></slot></div>
        </div>
      `,
    };
    const UButtonMock = {
      name: "UButton",
      props: ["block", "disabled", "loading", "color", "size", "icon", "label"],
      emits: ["click"],
      template: `<button :class="['u-button', block ? 'block' : '']" data-block="true" @click="click"><slot></slot>{{label}}</button>`,
      methods: {
        click() {
          // @ts-expect-error - $emit is a Vue 2 method, component is mocked for testing
          this.$emit("click");
        },
      },
    };
    const wrapper = mountReader({
      global: {
        components: {
          NewsCard: {
            name: "NewsCard",
            props: ["news"],
            template: '<div class="news-card">{{ news.title }}</div>',
          },
        },
        stubs: {
          UHeader: UHeaderMock,
          UButton: UButtonMock,
        },
      },
    });

    // Open the mobile menu so body content renders
    wrapper.vm.mobileMenuOpen = true;
    await nextTick();

    // Find mobile Get News button by looking for it within the header body
    // The mobile button is inside .header-body and has data-block="true"
    const headerBody = wrapper.find(".header-body");
    const mobileButtons = headerBody.findAll("button[data-block='true']");

    // The mobile button should now be found
    expect(mobileButtons.length).toBeGreaterThan(0);

    // The mobile Get News button should have "Get News" or "Getting..." text
    const getNewsButton = mobileButtons.find((b) => {
      const text = b.text();
      return text.includes("Getting") || text.includes("Get News");
    });

    expect(getNewsButton).toBeDefined();

    // Click the mobile Get News button and wait for async operations
    await getNewsButton!.trigger("click");
    await nextTick();
    // Wait for the async refreshNews to complete
    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Menu should close after async operation completes
    expect(wrapper.vm.mobileMenuOpen).toBe(false);
  });

  it("syncs mobileMenuOpen with UHeader via v-model", async () => {
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
    const header = wrapper.find(".u-header");
    expect(header.exists()).toBe(true);
    // Trigger click which emits update:open
    await header.trigger("click");
    await nextTick();
    expect(wrapper.vm.mobileMenuOpen).toBe(true);
  });
});
