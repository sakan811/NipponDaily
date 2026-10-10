import { test, expect } from "./fixtures";

/** The header's buttons are in the menu below `md` on a phone; the buttons
 *  themselves stay in the bar, so these tests use them directly. */

test("the colour mode button toggles dark and is remembered", async ({
  page,
}) => {
  await page.goto("/");
  const html = page.locator("html");
  const wasDark = await html.evaluate((el) => el.classList.contains("dark"));

  await page.getByRole("button", { name: "Toggle color mode" }).click();
  await expect(html).toHaveClass(wasDark ? /^((?!dark).)*$/ : /dark/);

  await page.reload();
  await expect(html).toHaveClass(wasDark ? /^((?!dark).)*$/ : /dark/);
});

test("a season pick sets the look, survives a reload, and can be undone", async ({
  page,
}) => {
  await page.goto("/");
  const html = page.locator("html");
  const open = () =>
    page.getByRole("button", { name: "Change season" }).click();

  await open();
  await page.locator('[data-season-option="winter"]').click();
  await expect(html).toHaveAttribute("data-season", "winter");

  await page.reload();
  await expect(html).toHaveAttribute("data-season", "winter");

  await open();
  await page.locator('[data-season-option="summer"]').click();
  await expect(html).toHaveAttribute("data-season", "summer");

  await open();
  await page.locator('[data-season-option="auto"]').click();
  const stored = await page.evaluate(() =>
    localStorage.getItem("season-choice"),
  );
  expect(stored).toBeNull();
});

test("the season menu closes on Escape and on a click outside", async ({
  page,
}) => {
  await page.goto("/");
  const menu = page.getByRole("group", { name: "Season" });
  const trigger = page.getByRole("button", { name: "Change season" });

  await trigger.click();
  await expect(menu).toBeVisible();
  await menu.locator("button").first().focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  await trigger.click();
  await expect(menu).toBeVisible();
  // A bare corner of the page: on a phone the open menu covers the content.
  const { height } = page.viewportSize()!;
  await page.mouse.click(1, height - 1);
  await expect(menu).toBeHidden();
});
