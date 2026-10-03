import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { syncDocs } from "../../scripts/sync-docs.mjs";
import { API_ENDPOINTS } from "~~/shared/endpoints";
import { DATA_SOURCES, LICENCES } from "~~/shared/sources";
import { monthLabel } from "~~/shared/catalogue";
import { DOC_CHAPTERS, DOC_PARTS, DOC_PATHS } from "~~/shared/docs";
import { sitemapPaths } from "~~/shared/sitemap";

/**
 * Guards the single sources of truth (the Architecture chapter, "Single
 * sources of truth"): attribution in shared/sources.ts, routes in
 * shared/endpoints.ts, the word range in data/words/, the chapters in
 * shared/docs.ts. The docs are the pages under app/pages/docs/, which read
 * them directly; `pnpm docs:sync` fills the README's attribution. This fails
 * when that region is stale, a fact is typed by hand somewhere it should come
 * from the source, a chapter has no page (or the reverse), or a doc names a
 * command or file that is gone.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const MD_FILES = ["README.md"];
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

/** The book: every page under app/pages/docs/. */
const DOC_PAGES = walk("app/pages/docs", [".vue"]);
/** Markdown and the docs pages: everything that documents the project. */
const DOC_FILES = [...MD_FILES, ...DOC_PAGES];

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

  it("README still has its attribution region", () => {
    const found = [...read("README.md").matchAll(REGION)].map((m) => m[1]);
    expect(found).toContain("attribution");
  });

  it("no stale docs/ folder or TODO.md is left to drift", () => {
    expect(existsSync(join(ROOT, "docs"))).toBe(false);
    expect(existsSync(join(ROOT, "TODO.md"))).toBe(false);
  });
});

describe("the book", () => {
  const pages = DOC_PAGES.map((f) => f.replace(/^.*\/|\.vue$/g, "")).sort();

  it("has a page for every chapter and a chapter for every page", () => {
    expect(DOC_CHAPTERS.map((c) => c.slug).sort()).toEqual(
      pages.filter((p) => p !== "index"),
    );
    expect(pages).toContain("index");
  });

  it("lists each slug once and gives every chapter a title and summary", () => {
    const slugs = DOC_CHAPTERS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of DOC_CHAPTERS) {
      expect(c.title, c.slug).not.toBe("");
      expect(c.summary, c.slug).not.toBe("");
      expect(DOC_PARTS, c.slug).toContain(c.part);
    }
  });

  it.each(DOC_CHAPTERS.map((c) => c.slug))(
    "%s is set as a book page for its own slug",
    (slug) => {
      expect(read(`app/pages/docs/${slug}.vue`)).toContain(
        `<DocsBook slug="${slug}">`,
      );
    },
  );

  it("the sitemap lists every chapter and the contents", () => {
    for (const path of DOC_PATHS)
      expect(sitemapPaths("2026-01-01")).toContain(path);
  });
});

describe("word range and count", () => {
  it.each([...DOC_FILES])("%s states no other range or count", (file) => {
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
  });

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

  it.each(DOC_FILES)("%s names only routes that exist", (file) => {
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

  /** Text a reader sees as code: backticks and <code> in docs pages. */
  const codeSpans = (file: string, text: string): string[] => {
    if (file.endsWith(".md")) {
      return [...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]!);
    }
    return [
      ...[...text.matchAll(/<code[^>]*>([\s\S]*?)<\/code>/g)].map((m) => m[1]!),
      ...[...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]!),
      // Table cells in the pages' script blocks: { cmd: "pnpm data:words", … }.
      ...[...text.matchAll(/cmd: "([^"]+)"/g)].map((m) => m[1]!),
    ];
  };

  it.each(DOC_FILES)("%s names only pnpm scripts that exist", (file) => {
    for (const span of codeSpans(file, read(file))) {
      for (const m of span.matchAll(/(?:^|\s)pnpm (?:run )?([a-z][\w:-]*)/g)) {
        if (PNPM_BUILTINS.has(m[1]!)) continue;
        expect(scripts, `${file}: "${span}"`).toContain(m[1]);
      }
    }
  });

  it.each(DOC_FILES)("%s names only files and links that exist", (file) => {
    const text = file.endsWith(".md") ? withoutRegions(read(file)) : read(file);
    const missing: string[] = [];

    for (const raw of codeSpans(file, text)) {
      // <code> may hold entities and nested markup; only plain tokens are paths.
      const token = raw.replace(/&lt;|&gt;/g, "<").trim();
      if (token.includes(" ")) continue;
      // Placeholders, globs, alternatives and bare URLs are not literal paths.
      if (/[*<>{}|]|YYYY|\.\.\.|^~~|^\/|^https?:/.test(token)) continue;
      if (!/^[\w.@[\]-]+(\/[\w.@[\]-]+)*\/?$/.test(token)) continue;
      if (!token.includes("/")) continue;
      // Package, repo and module names are not files: need an extension or a trailing slash.
      if (!token.endsWith("/") && !/\.\w+$/.test(token)) continue;
      const candidates = [
        join(ROOT, token),
        resolve(dirname(join(ROOT, file)), token),
      ];
      if (!candidates.some(existsSync)) missing.push(token);
    }

    if (file.endsWith(".md")) {
      for (const m of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
        const link = m[1]!;
        if (/^[a-z]+:/.test(link)) continue;
        if (!existsSync(resolve(dirname(join(ROOT, file)), link)))
          missing.push(link);
      }
    }

    expect(missing, `${file} points at missing paths`).toEqual([]);
  });

  it("every in-book link points at a real chapter", () => {
    for (const file of DOC_PAGES) {
      for (const m of read(file).matchAll(/to="(\/docs[^"#]*)(?:#[^"]*)?"/g)) {
        expect(DOC_PATHS, `${file}: ${m[1]}`).toContain(m[1]);
      }
    }
  });
});
