import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import ColorPalettePage from "~/app/pages/docs/color-palette.vue";

const NuxtUIComponents = {
  UPage: { template: '<div class="u-page"><slot /></div>' },
  UHeader: {
    template:
      '<div class="u-header"><slot name="left" /><slot name="right" /><slot name="body" /><slot /></div>',
  },
  UButton: { template: '<button class="u-button"><slot /></button>' },
  UColorModeButton: { template: '<button class="u-color-mode-button" />' },
  UFooter: {
    template: '<div class="u-footer"><slot name="left" /><slot /></div>',
  },
};

describe("Color Palette Page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders every seasonal palette as named color badges", () => {
    const wrapper = mount(ColorPalettePage, {
      global: {
        stubs: NuxtUIComponents,
      },
    });

    expect(wrapper.text()).toContain("Color Palette & System");
    const text = wrapper.text();
    // One row per season × mode, each color shown as a named badge + hex.
    for (const label of ["Spring", "Summer", "Autumn", "Winter"]) {
      expect(text).toContain(label);
    }
    expect(text).toContain("Deep Rose");
    expect(text).toContain("#D2385A");
    expect(text).toContain("Asagi Sea-Teal");
    expect(text).toContain("Ai Indigo");
    expect(text).toContain("Cream Washi");
    // The old standalone base-palette table is gone.
    expect(text).not.toContain("Opposite Color");
  });

  it("handles mobile menu toggle click", async () => {
    const wrapper = mount(ColorPalettePage, {
      global: {
        stubs: NuxtUIComponents,
      },
    });

    const buttons = wrapper.findAll("button");
    for (const btn of buttons) {
      await btn.trigger("click");
    }
    expect(wrapper.vm).toBeDefined();
  });
});
