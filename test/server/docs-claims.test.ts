import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BGM_LOUDNESS_LUFS } from "~~/shared/audio";
import { OG_HEIGHT, OG_WIDTH } from "~~/shared/og-card";
import { API_ENDPOINTS } from "~~/shared/endpoints";
import { countWord } from "~~/shared/count";
import { nodeRangeText, stackOf } from "~~/shared/stack";
import { ROOT, read } from "../helpers/repo";

/**
 * Guards the claims in the docs that a figure outside them can contradict:
 * a version range, a loudness, a count over the data, a link to a chapter that
 * no longer holds what the link promises. `docs-sync.test.ts` guards names and
 * paths; this guards the numbers and the sentences built on them. When one
 * fails, fix the docs (or the code, if the code is what changed) and keep the
 * two in step; do not loosen the check.
 */

const DOCS_DIR = "app/pages/docs";
const DOC_PAGES = readdirSync(join(ROOT, DOCS_DIR))
  .filter((f) => f.endsWith(".vue"))
  .map((f) => `${DOCS_DIR}/${f}`);
const DOC_FILES = ["README.md", ...DOC_PAGES];

/** A file's prose: markup and line breaks removed, each `{{ }}` held by a § and each block end by a ¶. */
const prose = (text: string) =>
  text
    .replace(/<!-- docs:begin [\s\S]*?docs:end [\w-]+ -->/g, "")
    .replace(/\{\{[\s\S]*?\}\}/g, " § ")
    .replace(/<\/(?:p|li|td|th|dt|dd|h\d|aside|span|div|section)>/g, " ¶ ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

describe("the Node range", () => {
  // package.json owns it; the docs and the README read it from there.
  it("package.json states the range Nuxt supports", () => {
    const nuxt = JSON.parse(read("node_modules/nuxt/package.json")).engines
      .node as string;
    const ours = JSON.parse(read("package.json")).engines?.node as string;
    expect(nodeRangeText(ours)).toBe(nodeRangeText(nuxt));
  });
});

describe("stack versions the docs name", () => {
  const pkg = JSON.parse(read("package.json"));
  it("are read from package.json, not typed", () => {
    // "Nuxt 4", "Vue 3": a chapter says Nuxt {{ n }}, never a digit.
    const typed: string[] = [];
    for (const file of DOC_FILES)
      for (const m of prose(read(file)).matchAll(
        /\b(Nuxt|Vue|Tailwind CSS) (\d+)\b/g,
      ))
        typed.push(`${file}: ${m[0]}`);
    expect(typed).toEqual([]);
    expect(stackOf(pkg).nuxt).toBeGreaterThan(0);
  });
});

describe("counts the code can give", () => {
  // The seasons, the layers and the principles are lists in code or in a
  // chapter; a number or a name typed beside them goes stale when one is added.
  it("are not typed in the docs, the README or the chapter summaries", () => {
    const typed: string[] = [];
    const files = [...DOC_FILES, "shared/docs.ts"];
    for (const file of files)
      for (const m of prose(read(file)).matchAll(
        /\b(?:one|two|three|four|five|six|seven|eight|\d+) (?:seasons?|seasonal palettes?|principles|layers|chapters)\b/gi,
      ))
        typed.push(`${file}: ${m[0]}`);
    expect(typed).toEqual([]);
  });
});

describe("the loudness of the tracks", () => {
  const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;
  const tracks = readdirSync(join(ROOT, "public/audio")).filter((f) =>
    f.endsWith(".mp3"),
  );

  // Skipped where ffmpeg is not installed; run it wherever the audio changes.
  describe.skipIf(!hasFfmpeg)("measured", () => {
    it.each(tracks)(
      "%s is the loudness shared/audio.ts states",
      (track) => {
        const out = spawnSync(
          "ffmpeg",
          [
            "-nostats",
            "-hide_banner",
            "-i",
            join(ROOT, "public/audio", track),
            "-af",
            "ebur128=framelog=quiet",
            "-f",
            "null",
            "-",
          ],
          { encoding: "utf8" },
        ).stderr;
        const measured = Number(out.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]);
        expect(Math.abs(measured - BGM_LOUDNESS_LUFS)).toBeLessThanOrEqual(0.5);
      },
      60_000,
    );
  });
});

describe("the download sizes the Adding words chapter quotes", () => {
  // These sit in scripts/lib/*.mjs, which the app cannot import, so the
  // chapter types the figure and this reads the pins to keep it honest.
  const text = prose(read(`${DOCS_DIR}/authoring.vue`));
  const mb = (bytes: number) => bytes / 1e6;
  const quoted = (re: RegExp) => Number(text.match(re)?.[1]);

  it("the Wiktionary dump", async () => {
    const { WIKTIONARY_DUMP } = await import(
      // @ts-expect-error — plain .mjs module without type declarations
      "../../scripts/lib/wiktionary-dump.mjs"
    );
    expect(quoted(/a (\d+) MB file/)).toBe(
      Math.round(mb(WIKTIONARY_DUMP.bytes)),
    );
  });

  it("the Tatoeba export", async () => {
    const { TATOEBA_EXPORT } = await import(
      // @ts-expect-error — plain .mjs module without type declarations
      "../../scripts/lib/tatoeba-export.mjs"
    );
    const total = Object.values(
      TATOEBA_EXPORT.files as Record<string, { bytes: number }>,
    ).reduce((n, f) => n + f.bytes, 0);
    expect(quoted(/about (\d+) MB that is never committed/)).toBe(
      Math.round(mb(total)),
    );
  });

  it("the UniDic archive (“about half a gigabyte”)", async () => {
    const { UNIDIC_ACCENT_SOURCE } = await import(
      // @ts-expect-error — plain .mjs module without type declarations
      "../../scripts/lib/unidic-accent.mjs"
    );
    expect(text).toMatch(/about half a gigabyte/);
    expect(mb(UNIDIC_ACCENT_SOURCE.bytes)).toBeGreaterThan(450);
    expect(mb(UNIDIC_ACCENT_SOURCE.bytes)).toBeLessThan(650);
  });
});

describe("the claims the Patterns text makes about the years", () => {
  // The Daily words chapter says: no word before 2011 is N1, 2012 is
  // almost all N1, and katakana spellings are over a third of 2008.
  const entries = readdirSync(join(ROOT, "data/words"))
    .filter((f) => f.endsWith(".json"))
    .flatMap(
      (f) =>
        JSON.parse(read(`data/words/${f}`)) as {
          date: string;
          term: string;
          level: string;
        }[],
    );
  const year = (y: number) => entries.filter((e) => e.date.startsWith(`${y}`));
  const share = (
    list: typeof entries,
    test: (e: (typeof entries)[0]) => boolean,
  ) => list.filter(test).length / list.length;

  it("no word before 2011 is N1", () => {
    expect(entries.filter((e) => e.date < "2011" && e.level === "N1")).toEqual(
      [],
    );
  });

  it.each([2012])("%i is almost all N1", (y) => {
    expect(share(year(y), (e) => e.level === "N1")).toBeGreaterThan(0.9);
  });

  it("katakana spellings are over a third of 2008", () => {
    const kata = share(year(2008), (e) => /^[\u30A0-\u30FF]+$/.test(e.term));
    expect(kata).toBeGreaterThan(1 / 3);
    expect(kata).toBeLessThan(0.4);
  });
});

describe("sentences that list the same thing in two chapters", () => {
  // The furigana of an example sentence is backed by a contributor, kuromoji,
  // UniDic or Tatoeba's index. A chapter that lists the backers must list all.
  it("name every backer of a sentence's furigana", () => {
    const missing: string[] = [];
    for (const file of DOC_FILES)
      for (const sentence of prose(read(file)).split(/(?<=[.;]) /))
        if (/kuromoji/.test(sentence) && /Tatoeba's index/.test(sentence))
          if (!/UniDic/.test(sentence)) missing.push(`${file}: ${sentence}`);
    expect(missing).toEqual([]);
  });
});

describe("links between chapters", () => {
  it("only send a reader to the Roadmap while it lists something", () => {
    const roadmapHasItems = /<li[\s>]/.test(read(`${DOCS_DIR}/roadmap.vue`));
    const linking = DOC_PAGES.filter(
      (f) =>
        !f.endsWith("roadmap.vue") && read(f).includes('to="/docs/roadmap"'),
    );
    if (!roadmapHasItems) expect(linking).toEqual([]);
  });
});

describe("the prose", () => {
  it("has no word written twice in a row", () => {
    // "that that" and "had had" are grammatical; anything else is a slip.
    const allowed = new Set(["that", "had"]);
    const slips: string[] = [];
    for (const file of DOC_FILES)
      for (const m of prose(read(file)).matchAll(/\b([A-Za-z]{2,}) \1\b/g))
        if (!allowed.has(m[1]!.toLowerCase())) slips.push(`${file}: ${m[0]}`);
    expect(slips).toEqual([]);
  });
});

describe("figures typed in a chapter that code could not generate", () => {
  it("the API example is a real entry", () => {
    const m = read(`${DOCS_DIR}/api.vue`).match(
      /const example = `([\s\S]*?)`;/,
    );
    const example = JSON.parse(m![1]!) as {
      data: { entry: { date: string }; prev: { date: string; term: string } };
    };
    const [y, mo] = example.data.entry.date.split("-");
    const month = JSON.parse(read(`data/words/${y}-${mo}.json`)) as {
      date: string;
    }[];
    const real = month.find((e) => e.date === example.data.entry.date)!;
    // abridged: every field it shows must be the entry's own
    expect(real).toMatchObject(example.data.entry);
  });

  it("the share image size the API chapter states is the card's", () => {
    const og = API_ENDPOINTS.find((e) => e.path === "/og.png")!;
    expect(og.returns).toContain(`${OG_WIDTH} by ${OG_HEIGHT}`);
  });

  it("the Tatoeba export is five files, as Adding words says", async () => {
    const { TATOEBA_EXPORT } = await import(
      // @ts-expect-error — plain .mjs module without type declarations
      "../../scripts/lib/tatoeba-export.mjs"
    );
    const n = Object.keys(TATOEBA_EXPORT.files).length;
    expect(
      prose(read(`${DOCS_DIR}/authoring.vue`)).match(/\b(\w+) files of a/)?.[1],
    ).toBe(countWord(n));
  });

  it("the principles are as many as Core theme says", () => {
    const page = read(`${DOCS_DIR}/core-theme.vue`);
    const list = page.slice(page.indexOf("<h2>Principles</h2>"));
    const items = list.slice(0, list.indexOf("</ol>")).match(/<li>/g)!.length;
    expect(prose(page)).toMatch(
      new RegExp(`checked against these ${countWord(items)}\\.`),
    );
  });
});
