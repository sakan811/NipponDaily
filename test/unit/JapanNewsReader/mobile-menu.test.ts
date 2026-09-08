import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";

import { mountReader, mockNewsResponse } from "./setup";

describe("JapanNewsReader - Mobile Menu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).$fetch = vi.fn().mockResolvedValue(mockNewsResponse());
  });

  it("syncs mobileMenuOpen with the header via v-model", async () => {
    const wrapper = mountReader();
    const header = wrapper.find(".u-header");
    expect(header.exists()).toBe(true);

    await header.trigger("click");
    await nextTick();
    expect(wrapper.vm.mobileMenuOpen).toBe(true);
  });
});
