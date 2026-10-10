import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "~~/shared/storage-keys";

/**
 * Facts that live in one module must not be typed again beside it. Each case
 * names the module that owns the fact and fails when the same thing is written
 * out in the code that should read it.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const walk = (dir: string, exts: string[]): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((d) =>
    d.isDirectory()
      ? walk(join(dir, d.name), exts)
      : exts.some((e) => d.name.endsWith(e))
        ? [join(dir, d.name)]
        : [],
  );

/** Source that runs in the app, the server or the build, in the given folders. */
const sources = (dirs: string[], exts = [".ts", ".vue", ".mjs"]) =>
  dirs.flatMap((d) => walk(d, exts));

/** Files (other than `owner`) among `files` whose text matches `pattern`. */
const typedOutside = (files: string[], owner: string[], pattern: RegExp) =>
  files.filter((f) => !owner.includes(f) && pattern.test(read(f)));

describe("one owner per fact", () => {
  const code = [
    ...sources(["app", "server", "shared", "scripts"]),
    "nuxt.config.ts",
  ];

  it("Japan's offset from UTC is written only in shared/jst.ts", () => {
    expect(
      typedOutside(code, ["shared/jst.ts"], /\b9 \* 60 \* 60 \* 1000\b/),
    ).toEqual([]);
  });

  it.each(Object.entries(STORAGE_KEYS))(
    "the localStorage key %s is quoted only in shared/storage-keys.ts",
    (_name, key) => {
      expect(
        typedOutside(
          [...sources(["app"]), "nuxt.config.ts"],
          ["shared/storage-keys.ts"],
          new RegExp(`["']${key}["']`),
        ),
      ).toEqual([]);
    },
  );

  it("the JSON envelope and the 400 are built only in server/utils", () => {
    const handlers = sources(["server/api", "server/routes"], [".ts"]);
    expect(typedOutside(handlers, [], /success:\s*true/)).toEqual([]);
    expect(typedOutside(handlers, [], /Invalid query parameters/)).toEqual([]);
    expect(typedOutside(handlers, [], /statusMessage:\s*"Not Found"/)).toEqual(
      [],
    );
  });

  it("the JLPT levels are listed only in shared/jlpt.ts", () => {
    expect(
      typedOutside(
        [...sources(["app", "server", "scripts"]), "nuxt.config.ts"],
        [],
        /\[\s*"N5",\s*"N4"/i,
      ),
    ).toEqual([]);
  });

  it("the page chrome is written only in AppShell", () => {
    const pages = sources(["app/pages", "app/components"], [".vue"]);
    expect(
      typedOutside(pages, ["app/components/AppShell.vue"], /season-backdrop"/),
    ).toEqual([]);
  });
});
