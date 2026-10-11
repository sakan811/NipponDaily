import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

/**
 * The seasonal ambient graphic (`SeasonalEffects.vue` and its CSS) in a real
 * browser. The unit tests read the stylesheet's text; only a browser can say
 * which rule wins, which glyph is drawn and whether an animation is running.
 *
 * The season and colour mode are set on <html> directly, the way the app's
 * own script does, so one page load can walk every look. The pick itself, from
 * the header's menu, is covered in preferences.spec.ts.
 */

type Look = {
  season: "sakura" | "summer" | "autumn" | "winter";
  dark: boolean;
  /** The animation each particle runs. */
  motion: string;
  /** What the particle draws through `::before` ("none"/"normal" when nothing). */
  glyph: string | null;
  /** Whether the large corner glyph is shown. */
  corner: boolean;
};

const LOOKS: Look[] = [
  {
    season: "sakura",
    dark: false,
    motion: "seasonal-fall",
    glyph: "🌸",
    corner: false,
  },
  {
    season: "sakura",
    dark: true,
    motion: "seasonal-fall",
    glyph: "🌸",
    corner: false,
  },
  {
    season: "summer",
    dark: false,
    motion: "seasonal-rise",
    glyph: null,
    corner: true,
  },
  {
    season: "summer",
    dark: true,
    motion: "seasonal-rise",
    glyph: "",
    corner: true,
  },
  {
    season: "autumn",
    dark: false,
    motion: "seasonal-fall",
    glyph: "🍁",
    corner: true,
  },
  {
    season: "autumn",
    dark: true,
    motion: "seasonal-fall",
    glyph: "🌾",
    corner: true,
  },
  {
    season: "winter",
    dark: false,
    motion: "seasonal-fall",
    glyph: null,
    corner: false,
  },
  {
    season: "winter",
    dark: true,
    motion: "seasonal-fall",
    glyph: null,
    corner: false,
  },
];

const PARTICLES = 18;

const look = (page: Page, { season, dark }: Pick<Look, "season" | "dark">) =>
  page.evaluate(
    ([s, d]: [string, boolean]) => {
      const html = document.documentElement;
      html.setAttribute("data-season", s);
      html.classList.toggle("dark", d);
    },
    [season, dark] as [string, boolean],
  );

/** What the browser computes for the particles and the corner glyph. */
const measure = (page: Page) =>
  page.evaluate(() => {
    const particles = [...document.querySelectorAll(".seasonal-particle")];
    const first = particles[0] as HTMLElement;
    const corner = document.querySelector(".seasonal-corner-glyph")!;
    const content = getComputedStyle(first, "::before").content;
    return {
      count: particles.length,
      display: getComputedStyle(first).display,
      animation: getComputedStyle(first).animationName,
      // `"🌸"` with its quotes, or `none`/`normal` when nothing is drawn.
      glyph: /^"(.*)"$/s.exec(content)?.[1] ?? null,
      cornerShown: getComputedStyle(corner).display !== "none",
      running: first
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => (a as CSSAnimation).animationName),
    };
  });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".seasonal-effects")).toBeAttached();
});

test("every season draws its own particles, glyph and motion, light and dark", async ({
  page,
}) => {
  for (const l of LOOKS) {
    await look(page, l);
    const got = await measure(page);
    const name = `${l.season} ${l.dark ? "dark" : "light"}`;

    expect(got.count, name).toBe(PARTICLES);
    expect(got.display, name).toBe("block");
    expect(got.animation, name).toBe(l.motion);
    expect(got.running, name).toContain(l.motion);
    expect(got.cornerShown, `${name} corner glyph`).toBe(l.corner);
    if (l.glyph !== null) expect(got.glyph, `${name} glyph`).toBe(l.glyph);
    else expect(got.glyph, `${name} glyph`).toBeNull();
  }
});

test("a summer night lights fireflies that blink", async ({ page }) => {
  await look(page, { season: "summer", dark: true });
  const blinking = await page.evaluate(() =>
    document
      .querySelector(".seasonal-particle")!
      .getAnimations({ subtree: true })
      .some((a) => (a as CSSAnimation).animationName === "seasonal-blink"),
  );
  expect(blinking).toBe(true);
});

test("the particles are moving, not painted still", async ({ page }) => {
  await look(page, { season: "sakura", dark: false });
  const moved = await page.evaluate(async () => {
    const p = document.querySelector(".seasonal-particle") as HTMLElement;
    const at = () => Number(p.getAnimations()[0]!.currentTime);
    const before = at();
    await new Promise((r) => setTimeout(r, 300));
    return at() - before;
  });
  expect(moved).toBeGreaterThan(100);
});

test("the graphic is hidden from assistive tech and never takes a click", async ({
  page,
}) => {
  const effects = page.locator(".seasonal-effects");
  await expect(effects).toHaveAttribute("aria-hidden", "true");
  await expect(effects).toHaveCSS("pointer-events", "none");
});

test("it is switched off for readers who ask for less motion", async ({
  page,
}) => {
  await look(page, { season: "autumn", dark: false });
  await expect(page.locator(".seasonal-effects")).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".seasonal-effects")).toBeHidden();
  const running = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running")
      .map((a) => (a as CSSAnimation).animationName)
      .filter((n) => n.startsWith("seasonal-")),
  );
  expect(running).toEqual([]);
});
