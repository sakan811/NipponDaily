import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import ArchitecturePage from "~/app/pages/docs/architecture.vue";

const NuxtUIComponents = {
  UPage: { template: '<div class="u-page"><slot /></div>' },
  UHeader: { template: '<div class="u-header"><slot name="left" /><slot name="right" /><slot name="body" /><slot /></div>' },
  UButton: { template: '<button class="u-button"><slot /></button>' },
  UColorModeButton: { template: '<button class="u-color-mode-button" />' },
  UCard: { template: '<div class="u-card"><slot name="header" /><slot /></div>' },
  UFooter: { template: '<div class="u-footer"><slot name="left" /><slot /></div>' },
  MermaidDiagram: { template: '<div class="mermaid-diagram" />' },
};

describe("Architecture Page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly and contains architecture information", () => {
    const wrapper = mount(ArchitecturePage, {
      global: {
        stubs: NuxtUIComponents,
      },
    });

    expect(wrapper.text()).toContain("System Architecture");
    expect(wrapper.text()).toContain("Frontend (Nuxt 4)");
    expect(wrapper.text()).toContain("Color Palette & System");
    expect(wrapper.text()).toContain("Torii Vermilion");
    expect(wrapper.text()).toContain("Serene Sky");
    expect(wrapper.text()).toContain("Amber Gold");
    expect(wrapper.text()).toContain("Zen Stone");
  });
});
