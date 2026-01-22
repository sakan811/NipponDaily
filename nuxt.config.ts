// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-14",
  devtools: { enabled: true },
  ssr: false,
  css: ["./app/assets/css/tailwind.css"],
  modules: ["@nuxt/test-utils/module", "@nuxt/ui", "@nuxt/eslint", "@nuxt/hints"],
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
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    public: {
      apiBase: "/api",
    },
  },
  nitro: {
    routeRules: {
      "/**": {
        headers: {
          // Security headers - only in production to avoid blocking DevTools
          // Relaxed CSP for SPA mode with Nuxt UI icons and components
          ...(process.env.NODE_ENV === "production"
            ? {
                "Content-Security-Policy": [
                  "default-src 'self' https:",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
                  "style-src 'self' 'unsafe-inline' https:",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data: https:",
                  "connect-src 'self' https://*.googleapis.com https://*.tavily.com https:",
                  "frame-src 'self' https:",
                  "frame-ancestors 'self'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "worker-src 'self' blob:",
                ].join("; "),
                "Cross-Origin-Opener-Policy": "same-origin",
                "Cross-Origin-Resource-Policy": "same-origin",
              }
            : {}),
          // Apply these in both dev and production (DevTools compatible)
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Permissions-Policy":
            "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "X-DNS-Prefetch-Control": "off",
        },
      },
    },
  }
});