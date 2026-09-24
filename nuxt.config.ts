import tailwindcss from "@tailwindcss/vite";
import { SEASON_IDS } from "./shared/seasons";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Zen+Old+Mincho:wght@400;500;600;700;900&family=Noto+Serif+JP:wght@400;700&display=swap";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-14",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  modules: ["@nuxt/test-utils/module", "@nuxt/eslint", "@nuxt/hints"],
  app: {
    head: {
      script: [
        {
          innerHTML: `(function() {
            try {
              const theme = localStorage.getItem('color-theme');
              const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
              const folder = isDark ? 'dark' : 'light';
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              const cachedSeason = localStorage.getItem('site-theme-season');
              if (${JSON.stringify(SEASON_IDS)}.indexOf(cachedSeason) !== -1) {
                document.documentElement.setAttribute('data-season', cachedSeason);
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
        // Fonts were an @import inside tailwind.css, which serialised
        // CSS -> fonts CSS -> font files; a preconnect + <link> in <head>
        // lets the browser fetch them in parallel with the app CSS.
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        { rel: "stylesheet", href: FONTS_URL },
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
  routeRules: {
    // The active season changes a few times a year, and every page load
    // fetches it — let the CDN absorb that. An MCP save_site_theme shows up
    // within a minute.
    "/api/site-theme": {
      headers: {
        "cache-control":
          "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
      },
    },
  },
  runtimeConfig: {
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    mcpAuthToken: process.env.MCP_AUTH_TOKEN,
    cronSecret: process.env.CRON_SECRET,
    public: {
      apiBase: "/api",
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@internationalized/date", "marked"],
    },
    server: {
      allowedHosts: [".pinggy.net"],
    },
  },
  hints: {
    features: {
      lazyLoad: false,
    },
  },
});
