import { test as base, expect } from "@playwright/test";

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

export { expect };
