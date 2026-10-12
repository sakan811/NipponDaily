import { createRequire } from "node:module";
import tailwindcss from "@tailwindcss/vite";
import { seasonBootScript } from "./shared/seasons";
import { STORAGE_KEYS } from "./shared/storage-keys";

// The site's faces, served from the app itself (@fontsource ships each as
// unicode-range slices, so a page downloads only the slices its text needs).
// Weights match what the markup uses; no request goes to a third party.
const FONT_CSS = [
  ...[300, 400, 500, 600, 700].map((w) => `@fontsource/outfit/${w}.css`),
  ...[400, 500, 600, 700, 900].map(
    (w) => `@fontsource/zen-old-mincho/${w}.css`,
  ),
  ...[400, 700].map((w) => `@fontsource/noto-serif-jp/${w}.css`),
];

// Every browser that runs the app reads woff2, so the woff fallback each
// @fontsource rule lists is dropped before Vite copies it into the build.
const woff2Only = {
  name: "fontsource-woff2-only",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    if (!/@fontsource\/[^?]+\.css(\?|$)/.test(id)) return;
    return code.replace(/,\s*url\([^)]*\.woff\)\s*format\(["']woff["']\)/g, "");
  },
};

// satori (the share images) shapes text with harfbuzzjs, which reads its
// hb.wasm from beside its own script by a computed path that the file tracer
// cannot see, so the deployed server would lack it. Resolve it through satori
// (pnpm nests it) and ask Nitro to ship it.
const HARFBUZZ_WASM = createRequire(
  createRequire(import.meta.url).resolve("satori"),
).resolve("harfbuzzjs/hb.wasm");

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-14",
  devtools: { enabled: true },
  css: [...FONT_CSS, "~/assets/css/tailwind.css"],
  modules: ["@nuxt/test-utils/module", "@nuxt/eslint", "@nuxt/hints"],
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      // Every page sets its own title (usePageSeo); this wraps it.
      titleTemplate: "%s · NipponDaily",
      script: [
        {
          innerHTML: `(function() {
            ${seasonBootScript(STORAGE_KEYS.seasonChoice)}
            try {
              const theme = localStorage.getItem(${JSON.stringify(STORAGE_KEYS.colorTheme)});
              const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
              const folder = isDark ? 'dark' : 'light';
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              const updateLinkPaths = function() {
                const links = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]');
                for (let i = 0; i < links.length; i++) {
                  const link = links[i];
                  const currentHref = link.getAttribute('href');
                  if (currentHref) {
                    if (currentHref.indexOf('/favicon-light.ico') === 0 || currentHref.indexOf('/favicon-dark.ico') === 0) {
                      link.setAttribute('href', isDark ? '/favicon-dark.ico' : '/favicon-light.ico');
                    } else if (currentHref.indexOf('/light/') === 0) {
                      link.setAttribute('href', currentHref.replace('/light/', '/' + folder + '/'));
                    } else if (currentHref.indexOf('/dark/') === 0) {
                      link.setAttribute('href', currentHref.replace('/dark/', '/' + folder + '/'));
                    }
                  }
                }
              };
              updateLinkPaths();
              document.addEventListener('DOMContentLoaded', updateLinkPaths);
            } catch (_) {}
          })()`,
          type: "text/javascript",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon-light.ico",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/light/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/light/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/light/apple-touch-icon.png",
        },
        {
          rel: "manifest",
          href: "/light/site.webmanifest",
        },
      ],
    },
  },
  // The entries are bundled into the server, and mapping them as well ran the
  // build out of memory at the default heap size; nothing reads the maps.
  sourcemap: { server: false },
  nitro: { sourceMap: false, externals: { traceInclude: [HARFBUZZ_WASM] } },
  routeRules: {
    // The daily game and the lesson/vocabulary pages were replaced by the
    // daily-word calendar. Temporary (not 301) redirects, so old bookmarks and
    // links land on the front page without a browser caching the move forever.
    "/game": { redirect: { to: "/", statusCode: 302 } },
    "/learn/**": { redirect: { to: "/", statusCode: 302 } },
    "/vocab/**": { redirect: { to: "/", statusCode: 302 } },
  },
  runtimeConfig: {
    public: {
      // The site's canonical origin, for absolute canonical/Open Graph URLs and
      // the sitemap. Optional: without it the origin of the request is used.
      // Overridable at runtime with NUXT_PUBLIC_SITE_URL.
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? "",
    },
  },
  vite: {
    plugins: [woff2Only, tailwindcss()],
  },
  hints: {
    features: {
      lazyLoad: false,
    },
  },
});
