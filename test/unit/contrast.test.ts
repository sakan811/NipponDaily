import { describe, it, expect } from "vitest";
import { NEUTRALS, SEASON_IDS, type PaletteRole } from "~~/shared/seasons";
import { resolveVars } from "../helpers/css-tokens";

/**
 * Text on colour aims for WCAG AA (4.5:1). This measures the pairs the UI
 * actually uses, from the stylesheet's own tokens, in every season and mode:
 *
 *  - fill:   `text-on-<role>` on `bg-<role>-500` (buttons, badges)
 *  - text:   `text-<role>-500` on the page canvas
 *  - shaded: `text-<role>-600` on the light canvas, `-400` on the dark one
 *            (the `text-x-600 dark:text-x-400` pairing)
 *
 * Some pairs fall short today. They are listed in SHORTFALLS with the lowest
 * ratio they may have, so a new shortfall fails the test, a worse one fails
 * it, and a pair that has been fixed fails it too until it is taken off the
 * list. Fixing one means changing a palette value, which is a design change.
 * The list is the roadmap's "contrast is a target" limit, made exact.
 */

const AA = 4.5;

type Mode = "light" | "dark";
const MODES: readonly Mode[] = ["light", "dark"];
const FILLED: readonly PaletteRole[] = [
  "primary",
  "secondary",
  "success",
  "error", // there is no --on-warning: warning only backs text as a tint
];
const TEXT_ROLES: readonly PaletteRole[] = [
  "primary",
  "secondary",
  "success",
  "warning",
  "error",
];

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel(n >> 16) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** Two decimals, as the list below records them. */
const round = (n: number) => Number(n.toFixed(2));

function colour(vars: Record<string, string>, name: string): string {
  const value = vars[name]?.toLowerCase();
  if (!value || !/^#[0-9a-f]{6}$/.test(value))
    throw new Error(`${name} is ${value ?? "missing"}, not a #rrggbb colour`);
  return value;
}

interface Pair {
  key: string;
  ratio: number;
}

function pairsOf(season: string, mode: Mode): Pair[] {
  const vars = resolveVars(season, mode);
  const canvas = NEUTRALS[mode][0]!.hex;
  const out: Pair[] = [];
  for (const role of FILLED) {
    out.push({
      key: `${season} ${mode} fill ${role}`,
      ratio: contrast(
        colour(vars, `--on-${role}`),
        colour(vars, `--${role}-500`),
      ),
    });
  }
  const shade = mode === "light" ? 600 : 400;
  for (const role of TEXT_ROLES) {
    out.push({
      key: `${season} ${mode} text ${role}-500`,
      ratio: contrast(colour(vars, `--${role}-500`), canvas),
    });
    out.push({
      key: `${season} ${mode} shaded ${role}-${shade}`,
      ratio: contrast(colour(vars, `--${role}-${shade}`), canvas),
    });
  }
  return out;
}

/** Pairs below AA today, with the lowest ratio each may have. */
const SHORTFALLS: Record<string, number> = {
  "sakura light fill error": 3.59,
  "sakura light text secondary-500": 3.14,
  "sakura light text success-500": 3.18,
  "sakura light text warning-500": 2.66,
  "sakura light shaded warning-600": 3.68,
  "sakura light text error-500": 4.12,
  "sakura dark fill secondary": 4.25,
  "sakura dark text secondary-500": 4.25,
  "summer light fill error": 3.59,
  "summer light text success-500": 3.18,
  "summer light text warning-500": 2.66,
  "summer light shaded warning-600": 3.68,
  "summer light text error-500": 4.12,
  "autumn light fill primary": 4.3,
  "autumn light text primary-500": 3.44,
  "autumn light text secondary-500": 2.61,
  "autumn light shaded secondary-600": 3.83,
  "autumn light text success-500": 2.88,
  "autumn light shaded success-600": 4.1,
  "autumn light text warning-500": 3.31,
  "autumn dark text primary-500": 3.89,
  "autumn dark text error-500": 3.59,
  "winter light fill error": 3.59,
  "winter light text secondary-500": 2.95,
  "winter light shaded secondary-600": 4.31,
  "winter light text success-500": 3.18,
  "winter light text warning-500": 2.66,
  "winter light shaded warning-600": 3.68,
  "winter light text error-500": 4.12,
};

const all = SEASON_IDS.flatMap((id) => MODES.flatMap((m) => pairsOf(id, m)));

describe("text contrast", () => {
  it("measures every season, mode and pair", () => {
    // 4 seasons x 2 modes x (4 fills + 5 roles x 2 text pairs)
    expect(all).toHaveLength(4 * 2 * (FILLED.length + TEXT_ROLES.length * 2));
  });

  it("body text reads at AAA on the canvas", () => {
    expect(
      contrast(NEUTRALS.light[1]!.hex, NEUTRALS.light[0]!.hex),
    ).toBeGreaterThan(7);
    expect(
      contrast(NEUTRALS.dark[1]!.hex, NEUTRALS.dark[0]!.hex),
    ).toBeGreaterThan(7);
  });

  it("no pair is a new shortfall or worse than recorded", () => {
    const bad = all
      .filter((p) => p.ratio < AA)
      .filter(
        (p) => !(p.key in SHORTFALLS) || round(p.ratio) < SHORTFALLS[p.key]!,
      )
      .map((p) => `${p.key}: ${p.ratio.toFixed(2)}`);
    expect(bad).toEqual([]);
  });

  it("every recorded shortfall is still one", () => {
    const byKey = new Map(all.map((p) => [p.key, p.ratio]));
    const fixed = Object.keys(SHORTFALLS).filter(
      (k) => !byKey.has(k) || byKey.get(k)! >= AA,
    );
    expect(fixed, "now AA or gone: remove from SHORTFALLS").toEqual([]);
  });
});
