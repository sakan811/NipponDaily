import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  let linkLightFavicon: HTMLLinkElement;
  let linkLightFolder: HTMLLinkElement;
  let linkDarkFolder: HTMLLinkElement;

  beforeEach(() => {
    document.documentElement.className = "";
    document.head.innerHTML = "";

    linkLightFavicon = document.createElement("link");
    linkLightFavicon.rel = "icon";
    linkLightFavicon.href = "/favicon-light.ico";

    linkLightFolder = document.createElement("link");
    linkLightFolder.rel = "apple-touch-icon";
    linkLightFolder.href = "/light/apple-touch-icon.png";

    linkDarkFolder = document.createElement("link");
    linkDarkFolder.rel = "manifest";
    linkDarkFolder.href = "/dark/site.webmanifest";

    const linkNoHref = document.createElement("link");
    linkNoHref.rel = "icon";

    document.head.appendChild(linkLightFavicon);
    document.head.appendChild(linkLightFolder);
    document.head.appendChild(linkDarkFolder);
    document.head.appendChild(linkNoHref);
  });

  afterEach(() => {
    document.head.innerHTML = "";
    document.documentElement.className = "";
  });

  it("renders main layout with correct structure", () => {
    const wrapper = mount(App, { global: { components: globalComponents } });

    // App renders UApp > NuxtRouteAnnouncer + NuxtPage
    expect(wrapper.findComponent(UAppMock).exists()).toBe(true);
    expect(wrapper.findComponent(NuxtRouteAnnouncerMock).exists()).toBe(true);
    expect(wrapper.findComponent(NuxtPageMock).exists()).toBe(true);
  });

  it("updates favicons on mount and document theme mutations", async () => {
    // Mount App (initial run: not dark)
    mount(App, { global: { components: globalComponents } });

    expect(linkLightFavicon.getAttribute("href")).toBe("/favicon-light.ico");
    expect(linkLightFolder.getAttribute("href")).toBe(
      "/light/apple-touch-icon.png",
    );

    // Toggle dark mode on documentElement
    document.documentElement.classList.add("dark");

    // Wait for MutationObserver callback
    await new Promise((r) => setTimeout(r, 50));

    expect(linkLightFavicon.getAttribute("href")).toBe("/favicon-dark.ico");
    expect(linkLightFolder.getAttribute("href")).toBe(
      "/dark/apple-touch-icon.png",
    );
    expect(linkDarkFolder.getAttribute("href")).toBe("/dark/site.webmanifest");

    // Toggle light mode on documentElement
    document.documentElement.classList.remove("dark");

    await new Promise((r) => setTimeout(r, 50));

    expect(linkLightFavicon.getAttribute("href")).toBe("/favicon-light.ico");
    expect(linkLightFolder.getAttribute("href")).toBe(
      "/light/apple-touch-icon.png",
    );
    expect(linkDarkFolder.getAttribute("href")).toBe("/light/site.webmanifest");
  });
});
