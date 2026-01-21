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
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
    public: {
      apiBase: "/api",
    },
  },
  routeRules: {
    "/**": {
      headers: process.env.NODE_ENV === "production"
        ? {
            // Production: Strict CSP
            "Content-Security-Policy":
              "default-src 'self'; script-src 'self' 'strict-dynamic' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.tavily.com https://generativelanguage.googleapis.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
            "Strict-Transport-Security":
              "max-age=31536000; includeSubDomains; preload",
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
          }
        : {
            // Development: Relaxed CSP for Vite HMR
            "Content-Security-Policy":
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' ws: http://localhost:* http://127.0.0.1:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' ws: http://localhost:* http://127.0.0.1:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' ws: https://api.tavily.com https://generativelanguage.googleapis.com http://localhost:* http://127.0.0.1:*; object-src 'none';",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
          },
    },
  },
});
