import { test, expect } from "./fixtures";

const PAGES = [
  ["/", "NipponDaily"],
  ["/words", "Calendar"],
  ["/explore", "Explore"],
  ["/patterns", "Patterns"],
  ["/parts", "Parts"],
  ["/kanji", "Kanji"],
  ["/kana", "Kana"],
  ["/docs", "Docs"],
] as const;

test.describe("every page", () => {
  for (const [path] of PAGES) {
    test(`${path} renders one heading and no errors`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      // The page cannot be scrolled sideways (principle 6). The body clips
      // overflow, so what counts is whether a scroll moves it, not its width.
      const scrolled = await page.evaluate(() => {
        window.scrollTo(200, 0);
        return window.scrollX;
      });
      expect(scrolled).toBe(0);
    });
  }
});

test("the home page opens today's word, and its page has neighbours", async ({
  page,
}) => {
  await page.goto("/");
  const term = (await page.getByTestId("today-term").textContent())!.trim();
  await page.getByTestId("today-word").click();
  await expect(page).toHaveURL(/\/words\/\d{4}-\d{2}-\d{2}$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(term);

  const prev = page.getByTestId("word-prev");
  await expect(prev).toBeVisible();
  const before = page.url();
  await prev.click();
  await expect(page).not.toHaveURL(before);
  await expect(page.getByTestId("word-next")).toBeVisible();
});
