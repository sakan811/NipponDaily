// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/test-utils/module'],
  tailwindcss: {
    cssPath: ['assets/css/tailwind.css', { injectPosition: "first" }],
    config: {
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: 'var(--color-primary)',
              50: 'rgba(188, 0, 45, 0.05)',
              100: 'rgba(188, 0, 45, 0.1)',
              200: 'rgba(188, 0, 45, 0.2)',
              300: 'rgba(188, 0, 45, 0.3)',
              400: 'rgba(188, 0, 45, 0.4)',
              500: 'rgba(188, 0, 45, 0.5)',
              600: 'rgba(188, 0, 45, 0.6)',
              700: 'rgba(188, 0, 45, 0.7)',
              800: 'rgba(188, 0, 45, 0.8)',
              900: 'rgba(188, 0, 45, 0.9)',
              950: 'rgba(188, 0, 45, 0.95)'
            },
            secondary: {
              DEFAULT: 'var(--color-secondary)',
              50: 'rgba(93, 138, 168, 0.05)',
              100: 'rgba(93, 138, 168, 0.1)',
              200: 'rgba(93, 138, 168, 0.2)',
              300: 'rgba(93, 138, 168, 0.3)',
              400: 'rgba(93, 138, 168, 0.4)',
              500: 'rgba(93, 138, 168, 0.5)',
              600: 'rgba(93, 138, 168, 0.6)',
              700: 'rgba(93, 138, 168, 0.7)',
              800: 'rgba(93, 138, 168, 0.8)',
              900: 'rgba(93, 138, 168, 0.9)',
              950: 'rgba(93, 138, 168, 0.95)'
            },
            accent: {
              DEFAULT: 'var(--color-accent)',
              50: 'rgba(255, 183, 197, 0.05)',
              100: 'rgba(255, 183, 197, 0.1)',
              200: 'rgba(255, 183, 197, 0.2)',
              300: 'rgba(255, 183, 197, 0.3)',
              400: 'rgba(255, 183, 197, 0.4)',
              500: 'rgba(255, 183, 197, 0.5)',
              600: 'rgba(255, 183, 197, 0.6)',
              700: 'rgba(255, 183, 197, 0.7)',
              800: 'rgba(255, 183, 197, 0.8)',
              900: 'rgba(255, 183, 197, 0.9)',
              950: 'rgba(255, 183, 197, 0.95)'
            },
            success: {
              DEFAULT: 'var(--color-success)',
              50: 'rgba(0, 102, 0, 0.05)',
              100: 'rgba(0, 102, 0, 0.1)',
              200: 'rgba(0, 102, 0, 0.2)',
              300: 'rgba(0, 102, 0, 0.3)',
              400: 'rgba(0, 102, 0, 0.4)',
              500: 'rgba(0, 102, 0, 0.5)',
              600: 'rgba(0, 102, 0, 0.6)',
              700: 'rgba(0, 102, 0, 0.7)',
              800: 'rgba(0, 102, 0, 0.8)',
              900: 'rgba(0, 102, 0, 0.9)',
              950: 'rgba(0, 102, 0, 0.95)'
            },
            warning: {
              DEFAULT: 'var(--color-warning)',
              50: 'rgba(255, 215, 0, 0.05)',
              100: 'rgba(255, 215, 0, 0.1)',
              200: 'rgba(255, 215, 0, 0.2)',
              300: 'rgba(255, 215, 0, 0.3)',
              400: 'rgba(255, 215, 0, 0.4)',
              500: 'rgba(255, 215, 0, 0.5)',
              600: 'rgba(255, 215, 0, 0.6)',
              700: 'rgba(255, 215, 0, 0.7)',
              800: 'rgba(255, 215, 0, 0.8)',
              900: 'rgba(255, 215, 0, 0.9)',
              950: 'rgba(255, 215, 0, 0.95)'
            },
            text: 'var(--color-text)',
            'text-muted': 'var(--color-text-muted)',
            'text-light': 'var(--color-text-light)',
            background: 'var(--color-background)',
            'background-muted': 'var(--color-background-muted)',
            border: 'var(--color-border)',
            'japan-red': 'var(--color-japan-red)',
            mizu: 'var(--color-mizu)',
            sakura: 'var(--color-sakura)',
            midori: 'var(--color-midori)',
            ki: 'var(--color-ki)',
            kuro: 'var(--color-kuro)',
            hai: 'var(--color-hai)',
            yuki: 'var(--color-yuki)',
            samurai: 'var(--color-samurai)'
          }
        }
      }
    },
    viewer: true,
    exposeConfig: false,
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL,
    tavilyApiKey: process.env.TAVILY_API_KEY,
    public: {
      apiBase: '/api'
    }
  }
})
