// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-14",
  devtools: { enabled: true },
  css: ["./app/assets/css/tailwind.css"],
  modules: ["@nuxt/test-utils/module", "@nuxt/ui"],
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
    },
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL,
    tavilyApiKey: process.env.TAVILY_API_KEY,
    public: {
      apiBase: "/api",
    },
  },
});
