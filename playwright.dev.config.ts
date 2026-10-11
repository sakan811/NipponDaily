import { defineConfig, devices } from "@playwright/test";

/**
 * The same app under `nuxt dev` (`e2e-dev/`), where Vue is not minified and
 * reports what a production build keeps quiet: a hydration mismatch, a
 * missing prop, an unknown component. The production browser tests
 * (`playwright.config.ts`) cannot see any of that. Run with
 * `pnpm test:e2e:dev`; it needs no build, but each page compiles on first
 * visit, so it is slower and kept to one browser.
 */
const PORT = 3101;

export default defineConfig({
  testDir: "./e2e-dev",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "on-first-retry" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec nuxt dev --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
    // Without this a dev run opens the browser devtools panel, and Nuxt asks
    // before telemetry on a fresh machine.
    env: { NUXT_TELEMETRY_DISABLED: "1", NUXT_DEVTOOLS: "false" },
  },
});
