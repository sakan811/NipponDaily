import { test, expect, type Page } from "@playwright/test";
import { DOC_PATHS } from "../shared/docs";

/**
 * Walks the app in dev mode and fails on anything Vue or Nuxt warns about
 * (`[Vue warn]`, a hydration mismatch) as well as errors. The server renders
 * each page and the browser hydrates it, so a mismatch between the two shows
 * here and nowhere in the production browser tests.
 */

/**
 * What counts: anything Vue itself warns about (every hydration mismatch it
 * finds is a `[Vue warn]`), any logged error, and any uncaught exception.
 *
 * What does not: the `hints:hydration` notes from @nuxt/hints. It compares a
 * component's markup before and after hydration, so it also names what the app
 * changes on purpose once mounted (the header's colour-mode, season and music
 * buttons) and boolean attributes the DOM writes differently (`disabled` for
 * `disabled=""`). Vue's own warning is what says the two renders disagree.
 */
const isProblem = (type: string, text: string) =>
  type === "error" ||
  /\[Vue warn\]/.test(text) ||
  /Hydration completed but contains mismatches/i.test(text);

const watch = (page: Page) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (isProblem(m.type(), m.text()))
      problems.push(`${m.type()}: ${m.text()}`);
  });
  return problems;
};

/** Load a page, wait for it to hydrate, and report what was logged. */
async function visit(page: Page, path: string): Promise<string[]> {
  const problems = watch(page);
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  return problems;
}

const PAGES = [
  "/",
  "/words",
  "/explore",
  "/patterns",
  "/parts",
  "/kanji",
  "/kana",
  ...DOC_PATHS,
];

for (const path of PAGES) {
  test(`${path} hydrates without a Vue warning`, async ({ page }) => {
    expect(await visit(page, path)).toEqual([]);
  });
}

test("a word, a kanji and a part hydrate without a Vue warning", async ({
  page,
}) => {
  const problems = watch(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByTestId("today-word").click();
  await expect(page).toHaveURL(/\/words\/\d{4}-\d{2}-\d{2}$/);
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

  for (const path of ["/kanji/日", "/parts/日"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  }
  expect(problems).toEqual([]);
});

test("the pages hydrate in dark mode and in each season", async ({ page }) => {
  const problems = watch(page);
  await page.emulateMedia({ colorScheme: "dark" });
  for (const season of ["sakura", "summer", "autumn", "winter"]) {
    await page.addInitScript(
      (s: string) => localStorage.setItem("season-choice", s),
      season,
    );
    await page.goto("/words", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-season", season);
  }
  expect(problems).toEqual([]);
});
