import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { NEUTRALS, SEASON_IDS, type PaletteRole } from "~~/shared/seasons";
import { resolveVars } from "../helpers/css-tokens";

/**
 * Text on colour aims for WCAG AA (4.5:1). This measures the pairs the UI
 * actually uses, from the stylesheet's own tokens, in every season and mode:
 *
 *  - fill:   `text-on-<role>` on `bg-<role>-500` (buttons, badges)
 *  - shaded: `text-<role>-600` on the light canvas, `-400` on the dark one
 *            (the `text-x-600 dark:text-x-400` pairing)
 *  - tinted: the same text on `bg-<role>-500/10`, as soft buttons and badges
 *            draw it (the canvas with a tenth of the fill mixed in)
 *
 * Every pair reaches AA. The 500 step is a fill, not a text colour: it cannot
 * be both light enough for dark text on a button and dark enough for text on
 * the canvas, so the last test fails if a class sets text in it. A solid
 * button does not change its fill on hover for the same reason: the text
 * colour was picked for the 500 step, and the 600 step would fall below AA.
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

function colour(vars: Record<string, string>, name: string): string {
  const value = vars[name]?.toLowerCase();
  if (!value || !/^#[0-9a-f]{6}$/.test(value))
    throw new Error(`${name} is ${value ?? "missing"}, not a #rrggbb colour`);
  return value;
}

/** `fg` at `alpha` laid over `bg`, as the browser composites it. */
function over(fg: string, bg: string, alpha: number): string {
  const [f, b] = [fg, bg].map((h) => parseInt(h.slice(1), 16));
  const mix = (shift: number) =>
    Math.round(
      ((f! >> shift) & 255) * alpha + ((b! >> shift) & 255) * (1 - alpha),
    );
  return `#${((mix(16) << 16) | (mix(8) << 8) | mix(0)).toString(16).padStart(6, "0")}`;
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
      key: `${season} ${mode} shaded ${role}-${shade}`,
      ratio: contrast(colour(vars, `--${role}-${shade}`), canvas),
    });
    out.push({
      key: `${season} ${mode} tinted ${role}-${shade}`,
      ratio: contrast(
        colour(vars, `--${role}-${shade}`),
        over(colour(vars, `--${role}-500`), canvas, 0.1),
      ),
    });
  }
  return out;
}

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

  it("every pair reaches AA", () => {
    const bad = all
      .filter((p) => p.ratio < AA)
      .map((p) => `${p.key}: ${p.ratio.toFixed(2)}`);
    expect(bad).toEqual([]);
  });

  it("no class sets text in a 500 step or darkens a solid fill on hover", () => {
    const root = resolve(__dirname, "../../app");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(vue|ts|css)$/.test(name)) files.push(path);
      }
    };
    walk(root);
    const role = "(?:primary|secondary|success|warning|error)";
    const bad = new RegExp(
      `(?<![\\w-])(?:[\\w-]+:)*text-${role}-500(?![\\w/-])|hover:bg-${role}-[6-9]00(?![\\w/-])`,
    );
    const found = files.filter((f) => bad.test(readFileSync(f, "utf8")));
    expect(found).toEqual([]);
  });
});
