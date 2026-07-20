import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-14",
  devtools: { enabled: true },
  css: ["./app/assets/css/tailwind.css"],
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
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL,
    geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL,
    tavilyApiKey: process.env.TAVILY_API_KEY,
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    upstashVectorRestUrl: process.env.UPSTASH_VECTOR_REST_URL,
    upstashVectorRestToken: process.env.UPSTASH_VECTOR_REST_TOKEN,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    public: {
      apiBase: "/api",
      debugErrorUi: process.env.DEBUG_ERROR_UI === "true",
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@internationalized/date", "marked"],
    },
  },
  hints: {
    features: {
      lazyLoad: false,
    },
  },
});
