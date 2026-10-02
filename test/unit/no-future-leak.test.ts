import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * A daily word is only revealed on its own day, which the API enforces by
 * refusing future dates. That is moot if the browser bundle already contains
 * every entry — so nothing under app/ may import the module that holds them.
 * Display labels live in shared/word-labels.ts precisely so the client never
 * needs shared/words.ts. The same goes for the modules built on it
 * (shared/parts.ts, shared/sitemap.ts), which read every entry too.
 */

const APP = resolve(import.meta.dirname, "../../app");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(vue|ts)$/.test(name) ? [path] : [];
  });
}

describe("future words never reach the browser bundle", () => {
  const files = sourceFiles(APP);

  it("scans real files", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("would catch an offending import", () => {
    const offending = 'import { WORD_ENTRIES } from "~~/shared/words";';
    const found = [
      ...offending.matchAll(/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g),
    ].map((m) => m[1]!);
    expect(
      found.filter((i) =>
        /(shared\/(?:words|parts|sitemap)|data\/words)(?:["'/.]|$)/.test(i),
      ),
    ).toHaveLength(1);
  });

  it.each(files.map((f) => [f.replace(APP + "/", ""), f] as const))(
    "%s imports none of shared/words, shared/parts, shared/sitemap or data/words",
    (_name, path) => {
      // Only real imports count — the docs pages legitimately *mention*
      // data/words/ in prose.
      const imports = [
        ...readFileSync(path, "utf8").matchAll(
          /(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g,
        ),
      ].map((m) => m[1]!);
      expect(
        imports.filter((i) =>
          /(shared\/(?:words|parts|sitemap)|data\/words)(?:["'/.]|$)/.test(i),
        ),
      ).toEqual([]);
    },
  );
});
