import { test, expect } from "./fixtures";

const count = async (page: import("@playwright/test").Page) => {
  const text = await page.getByTestId("explore-count").textContent();
  return Number(/^\s*(\d+) of/.exec(text ?? "")![1]);
};

test("a level chip narrows the list, writes the URL, and Clear undoes it", async ({
  page,
}) => {
  await page.goto("/explore");
  await expect(page.getByTestId("explore-count")).toBeVisible();
  const all = await count(page);

  const chip = page
    .getByTestId("facet-level")
    .getByRole("button", { pressed: false })
    .and(page.locator(":not([disabled])"))
    .first();
  await chip.click();

  await expect(page).toHaveURL(/[?&]level=N\d/);
  await expect(
    page.getByTestId("facet-level").getByRole("button", { pressed: true }),
  ).toHaveCount(1);
  await expect.poll(() => count(page)).toBeLessThan(all);

  await page.getByTestId("explore-clear").click();
  await expect.poll(() => count(page)).toBe(all);
  await expect(page).not.toHaveURL(/level=/);
});

test("a filter in the URL is applied on load", async ({ page }) => {
  await page.goto("/explore?level=N1");
  await expect(
    page.getByTestId("facet-level").getByRole("button", { name: /N1/ }),
  ).toHaveAttribute("aria-pressed", "true");
  const results = page.getByTestId("explore-word");
  await expect(results.first()).toBeVisible();
  for (const text of await results.allTextContents()) {
    expect(text).toContain("N1");
  }
});

test("any/all gives the counts the API gives for two processes", async ({
  page,
  request,
}) => {
  const total = async (query: string) =>
    (await (await request.get(`/api/explore?${query}`)).json()).data.count;

  await page.goto("/explore");
  await expect(page.getByTestId("explore-count")).toBeVisible();
  const chips = page
    .getByTestId("facet-process")
    .getByRole("button")
    .and(page.locator(":not([disabled])"));
  await chips.nth(0).click();
  await chips.nth(1).click();
  await expect(page).toHaveURL(/process=[^&]+(,|%2C)[^&]+/);
  const process = new URL(page.url()).searchParams.get("process")!;

  await expect(page.getByTestId("match-any")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect.poll(() => count(page)).toBe(await total(`process=${process}`));

  await page.getByTestId("match-all").click();
  await expect(page).toHaveURL(/match=all/);
  const all = await total(`process=${process}&match=all`);
  await expect.poll(() => count(page)).toBe(all);
  expect(all).toBeLessThanOrEqual(await total(`process=${process}`));
});

test("searching finds a word by its term", async ({ page }) => {
  await page.goto("/");
  const term = (await page.getByTestId("today-term").textContent())!.trim();

  await page.goto("/explore");
  await page.getByTestId("explore-search").fill(term);
  await expect(page).toHaveURL(/[?&]q=/);
  await expect(
    page.getByTestId("explore-word").filter({ hasText: term }).first(),
  ).toBeVisible();
});
