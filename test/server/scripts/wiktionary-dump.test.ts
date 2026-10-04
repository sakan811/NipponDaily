import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
// @ts-expect-error — plain .mjs module without type declarations
import * as dump from "../../../scripts/lib/wiktionary-dump.mjs";
// @ts-expect-error — plain .mjs module without type declarations
import * as entry from "../../../scripts/lib/word-entry.mjs";

const { readingsOfRecord, sectionsOf, readSections, verifyDump } =
  dump as Record<string, (...args: any[]) => any>;
const { buildEntry } = entry as Record<string, (...args: any[]) => any>;

const head = (name: string, args: Record<string, string>) => ({
  head_templates: [{ name, args }],
});

describe("readingsOfRecord", () => {
  it("reads the first argument of a noun or verb template", () => {
    expect(readingsOfRecord(head("ja-noun", { "1": "でんわ" }))).toEqual([
      "でんわ",
    ]);
    expect(
      readingsOfRecord(head("ja-verb", { "1": "たがえす", "2": "たがやす" })),
    ).toEqual(["たがえす", "たがやす"]);
  });

  it("reads the second argument of ja-pos, whose first is the part of speech", () => {
    expect(
      readingsOfRecord(head("ja-pos", { "1": "pronoun", "2": "だれ" })),
    ).toEqual(["だれ"]);
  });

  it("never turns romaji into kana", () => {
    expect(readingsOfRecord(head("ja-pos", { "1": "pronoun" }))).toEqual([]);
    expect(readingsOfRecord(head("ja-pos", { "1": "numeral" }))).toEqual([]);
  });

  it("drops okurigana boundaries and pitch marks", () => {
    expect(readingsOfRecord(head("ja-noun", { "1": "ほの.お" }))).toEqual([
      "ほのお",
    ]);
    expect(readingsOfRecord(head("ja-noun", { "1": "お-れい" }))).toEqual([
      "おれい",
    ]);
    expect(readingsOfRecord(head("ja-noun", { "1": "ジー%ディー" }))).toEqual([
      "じいでぃい",
    ]);
  });

  it("converts katakana readings to hiragana and ignores non-ja templates", () => {
    expect(readingsOfRecord(head("ja-noun", { "1": "サン" }))).toEqual([
      "さん",
    ]);
    expect(readingsOfRecord(head("head", { "1": "ja", "2": "さん" }))).toEqual(
      [],
    );
  });
});

describe("sectionsOf", () => {
  const rec = (text: string | undefined, reading: string, lang = "ja") => ({
    lang_code: lang,
    etymology_text: text,
    ...head("ja-noun", { "1": reading }),
  });

  it("merges records that share an etymology and unions their readings", () => {
    const sections = sectionsOf([
      rec("From Old Japanese.", "おとな"),
      rec("From Old Japanese.", "おとな"),
      rec("Unknown.", "うし"),
    ]);
    expect(sections).toEqual([
      {
        heading: "Etymology",
        text: "From Old Japanese.",
        readings: ["おとな"],
      },
      { heading: "Etymology", text: "Unknown.", readings: ["うし"] },
    ]);
  });

  it("skips records with no etymology and entries of other languages", () => {
    expect(
      sectionsOf([rec(undefined, "あ"), rec("From English.", "あ", "mul")]),
    ).toEqual([]);
  });
});

describe("readSections and verifyDump", () => {
  const dir = mkdtempSync(join(tmpdir(), "dump-"));
  const file = join(dir, "dump.jsonl");
  const lines = [
    {
      word: "電話",
      lang_code: "ja",
      etymology_text: "Coined.",
      ...head("ja-noun", { "1": "でんわ" }),
    },
    { word: "電話", lang_code: "ko", etymology_text: "Korean." },
    {
      word: "犬",
      lang_code: "ja",
      etymology_text: "Native.",
      ...head("ja-noun", { "1": "いぬ" }),
    },
    { word: "猫", lang_code: "ja", ...head("ja-noun", { "1": "ねこ" }) },
  ];
  writeFileSync(file, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");

  it("returns the sections of the terms asked for and omits terms with none", async () => {
    const out = await readSections(file, ["電話", "猫"]);
    expect([...out.keys()]).toEqual(["電話"]);
    expect(out.get("電話")).toEqual([
      { heading: "Etymology", text: "Coined.", readings: ["でんわ"] },
    ]);
  });

  it("refuses a file that is not the pinned dump", async () => {
    await expect(verifyDump(file)).rejects.toThrow(/not the pinned/);
  });
});

describe("buildEntry: the dump attaching another reading's etymology", () => {
  const vocab = {
    term: "道",
    kana: "みち",
    meaning: "road",
    level: "N5",
    jmdict: [],
  };
  const kanji = { 道: { on: ["ドウ"], kun: ["みち"], meanings: ["road"] } };
  const ctx = (text: string) => ({
    vocab: () => [vocab],
    kanji,
    snapshot: {
      meta: { dump: "2026-09-02" },
      entries: {
        道: {
          etymologies: [{ heading: "Etymology", text, readings: ["みち"] }],
        },
      },
    },
  });

  it("refuses a native reading whose section says it is from Middle Chinese", () => {
    expect(() =>
      buildEntry(
        { date: "2026-11-12", term: "道", headline: "x" },
        ctx("From Middle Chinese 道 (MC dawX)."),
      ),
    ).toThrow(/reads みち as native/);
  });

  it("builds when the section agrees with KANJIDIC2", () => {
    const built = buildEntry(
      { date: "2026-11-12", term: "道", headline: "x" },
      ctx("From Old Japanese, ultimately from Proto-Japonic *miti."),
    );
    expect(built.wiktionaryDump).toBe("2026-09-02");
  });
});
