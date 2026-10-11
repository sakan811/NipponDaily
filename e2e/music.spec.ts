import type { Page, Route } from "@playwright/test";
import { test, expect } from "./fixtures";

/**
 * The seasonal music, in a real browser. Nothing here listens for sound: a
 * headless browser has no speakers, and what matters is what the app asks
 * for. The switch, the track it fetches for the season (and the next one when
 * the season changes mid-play), the volume and what is remembered.
 */

const track = (season: string) => `/audio/${season}-bgm.mp3`;

/** Fix the season before the page loads, so the track expected is known. */
const inSeason = async (page: Page, season: string) =>
  page.addInitScript(
    (s: string) => localStorage.setItem("season-choice", s),
    season,
  );

/**
 * A one-second tone as a WAV file. The tracks are served as this instead of
 * the real MP3s: every browser decodes it, whatever codecs its headless build
 * ships, and the test stays about what the app asks for, not about decoding.
 */
const TONE = (() => {
  const rate = 22050;
  const samples = rate;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + samples * 2, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16); // PCM header size
  wav.writeUInt16LE(1, 20); // PCM
  wav.writeUInt16LE(1, 22); // mono
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    wav.writeInt16LE(
      Math.round(Math.sin((2 * Math.PI * 220 * i) / rate) * 0.2 * 32767),
      44 + i * 2,
    );
  return wav;
})();

/** Serves the tone for every track, and returns the paths asked for so far. */
const watchTracks = async (page: Page) => {
  const asked: string[] = [];
  await page.route("**/audio/*.mp3", (route: Route) => {
    asked.push(new URL(route.request().url()).pathname);
    return route.fulfill({ contentType: "audio/wav", body: TONE });
  });
  return asked;
};

const openMenu = async (page: Page) => {
  await page.locator(".bgm-button-trigger").click();
  const toggle = page.locator("[data-bgm-toggle]");
  await expect(toggle).toBeVisible();
  return toggle;
};

test("music never starts on its own", async ({ page }) => {
  await inSeason(page, "winter");
  const asked = await watchTracks(page);

  await page.goto("/");
  await expect(page.locator(".bgm-button-trigger")).toBeVisible();
  const toggle = await openMenu(page);
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  // Give a stray autoplay a moment to show itself.
  await page.waitForLoadState("networkidle");
  expect(asked).toEqual([]);
});

test("the switch turns the music on and off and asks for the season's track", async ({
  page,
}) => {
  await inSeason(page, "winter");
  const asked = await watchTracks(page);
  await page.goto("/");

  const toggle = await openMenu(page);
  await expect(toggle).toHaveRole("switch");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect.poll(() => asked).toContain(track("winter"));
  expect(asked).not.toContain(track("summer"));

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
});

test("changing season while it plays brings in that season's track", async ({
  page,
}) => {
  await inSeason(page, "winter");
  const asked = await watchTracks(page);
  await page.goto("/");

  await (await openMenu(page)).click();
  await expect.poll(() => asked).toContain(track("winter"));

  await page.getByRole("button", { name: "Change season" }).click();
  await page.locator('[data-season-option="summer"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-season", "summer");
  await expect.poll(() => asked).toContain(track("summer"));
});

test("the volume is kept in this browser and comes back", async ({ page }) => {
  await inSeason(page, "sakura");
  await page.goto("/");
  await openMenu(page);

  const slider = page.locator("[data-bgm-volume]");
  await expect(slider).toHaveAttribute("aria-valuetext", "50%");

  await slider.fill("30");
  await expect(slider).toHaveAttribute("aria-valuetext", "30%");
  expect(await page.evaluate(() => localStorage.getItem("bgm-volume"))).toBe(
    "30",
  );

  await page.reload();
  await openMenu(page);
  await expect(page.locator("[data-bgm-volume]")).toHaveValue("30");
  await expect(page.locator("[data-bgm-toggle]")).toHaveAttribute(
    "aria-checked",
    "false",
  );
});

test("the music menu closes on Escape", async ({ page }) => {
  await inSeason(page, "autumn");
  await page.goto("/");
  const toggle = await openMenu(page);

  await toggle.focus();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeHidden();
});
