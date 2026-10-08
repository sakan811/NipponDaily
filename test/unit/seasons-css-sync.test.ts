import { describe, it, expect } from "vitest";
import {
  NEUTRALS,
  PALETTE_ROLES,
  SEASON_IDS,
  SEASONS,
} from "~~/shared/seasons";
import { blockVars, css, resolveVars } from "../helpers/css-tokens";

/**
 * shared/seasons.ts mirrors the 500 value of every palette family per
 * season/mode (it feeds the docs page and the season button). This resolves the
 * real cascade in tailwind.css and fails if the two ever drift apart.
 */
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
