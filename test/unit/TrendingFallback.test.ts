import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TrendingFallback from "~/app/components/TrendingFallback.vue";

describe("TrendingFallback Component", () => {
  it("renders default error title and fallback message when error prop is null", () => {
    const wrapper = mount(TrendingFallback, {
      props: {
        error: null,
        loading: false,
        isDebug: false,
      },
    });

    expect(wrapper.text()).toContain("Unable to Retrieve Trending Topics");
    expect(wrapper.text()).toContain(
      "Service temporarily unavailable. Please try again.",
    );
  });

  it("renders custom error message when error prop is provided", () => {
    const wrapper = mount(TrendingFallback, {
      props: {
        error: "Database Connection Timeout",
        loading: false,
        isDebug: false,
      },
    });

    expect(wrapper.text()).toContain("Database Connection Timeout");
  });

  it("emits retry event when Try Again button is clicked", async () => {
    const wrapper = mount(TrendingFallback, {
      props: {
        error: "Network Error",
        loading: false,
        isDebug: false,
      },
    });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    await button.trigger("click");

    expect(wrapper.emitted("retry")).toBeTruthy();
  });

  it("shows debug preview when isDebug is true", () => {
    const wrapper = mount(TrendingFallback, {
      props: {
        error: "API Error",
        loading: false,
        isDebug: true,
      },
    });

    expect(wrapper.text()).toContain(
      "DEBUG_ERROR_UI: Mock Trending Fallback Preview",
    );
  });
});
