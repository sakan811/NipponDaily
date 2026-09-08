import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

import JapanNewsReader from "~/app/components/JapanNewsReader.vue";
import { mockLessonCard, mockNewsResponse } from "./setup";

vi.mock("vue-router", () => ({
  useRoute: () => {
    throw new Error("no router context");
  },
}));

describe("JapanNewsReader - isDebugErrorUi when useRoute throws", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue(mockNewsResponse());
  });

  it("falls back to false instead of propagating the error", () => {
    const wrapper = mount(JapanNewsReader, {
      global: { components: { LessonCard: mockLessonCard } },
    });

    expect(wrapper.vm.isDebugErrorUi).toBe(false);
  });
});
