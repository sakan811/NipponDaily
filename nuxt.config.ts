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
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          })()`,
          type: "text/javascript",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
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
