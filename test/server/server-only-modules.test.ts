import { describe, expect, it } from "vitest";
import { SERVER_ONLY_MODULES } from "~~/shared/server-only";
import { read, walk } from "../helpers/repo";

/**
 * The import rule lists the `shared/` modules `app/` may not import because
 * they read the entries. A new module that reads them, directly or through
 * another, would ship every upcoming word to the browser until someone listed
 * it, so the list is derived here from the imports and compared.
 */

const SHARED = walk("shared", [".ts"]).map((f) => f.replace(/^shared\//, ""));
const nameOf = (file: string) => file.replace(/\.ts$/, "");

/** What a module imports: other `shared/` modules, and whether it reaches data. */
function importsOf(file: string): { shared: string[]; data: boolean } {
  const text = read(`shared/${file}`);
  const specifiers = [
    ...text.matchAll(/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g),
  ].map((m) => m[1]!);
  const shared = specifiers.flatMap((s) => {
    const m = /^(?:\.\/|~~\/shared\/)([\w-]+)$/.exec(s);
    return m ? [m[1]!] : [];
  });
  const data =
    specifiers.some((s) => /(^|\/)data\//.test(s)) ||
    /import\.meta\.glob/.test(text);
  return { shared, data };
}

describe("the server-only modules", () => {
  const graph = new Map(SHARED.map((f) => [nameOf(f), importsOf(f)]));

  const reachesData = (name: string, seen = new Set<string>()): boolean => {
    if (seen.has(name)) return false;
    seen.add(name);
    const node = graph.get(name);
    return (
      !!node && (node.data || node.shared.some((dep) => reachesData(dep, seen)))
    );
  };

  it("are exactly the shared modules that reach the entries or other data", () => {
    const derived = [...graph.keys()].filter((n) => reachesData(n)).sort();
    expect(derived).toEqual([...SERVER_ONLY_MODULES].sort());
  });

  it("each exist as a module", () => {
    for (const name of SERVER_ONLY_MODULES)
      expect(graph.has(name), name).toBe(true);
  });
});
