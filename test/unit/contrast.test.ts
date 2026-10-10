import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { NEUTRALS, SEASON_IDS, type PaletteRole } from "~~/shared/seasons";
import { css, resolveVars } from "../helpers/css-tokens";

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
 *
 * Colour that is not text is measured too (WCAG 1.4.11, 3:1), where it is the
 * only thing that shows a control or its state: the focus indicator, the
 * search box's border, the pressed state of a chip. The seasonal backdrops are
 * decoration and need no ratio of their own, but they sit under the text, so
 * the text must still reach AA on the canvas with every backdrop tint stacked
 * on it. Borders of cards and dividers are decoration and are not measured.
 */

const AA = 4.5;
const NON_TEXT = 3;

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

// ---------------------------------------------------------------------------
// Colour that is not text
// ---------------------------------------------------------------------------

/** The files under `app/` with their text. */
function appFiles(extensions: RegExp): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (extensions.test(name))
        out.push({ path, text: readFileSync(path, "utf8") });
    }
  };
  walk(resolve(__dirname, "../../app"));
  return out;
}

/** The neutral step a text box's border is drawn in, in both modes. Light 300
 *  and dark 700 (the card border) are 1.7:1 and 1.6:1 against the canvas. */
const FIELD_BORDER_STEP = 500;

/** The search box's fill: `bg-white`, and `bg-stone-900/50` in dark mode. */
function fieldFill(vars: Record<string, string>, mode: Mode, canvas: string) {
  return mode === "light"
    ? "#ffffff"
    : over(colour(vars, "--neutral-900"), canvas, 0.5);
}

function nonTextPairsOf(season: string, mode: Mode): Pair[] {
  const vars = resolveVars(season, mode);
  const canvas = NEUTRALS[mode][0]!.hex;
  const accent = colour(vars, "--primary-500");
  const border = colour(vars, `--neutral-${FIELD_BORDER_STEP}`);
  const fill = fieldFill(vars, mode, canvas);
  const key = (what: string) => `${season} ${mode} ${what}`;
  return [
    // focus-visible:ring-2 focus-visible:ring-primary-500, drawn on the canvas
    { key: key("focus ring on the canvas"), ratio: contrast(accent, canvas) },
    // focus:border-primary-500 on the search box
    { key: key("focus border on the field"), ratio: contrast(accent, fill) },
    { key: key("field border on the canvas"), ratio: contrast(border, canvas) },
    { key: key("field border on its fill"), ratio: contrast(border, fill) },
    // a pressed chip: its border in the accent, on the accent's tint
    {
      key: key("pressed chip border on its tint"),
      ratio: contrast(accent, over(accent, canvas, 0.1)),
    },
  ];
}

const nonText = SEASON_IDS.flatMap((id) =>
  MODES.flatMap((m) => nonTextPairsOf(id, m)),
);

describe("non-text contrast", () => {
  it("measures every season, mode and pair", () => {
    expect(nonText).toHaveLength(4 * 2 * 5);
  });

  it("every focus indicator, field border and pressed state reaches 3:1", () => {
    const bad = nonText
      .filter((p) => p.ratio < NON_TEXT)
      .map((p) => `${p.key}: ${p.ratio.toFixed(2)}`);
    expect(bad).toEqual([]);
  });

  it("the classes that ship are the ones measured", () => {
    const files = appFiles(/\.vue$/);

    // Every focus ring and focus border is the accent's 500 step.
    const rings = files.flatMap(({ path, text }) =>
      [...text.matchAll(/focus(?:-visible)?:(?:ring|border)-([a-z]+-\d+)/g)]
        .map((m) => m[1]!)
        .filter((v) => v !== "primary-500")
        .map((v) => `${path}: ${v}`),
    );
    expect(rings).toEqual([]);

    // A box that hides the browser's outline draws its own ring or border.
    const bare = files.flatMap(({ path, text }) =>
      [...text.matchAll(/class="([^"]*focus:outline-none[^"]*)"/g)]
        .filter(
          (m) =>
            !/focus(?:-visible)?:ring-primary-500/.test(m[1]!) &&
            !/focus:border-primary-500/.test(m[1]!),
        )
        .map(() => path),
    );
    expect(bare).toEqual([]);

    // A text box with a border draws it in the measured step, light and dark.
    const fields = files.flatMap(({ path, text }) =>
      [...text.matchAll(/<input\b[^>]*?class="([^"]*)"/g)]
        .map((m) => m[1]!)
        .filter((c) => /(^|\s)border(\s|$)/.test(c))
        .map((c) => ({ path, c })),
    );
    expect(fields.length).toBeGreaterThan(0);
    const wrong = fields.filter(
      ({ c }) =>
        !new RegExp(`(^|\\s)border-stone-${FIELD_BORDER_STEP}(\\s|$)`).test(
          c,
        ) || /(^|\s)(dark:)?border-stone-(?!500)\d+/.test(c),
    );
    expect(wrong).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Text over the seasonal backdrops
// ---------------------------------------------------------------------------

interface Tint {
  colour: string;
  alpha: number;
}

/** The gradient calls in a rule's text, each with its parentheses matched. */
function gradientsOf(body: string): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(
    /(?:repeating-)?(?:linear|radial)-gradient\(/g,
  )) {
    let depth = 0;
    for (let i = m.index! + m[0].length - 1; i < body.length; i++) {
      if (body[i] === "(") depth++;
      if (body[i] === ")" && --depth === 0) {
        out.push(body.slice(m.index!, i + 1));
        break;
      }
    }
  }
  return out;
}

/** Whether a gradient is a wash that can lie under a line of text: it fades
 *  over a share of the screen (`transparent 34%`). The hairlines and dots are
 *  a pixel or two wide, stops in `px` only, and cover next to none of the
 *  ground behind a letter, so they are not measured. */
function isWash(gradient: string): boolean {
  const stops = gradient.replace(
    /color-mix\(in srgb, var\(--[\w-]+\) \d+%, transparent\)/g,
    "mix",
  );
  return /\d%/.test(stops);
}

/** The colours in a piece of CSS with the strength each is drawn at. */
function coloursIn(
  text: string,
  vars: Record<string, string>,
  opacity: number,
): Tint[] {
  const tints: Tint[] = [];
  const add = (hex: string, alpha: number) =>
    tints.push({ colour: hex, alpha: alpha * opacity });
  for (const m of text.matchAll(/#([0-9a-f]{6})([0-9a-f]{2})\b/gi))
    add(`#${m[1]}`.toLowerCase(), parseInt(m[2]!, 16) / 255);
  for (const m of text.matchAll(
    /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*[,/]\s*([\d.]+)\s*\)/g,
  )) {
    const hex = [m[1], m[2], m[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("");
    add(`#${hex}`, Number(m[4]));
  }
  for (const m of text.matchAll(
    /color-mix\(in srgb,\s*var\((--[\w-]+)\)\s*(\d+)%/g,
  ))
    add(colour(vars, m[1]!), Number(m[2]) / 100);
  for (const m of text.matchAll(/background-color:\s*var\((--[\w-]+)\)/g))
    add(colour(vars, m[1]!), 1);
  return tints;
}

/** What a `.season-backdrop` rule draws: the washes, which are measured, and
 *  the hairlines and dots, which only have to be found. */
function backdropOf(body: string, vars: Record<string, string>) {
  const opacity = Number(/(?:^|[\s;])opacity:\s*([\d.]+)/.exec(body)?.[1] ?? 1);
  const gradients = gradientsOf(body);
  const rest = gradients.reduce((text, g) => text.replace(g, ""), body);
  const washes = [
    ...gradients.filter(isWash).flatMap((g) => coloursIn(g, vars, opacity)),
    ...coloursIn(rest, vars, opacity),
  ];
  const marks = gradients.filter((g) => !isWash(g));
  return { washes, marks: marks.flatMap((g) => coloursIn(g, vars, opacity)) };
}

/** The `.season-backdrop` rules by selector, as the stylesheet writes them. */
const backdropRules = new Map<string, string>(
  [
    ...css.matchAll(
      /\n((?:\[data-season="\w+"\](?:\.dark)? )?\.season-backdrop) \{([^}]*)\}/g,
    ),
  ].map((m) => [m[1]!, m[2]!]),
);

/** The rule that applies: a season's dark rule in dark mode, else the
 *  season's own, else the default grid. */
function backdropRule(season: string, mode: Mode): string {
  const own = backdropRules.get(`[data-season="${season}"] .season-backdrop`);
  const dark = backdropRules.get(
    `[data-season="${season}"].dark .season-backdrop`,
  );
  return (
    (mode === "dark" ? dark : undefined) ??
    own ??
    backdropRules.get(".season-backdrop")!
  );
}

describe("text over the seasonal backdrops", () => {
  const cases = SEASON_IDS.flatMap((season) =>
    MODES.map((mode) => ({ season, mode })),
  );

  it("finds what every season and mode draws", () => {
    for (const { season, mode } of cases) {
      const { washes, marks } = backdropOf(
        backdropRule(season, mode),
        resolveVars(season, mode),
      );
      expect(washes.length + marks.length, `${season} ${mode}`).toBeGreaterThan(
        0,
      );
    }
  });

  it("body and shaded text reach AA under each wash on the canvas", () => {
    const bad: string[] = [];
    for (const { season, mode } of cases) {
      const vars = resolveVars(season, mode);
      const canvas = NEUTRALS[mode][0]!.hex;
      const shade = mode === "light" ? 600 : 400;
      const texts: [string, string][] = [
        ["body", NEUTRALS[mode][1]!.hex],
        ...TEXT_ROLES.map((r): [string, string] => [
          `${r}-${shade}`,
          colour(vars, `--${r}-${shade}`),
        ]),
      ];
      for (const t of backdropOf(backdropRule(season, mode), vars).washes) {
        const under = over(t.colour, canvas, t.alpha);
        for (const [name, hex] of texts) {
          const ratio = contrast(hex, under);
          if (ratio < AA)
            bad.push(
              `${season} ${mode} ${name} under ${t.colour} at ${t.alpha.toFixed(3)}: ${ratio.toFixed(2)}`,
            );
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
