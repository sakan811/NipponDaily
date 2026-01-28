import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import App from "~/app/app.vue";

// Mock components
const NuxtRouteAnnouncerMock = {
  name: "NuxtRouteAnnouncer",
  template: '<div class="route-announcer"></div>',
};

const NuxtPageMock = {
  name: "NuxtPage",
  template: '<div class="nuxt-page"><slot /></div>',
};

const UAppMock = {
  name: "UApp",
  template: '<div class="u-app"><slot /></div>',
};

vi.mock("#app/components/NuxtRouteAnnouncer", () => ({
  default: NuxtRouteAnnouncerMock,
}));

const globalComponents = {
  NuxtRouteAnnouncer: NuxtRouteAnnouncerMock,
  NuxtPage: NuxtPageMock,
  UApp: UAppMock,
};

describe("App", () => {
  it("renders main layout with correct structure", () => {
    const wrapper = mount(App, { global: { components: globalComponents } });

    // App renders UApp > NuxtRouteAnnouncer + NuxtPage
    expect(wrapper.findComponent(UAppMock).exists()).toBe(true);
    expect(wrapper.findComponent(NuxtRouteAnnouncerMock).exists()).toBe(true);
    expect(wrapper.findComponent(NuxtPageMock).exists()).toBe(true);
  });

  it("renders child components", () => {
    const wrapper = mount(App, { global: { components: globalComponents } });

    expect(wrapper.findComponent(NuxtRouteAnnouncerMock).exists()).toBe(true);
    expect(wrapper.findComponent(UAppMock).exists()).toBe(true);
  });
});
