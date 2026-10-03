import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { syncDocs } from "../../scripts/sync-docs.mjs";
import { API_ENDPOINTS } from "~~/shared/endpoints";
import { DATA_SOURCES, LICENCES } from "~~/shared/sources";
import { monthLabel, rangeMonthsText, rangeText } from "~~/shared/catalogue";

/**
 * Guards the single sources of truth (see docs/architecture.md, "Single
 * sources of truth"): attribution in shared/sources.ts, routes in
 * shared/endpoints.ts, the word range in data/words/. The README and docs are
 * filled from them by `pnpm docs:sync`; the web app reads them directly. This
 * fails when a generated region is stale, a fact is typed by hand somewhere it
 * should come from the source, or a doc names a command or file that is gone.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const MD_FILES = [
  "README.md",
  "TODO.md",
  ...readdirSync(join(ROOT, "docs"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `docs/${f}`),
];
const REGION = /<!-- docs:begin ([\w-]+) -->[\s\S]*?<!-- docs:end \1 -->/g;
const withoutRegions = (text: string) => text.replace(REGION, "");

/** Every file under `dir` with one of the extensions, as repo-relative paths. */
const walk = (dir: string, exts: string[]): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((d) =>
    d.isDirectory()
      ? walk(join(dir, d.name), exts)
      : exts.some((e) => d.name.endsWith(e))
        ? [join(dir, d.name)]
        : [],
  );

const entries = readdirSync(join(ROOT, "data/words"))
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => JSON.parse(read(`data/words/${f}`)) as { date: string }[]);
const dates = entries.map((e) => e.date).sort();
const first = dates[0]!;
const last = dates[dates.length - 1]!;

describe("generated regions (pnpm docs:sync)", () => {
  it("are all current", async () => {
    expect(await syncDocs({ write: false })).toEqual([]);
  });

  it.each([
    ["README.md", ["attribution", "range", "last"]],
    ["docs/architecture.md", ["range-months", "range", "total", "endpoints"]],
    ["docs/content.md", ["attribution"]],
  ])("%s still has its regions", (file, ids) => {
    const found = [...read(file).matchAll(REGION)].map((m) => m[1]);
    for (const id of ids) expect(found, `${file}: ${id}`).toContain(id);
  });

  it("render the real range and count", () => {
    const arch = read("docs/architecture.md");
    expect(arch).toContain(rangeText({ first, last }));
    expect(arch).toContain(rangeMonthsText({ first, last }));
    expect(arch).toContain(`>${entries.length}<`);
  });
});

describe("word range and count", () => {
  it.each([...MD_FILES, "app/pages/docs/features.vue"])(
    "%s states no other range or count",
    (file) => {
      const text = read(file);
      for (const m of text.matchAll(
        /(\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/g,
      )) {
        expect([m[1], m[2]], `${file}: "${m[0]}"`).toEqual([first, last]);
      }
      for (const m of text.matchAll(
        /([A-Z][a-z]+ \d{4}) to ([A-Z][a-z]+ \d{4})/g,
      )) {
        expect([m[1], m[2]], `${file}: "${m[0]}"`).toEqual([
          monthLabel(first),
          monthLabel(last),
        ]);
      }
      for (const m of text.matchAll(/\((\d+) words\)/g)) {
        expect(Number(m[1]), `${file}: "${m[0]}"`).toBe(entries.length);
      }
    },
  );

  it("is not typed into the web app", () => {
    // Pages get it from GET /api/catalogue; a hand-typed total would go stale.
    for (const file of walk("app", [".vue", ".ts"])) {
      expect(read(file), file).not.toMatch(
        new RegExp(`\\b${entries.length}\\b`),
      );
    }
  });
});

describe("endpoints", () => {
  const routes = (dir: string, prefix: string): string[] =>
    readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((d) =>
      d.isDirectory()
        ? routes(join(dir, d.name), `${prefix}${d.name}/`)
        : d.name.endsWith(".get.ts")
          ? [`${prefix}${d.name.replace(/\.get\.ts$/, "")}`]
          : [],
    );
  const routeFiles = [
    ...routes("server/api", "/api/"),
    ...routes("server/routes", "/"),
  ].sort();

  it("shared/endpoints.ts lists exactly the routes the server has", () => {
    expect(API_ENDPOINTS.map((e) => e.path).sort()).toEqual(routeFiles);
  });

  it.each([
    ...MD_FILES,
    "app/pages/docs/architecture.vue",
    "app/pages/docs/error-states.vue",
  ])("%s names only routes that exist", (file) => {
    for (const m of read(file).matchAll(
      /GET (\/api\/[a-z-]+(?:\/[a-z-]+)*)/g,
    )) {
      expect(routeFiles, `${file}: ${m[0]}`).toContain(m[1]);
    }
  });
});

describe("attribution", () => {
  // Every URL a source or licence is known by, and the licence name, may be
  // written only in shared/sources.ts (and the regions generated from it).
  const urls = DATA_SOURCES.flatMap((s) => [
    s.url,
    s.licence.url,
    s.via?.url,
  ]).filter((u): u is string => Boolean(u));
  const bare = (u: string) => u.replace(/\/$/, "");

  it("finds the sources", () => {
    expect(urls.length).toBeGreaterThan(4);
  });

  it.each([...walk("app", [".vue", ".ts"]), ...MD_FILES])(
    "%s does not type a source URL or licence name",
    (file) => {
      const isMd = file.endsWith(".md");
      const text = isMd ? withoutRegions(read(file)) : read(file);
      for (const url of urls) {
        expect(text, `${file}: ${url}`).not.toContain(bare(url));
      }
      if (!isMd) {
        expect(text, `${file}: ${LICENCES.ccBySa4.name}`).not.toContain(
          LICENCES.ccBySa4.name,
        );
      }
    },
  );
});

describe("commands and paths named in the docs", () => {
  const scripts = Object.keys(
    JSON.parse(read("package.json")).scripts as Record<string, string>,
  );
  const PNPM_BUILTINS = new Set([
    "install",
    "add",
    "remove",
    "exec",
    "dlx",
    "run",
    "i",
  ]);

  it.each(MD_FILES)("%s names only pnpm scripts that exist", (file) => {
    for (const m of read(file).matchAll(
      /(?:`|^)pnpm (?:run )?([a-z][\w:-]*)/gm,
    )) {
      if (PNPM_BUILTINS.has(m[1]!)) continue;
      expect(scripts, `${file}: "${m[0]}"`).toContain(m[1]);
    }
  });

  it.each(MD_FILES)("%s names only files and links that exist", (file) => {
    const text = withoutRegions(read(file));
    const missing: string[] = [];

    for (const m of text.matchAll(/`([^`\s]+\/[^`\s]*)`/g)) {
      const token = m[1]!;
      // Placeholders, globs, alternatives and bare URLs are not literal paths.
      if (/[*<>{}|]|YYYY|\.\.\.|^~~|^\/|^https?:/.test(token)) continue;
      if (!/^[\w.@[\]-]+(\/[\w.@[\]-]+)*\/?$/.test(token)) continue;
      // Package, repo and module names are not files: need an extension or a trailing slash.
      if (!token.endsWith("/") && !/\.\w+$/.test(token)) continue;
      const candidates = [
        join(ROOT, token),
        resolve(dirname(join(ROOT, file)), token),
      ];
      if (!candidates.some(existsSync)) missing.push(token);
    }

    for (const m of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
      const link = m[1]!;
      if (/^[a-z]+:/.test(link)) continue;
      if (!existsSync(resolve(dirname(join(ROOT, file)), link)))
        missing.push(link);
    }

    expect(missing, `${file} points at missing paths`).toEqual([]);
  });
});
