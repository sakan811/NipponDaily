import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "~~/shared/storage-keys";
import { read, walk } from "../helpers/repo";

/**
 * Facts that live in one module must not be typed again beside it. Each case
 * names the module that owns the fact and fails when the same thing is written
 * out in the code that should read it.
 */

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

  it("the stroke square is written only in shared/limits.ts", () => {
    expect(
      typedOutside(
        [...sources(["app", "server", "shared", "scripts"]), "nuxt.config.ts"],
        ["shared/limits.ts"],
        /\b109\b/,
      ),
    ).toEqual([]);
  });

  it("the music's crossfade and loudness are written only in shared/audio.ts", () => {
    expect(
      typedOutside(
        sources(["app", "server", "shared"]),
        ["shared/audio.ts"],
        /CROSSFADE_MS\s*=|-16 LUFS/,
      ),
    ).toEqual([]);
  });

  it("route paths are quoted only in shared/routes.ts", () => {
    // The composables, the limiter, the cache rule and robots.txt read ROUTES.
    // Comments may name a route; only code that quotes one is a second copy.
    const quoted =
      /["'`]\/(?:api\/[a-z-]*|og\.png|sitemap\.xml|robots\.txt)["'`?]/;
    const inCode = (f: string) =>
      read(f)
        .split("\n")
        .some(
          (line) => !/^\s*(?:\*|\/\/|\/\*)/.test(line) && quoted.test(line),
        );
    expect(
      [
        ...sources(["app", "server", "shared"], [".ts", ".vue"]),
        "nuxt.config.ts",
      ].filter(
        (f) =>
          !["shared/routes.ts", "shared/endpoints.ts"].includes(f) && inCode(f),
      ),
    ).toEqual([]);
  });

  it("the JSON envelope and the 400 are built only in server/utils", () => {
    const handlers = sources(["server/api", "server/routes"], [".ts"]);
    expect(typedOutside(handlers, [], /success:\s*true/)).toEqual([]);
    expect(typedOutside(handlers, [], /Invalid query parameters/)).toEqual([]);
    expect(typedOutside(handlers, [], /statusMessage:\s*"Not Found"/)).toEqual(
      [],
    );
  });

  it("the kanji range and the katakana fold are written only in shared/japanese.ts", () => {
    const files = [
      ...sources(["app", "server", "shared", "scripts"]),
      "nuxt.config.ts",
    ];
    expect(
      typedOutside(files, ["shared/japanese.ts"], /㐀-䶿|u4e00-\\u9fff/i),
    ).toEqual([]);
    expect(
      typedOutside(files, ["shared/japanese.ts"], /charCodeAt\(0\) - 0x60/),
    ).toEqual([]);
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
