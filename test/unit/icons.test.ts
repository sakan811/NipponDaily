import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { ICON_PATHS } from "~/app/data/icons";

/** Every `i-<set>-<name>` icon referenced anywhere under app/ must exist in
 *  the local icon map — otherwise UIcon silently renders a generic ⊕. */
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const appDir = resolve(import.meta.dirname, "../../app");
const referenced = new Set(
  walk(appDir)
    .filter((f) => /\.(vue|ts)$/.test(f) && !f.endsWith("icons.ts"))
    .flatMap((f) =>
      [
        ...readFileSync(f, "utf8").matchAll(/["'`]i-[a-z]+-([a-z0-9-]+)["'`]/g),
      ].map((m) => m[1]!),
    ),
);

describe("UIcon coverage", () => {
  it("finds icon references to check", () => {
    expect(referenced.size).toBeGreaterThan(10);
  });

  it.each([...referenced].sort())("defines %s", (name) => {
    expect(ICON_PATHS).toHaveProperty(name);
  });
});
