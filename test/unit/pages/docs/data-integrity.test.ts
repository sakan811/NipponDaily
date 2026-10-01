import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import DataIntegrityPage from "~/app/pages/docs/data-integrity.vue";

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

describe("Data Integrity Page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the data sources and attribution", () => {
    const wrapper = mount(DataIntegrityPage, {
      global: {
        stubs: NuxtUIComponents,
      },
    });

    expect(wrapper.text()).toContain("Data Integrity & Attribution");
    expect(wrapper.text()).toContain("Data & Sources");
    expect(wrapper.text()).toContain("Attribution");
    expect(wrapper.text()).toContain("JMdict");
    expect(wrapper.find("#data-attribution").exists()).toBe(true);
  });

  it("credits Wiktionary and its license for the quoted etymology", () => {
    const wrapper = mount(DataIntegrityPage, {
      global: {
        stubs: NuxtUIComponents,
      },
    });

    const text = wrapper.text();
    expect(text).toContain("English Wiktionary");
    expect(text).toContain("CC BY-SA 4.0");
    expect(text).toContain("data/reference/etymology-reference.json");
  });

  it("documents the daily-word checks and what they cannot prove", () => {
    const wrapper = mount(DataIntegrityPage, {
      global: {
        stubs: NuxtUIComponents,
      },
    });

    const text = wrapper.text();
    expect(text).toContain("words.test.ts");
    expect(text).toContain("verbatim");
    expect(text).toContain("pnpm data:etymology");
    expect(text).toContain("What these checks cannot prove");
  });

  it("no longer documents the removed lesson and game checks", () => {
    const wrapper = mount(DataIntegrityPage, {
      global: {
        stubs: NuxtUIComponents,
      },
    });

    const text = wrapper.text();
    expect(text).not.toContain("daily game");
    expect(text).not.toContain("Lesson prose");
    expect(text).not.toContain("data:draft:clusters");
  });

  it("renders the content-accuracy CI checks", () => {
    const wrapper = mount(DataIntegrityPage, {
      global: {
        stubs: NuxtUIComponents,
      },
    });

    const text = wrapper.text();
    expect(text).toContain("Content-Accuracy CI Checks");
    expect(text).toContain("data/reference/n5-reference.json");
    expect(text).toContain("pnpm data:reference");
    expect(text).toContain("VOCAB_FORM_CORRECTIONS");
  });
});
