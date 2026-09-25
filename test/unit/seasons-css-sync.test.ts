import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  NEUTRALS,
  PALETTE_ROLES,
  SEASON_IDS,
  SEASONS,
} from "~~/shared/seasons";

/**
 * shared/seasons.ts mirrors the 500 value of every palette family per
 * season/mode (it feeds the docs page and the MCP tools). This resolves the
 * real cascade in tailwind.css and fails if the two ever drift apart.
 */
const css = readFileSync(
  resolve(__dirname, "../../app/assets/css/tailwind.css"),
  "utf8",
);

/** Custom properties declared in every top-level block for `selector`
 *  (a selector can appear more than once, e.g. palette + shape tokens). */
function blockVars(selector: string): Record<string, string> {
  const vars: Record<string, string> = {};
  let from = 0;
  for (;;) {
    const start = css.indexOf(`\n${selector} {`, from);
    if (start === -1) return vars;
    const end = css.indexOf("\n}", start);
    for (const m of css.slice(start, end).matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
      vars[m[1]!] = m[2]!.trim();
    }
    from = end;
  }
}

function resolveVars(season: string, mode: "light" | "dark") {
  // Same order the cascade applies them in on <html>.
  const layers = [":root", `[data-season="${season}"]`];
  if (mode === "dark") layers.splice(1, 0, ".dark"); // .dark precedes seasons
  if (mode === "dark") layers.push(`[data-season="${season}"].dark`);
  return Object.assign({}, ...layers.map(blockVars));
}

describe("shared/seasons.ts ↔ tailwind.css", () => {
  for (const id of SEASON_IDS) {
    for (const mode of ["light", "dark"] as const) {
      it(`${id} (${mode}) swatches match the CSS`, () => {
        const vars = resolveVars(id, mode);
        for (const role of PALETTE_ROLES) {
          expect(vars[`--${role}-500`]?.toLowerCase(), `${role}-500`).toBe(
            SEASONS[id].palette[mode][role].hex,
          );
        }
      });
    }
  }

  it("neutral canvas swatches exist in the CSS", () => {
    for (const { hex } of [...NEUTRALS.light, ...NEUTRALS.dark]) {
      expect(css.toLowerCase()).toContain(hex);
    }
  });

  it("every season defines corner-shape silhouettes", () => {
    const start = css.indexOf("@supports (corner-shape: bevel) {");
    expect(start).toBeGreaterThan(-1);
    const block = css.slice(start, css.indexOf("\n}", start));
    // Cards and panels get a real silhouette in every season; buttons in
    // spring (pills) and summer (droplets) intentionally stay round.
    for (const selector of [
      ":root",
      ...SEASON_IDS.filter((s) => s !== "sakura").map(
        (s) => `[data-season="${s}"]`,
      ),
    ]) {
      const at = block.indexOf(`  ${selector} {`);
      expect(at, selector).toBeGreaterThan(-1);
      const body = block.slice(at, block.indexOf("  }", at));
      for (const role of ["card", "panel"]) {
        expect(body, `${selector} --corner-${role}`).toContain(
          `--corner-${role}:`,
        );
      }
    }
  });

  it("every season has a shape-token block", () => {
    for (const id of SEASON_IDS.filter((s) => s !== "sakura")) {
      expect(blockVars(`[data-season="${id}"]`)).toHaveProperty("--shape-card");
    }
    // sakura is the :root default
    expect(blockVars(":root")).toHaveProperty("--shape-card");
  });
});
