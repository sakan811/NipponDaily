import { test, expect } from "./fixtures";

test("the calendar moves between months and opens a day", async ({ page }) => {
  await page.goto("/words");
  const month = page.getByTestId("calendar-month");
  const first = (await month.textContent())!.trim();

  const prev = page.getByTestId("calendar-prev");
  if (await prev.isEnabled()) {
    await prev.click();
    await expect(month).not.toHaveText(first);
    await page.getByTestId("calendar-next").click();
    await expect(month).toHaveText(first);
  }

  await page.getByTestId("calendar-day-open").first().click();
  await expect(page).toHaveURL(/\/words\/\d{4}-\d{2}-\d{2}$/);
});

test("a kanji page draws one frame per stroke", async ({ page, request }) => {
  const { data } = await (await request.get("/api/kanji")).json();
  const chars: string[] = data.kanji.map((k: { char: string }) => k.char);
  let drawn: { char: string; strokes: number } | null = null;
  for (const char of chars) {
    const res = await request.get(
      `/api/kanji-detail?char=${encodeURIComponent(char)}`,
    );
    const detail = (await res.json()).data;
    if (detail.strokes?.length) {
      drawn = { char, strokes: detail.strokes.length };
      break;
    }
  }
  expect(drawn, "a kanji with stroke order").not.toBeNull();

  await page.goto(`/kanji/${encodeURIComponent(drawn!.char)}`);
  await expect(page.getByTestId("kanji-char")).toContainText(drawn!.char);
  await expect(page.getByTestId("kanji-stroke")).toHaveCount(drawn!.strokes);
  await expect(
    page.getByTestId("kanji-stroke").last().getByRole("img"),
  ).toHaveAccessibleName(`Stroke ${drawn!.strokes} of ${drawn!.strokes}`);
});

test("the kanji index links to a kanji page", async ({ page }) => {
  await page.goto("/kanji");
  await page.getByTestId("kanji-link").first().click();
  await expect(page).toHaveURL(/\/kanji\/.+/);
  await expect(page.getByTestId("kanji-detail")).toBeVisible();
});
