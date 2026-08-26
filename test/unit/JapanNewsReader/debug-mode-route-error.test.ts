import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

import JapanNewsReader from "~/app/components/JapanNewsReader.vue";
import { mockBriefingCard, mockNews } from "./setup";

vi.mock("vue-router", () => ({
  useRoute: () => {
    throw new Error("no router context");
  },
}));

describe("JapanNewsReader - isDebugErrorUi when useRoute throws", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue({
      success: true,
      data: mockNews,
      count: 2,
      timestamp: "2024-01-15T10:00:00Z",
    });
  });

  it("falls back to false instead of propagating the error", () => {
    const wrapper = mount(JapanNewsReader, {
      global: { components: { BriefingCard: mockBriefingCard } },
    });

    expect(wrapper.vm.isDebugErrorUi).toBe(false);
  });
});
