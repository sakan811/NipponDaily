import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppHeader from "~/app/components/AppHeader.vue";
import UHeader from "~/app/components/UHeader.vue";
import UButton from "~/app/components/UButton.vue";

const mountHeader = () =>
  mount(AppHeader, {
    global: {
      stubs: { UHeader },
      components: {
        UButton,
        UIcon: { template: "<i />" },
        SeasonButton: { template: "<span />" },
        BgmControl: { template: "<span />" },
        UColorModeButton: { template: "<span />" },
        NuxtLink: { props: ["to"], template: "<a :href='to'><slot /></a>" },
      },
    },
  });

const LINKS = ["/words", "/explore", "/patterns", "/parts", "/kana", "/docs"];

describe("AppHeader", () => {
  it("has a menu button on small screens that opens every nav link", async () => {
    const wrapper = mountHeader();
    const toggle = wrapper.find('button[aria-label="Open menu"]');
    expect(toggle.exists()).toBe(true);
    expect(wrapper.find('nav[aria-label="Main"]').exists()).toBe(false);

    await toggle.trigger("click");

    const links = wrapper
      .findAll('nav[aria-label="Main"] a')
      .map((a) => a.attributes("href"));
    expect(links).toEqual(LINKS);
  });

  it("closes the menu after a link is chosen", async () => {
    const wrapper = mountHeader();
    await wrapper.find('button[aria-label="Open menu"]').trigger("click");

    await wrapper.find('nav[aria-label="Main"] a').trigger("click");

    expect(wrapper.find('button[aria-label="Open menu"]').exists()).toBe(true);
  });

  it("keeps the desktop nav in the header with the same links", () => {
    const wrapper = mountHeader();
    const links = wrapper
      .findAll("nav.hidden a")
      .map((a) => a.attributes("href"));
    expect(links).toEqual(LINKS);
  });
});
