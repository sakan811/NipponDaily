import { test as base, expect, type Page } from "@playwright/test";

/**
 * Every test fails on an uncaught error or a console error: a page that
 * throws while hydrating still answers 200, so the HTTP tests miss it.
 */
export const test = base.extend<{ problems: string[] }>({
  problems: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
      page.on("console", (m) => {
        if (m.type() === "error") problems.push(`console: ${m.text()}`);
      });
      await use(problems);
      expect(problems, "errors in the browser").toEqual([]);
    },
    { auto: true },
  ],
});

/**
 * Waits until the app has hydrated. The server's HTML shows a form before
 * Vue has attached its handlers, so typing or clicking straight after `goto`
 * can be lost on a slower engine or runner; Chromium usually wins that race
 * and Firefox and WebKit on a CI machine do not.
 */
export const hydrated = (page: Page) =>
  page.waitForFunction(
    () =>
      (
        window as unknown as {
          useNuxtApp?: () => { isHydrating: boolean };
        }
      ).useNuxtApp?.().isHydrating === false,
  );

export { expect };
