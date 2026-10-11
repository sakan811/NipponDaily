import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests (`e2e/`): the built app, driven in a real browser. They cover
 * what the unit tests (mocked composables) and the integration test (HTTP
 * only) cannot: hydration, clicks, the URL and `localStorage`. Run with
 * `pnpm test:e2e`, which builds first.
 *
 * Every test runs in three engines (Chromium, Firefox, WebKit) at a desktop
 * width, and in Chromium on an Android phone and WebKit on an iPhone, since
 * the engines disagree about CSS, audio and form controls and a reader on any
 * of them gets the same pages. `playwright.dev.config.ts` is the separate run
 * against `nuxt dev` that fails on a Vue warning.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The API is rate limited per address (shared/endpoints.ts), and every test
  // here comes from one, so the tests are kept few and run one at a time on CI.
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    // Principle 6: the same pages on a narrow touch screen, in the two
    // engines phones ship.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    command: "pnpm start",
    url: `http://127.0.0.1:${PORT}`,
    env: { PORT: String(PORT) },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
