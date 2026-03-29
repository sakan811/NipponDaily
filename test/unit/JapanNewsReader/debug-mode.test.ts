import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import JapanNewsReader from "~/app/components/JapanNewsReader.vue";
import { mockBriefingCard } from "./setup";

describe("JapanNewsReader - Debug Mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Enable debug mode via the global mock defined in test/setup.ts
    const mockRuntimeConfig = (global as any).useRuntimeConfig;
    mockRuntimeConfig.mockReturnValue({
      public: {
        debugErrorUi: true,
      },
    });
  });

  it("renders debug mode controls when debugErrorUi is true", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: mockBriefingCard,
        },
      },
    });

    // Check if debug panel is visible
    expect(wrapper.text()).toContain("DEBUG MODE: Error UI Testing");

    // Line 257: @click="isDebugRateLimit = !isDebugRateLimit"
    const debugButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Switch to"));
    expect(debugButton).toBeDefined();

    if (debugButton) {
      // Initial state is true in component (ref(true))
      expect(debugButton.text()).toContain("General UI");

      // Click to toggle isDebugRateLimit to false
      await debugButton.trigger("click");
      expect(debugButton.text()).toContain("Rate Limit UI");

      // Click again to toggle back to true
      await debugButton.trigger("click");
      expect(debugButton.text()).toContain("General UI");
    }
  });

  it("shows debug rate limit error when toggled", async () => {
    const wrapper = mount(JapanNewsReader, {
      global: {
        components: {
          NewsCard: mockBriefingCard,
        },
      },
    });

    const debugButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Switch to"));

    // Initial state is true, so clicking once makes it false (General UI)
    await debugButton?.trigger("click");
    expect(debugButton?.text()).toContain("Rate Limit UI");
    expect(wrapper.text()).not.toContain("Daily Limit Reached");

    // Clicking again makes it true (Rate Limit UI)
    await debugButton?.trigger("click");
    expect(debugButton?.text()).toContain("General UI");
    expect(wrapper.text()).toContain("Daily Limit Reached");
  });
});
