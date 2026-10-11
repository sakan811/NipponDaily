import { test, expect, hydrated } from "./fixtures";

const count = async (page: import("@playwright/test").Page) => {
  const text = await page.getByTestId("explore-count").textContent();
  return Number(/^\s*(\d+) of/.exec(text ?? "")![1]);
};

test("a level chip narrows the list, writes the URL, and Clear undoes it", async ({
  page,
}) => {
  await page.goto("/explore");
  await hydrated(page);
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
  await hydrated(page);
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
  await hydrated(page);
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

/** Today's word, as the API serves it. */
const today = async (page: import("@playwright/test").Page) => {
  const body = await (await page.request.get("/api/daily-word")).json();
  return body.data.entry as { term: string; meaning: string };
};

/**
 * Runs `search` (types into the box) and waits for the URL to carry the query.
 * If it does not, the failure says what the page and the API did meanwhile: the
 * Firefox runs in CI failed here and nothing else showed why.
 */
async function searchReachesUrl(
  page: import("@playwright/test").Page,
  search: () => Promise<void>,
) {
  const seen: string[] = [];
  const t0 = Date.now();
  const at = () => `${Date.now() - t0}ms`;
  page.on("response", (r) => {
    if (r.url().includes("/api/"))
      seen.push(`${at()} ${r.status()} ${new URL(r.url()).pathname}`);
  });
  page.on("console", (m) => {
    if (m.type() !== "log")
      seen.push(`${at()} console.${m.type()}: ${m.text().slice(0, 100)}`);
  });
  page.on("pageerror", (e) =>
    seen.push(`${at()} pageerror: ${e.message.slice(0, 100)}`),
  );

  await search();
  try {
    await expect(page).toHaveURL(/[?&]q=/);
  } catch (error) {
    const box = page.getByTestId("explore-search");
    throw new Error(
      `the search never reached the URL: ${JSON.stringify({
        url: page.url(),
        value: await box.inputValue().catch(() => "?"),
        activeIsBox: await box
          .evaluate((el) => el === document.activeElement)
          .catch(() => "?"),
        recent: seen.slice(-14),
      })}`,
      { cause: error },
    );
  }
}

test("searching finds a word by its meaning", async ({ page }) => {
  // Typed with fill(), in plain Latin letters: every engine delivers those.
  const { term, meaning } = await today(page);
  const query = /[\x20-\x7e]{3,40}/.exec(meaning)![0].trim();

  await page.goto("/explore");
  await hydrated(page);
  await searchReachesUrl(page, () =>
    page.getByTestId("explore-search").fill(query),
  );
  await expect(
    page.getByTestId("explore-word").filter({ hasText: term }).first(),
  ).toBeVisible();
});

test("searching finds a word by its Japanese term", async ({ page }) => {
  // The same with today's Japanese term, typed as a keystroke would deliver it.
  const { term } = await today(page);

  await page.goto("/explore");
  await hydrated(page);
  await searchReachesUrl(page, () =>
    page.getByTestId("explore-search").fill(term),
  );
  await expect(
    page.getByTestId("explore-word").filter({ hasText: term }).first(),
  ).toBeVisible();
});
