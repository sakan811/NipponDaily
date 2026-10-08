import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** The site's stylesheet, read once for the tests that check it. */
export const css = readFileSync(
  resolve(__dirname, "../../app/assets/css/tailwind.css"),
  "utf8",
);

/** Custom properties declared in every top-level block for `selector`
 *  (a selector can appear more than once, e.g. palette + shape tokens). */
export function blockVars(selector: string): Record<string, string> {
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

/** The custom properties in force on <html> for a season and mode. */
export function resolveVars(season: string, mode: "light" | "dark") {
  // Same order the cascade applies them in on <html>.
  const layers = [":root", `[data-season="${season}"]`];
  if (mode === "dark") layers.splice(1, 0, ".dark"); // .dark precedes seasons
  if (mode === "dark") layers.push(`[data-season="${season}"].dark`);
  return Object.assign({}, ...layers.map(blockVars));
}
