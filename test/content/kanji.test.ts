import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";
import { JLPT_LEVELS } from "~~/shared/jlpt";
import { loadReference, type RefKanji } from "./reference";
// @ts-expect-error — plain .mjs module without type declarations
import { buildKanjiReference } from "../../scripts/build-kanji-reference.mjs";

/**
 * data/reference/kanji.json is the KANJIDIC2 record of every kanji the entries
 * are written with, built offline from the committed level snapshots. These
 * checks read the entries and the snapshots independently of the builder.
 */

const ROOT = resolve(import.meta.dirname, "../..");
const file = JSON.parse(
  readFileSync(resolve(ROOT, "data/reference/kanji.json"), "utf8"),
) as {
  meta: { source: { licence: string }; count: number };
  kanji: Record<string, RefKanji & { grade?: number; freq?: number }>;
};

const used = new Set(
  WORD_ENTRIES.flatMap((e) => e.term.match(/[㐀-䶿一-鿿]/gu) ?? []),
);

describe("data/reference/kanji.json", () => {
  it("has a record for every kanji an entry is written with, and no other", () => {
    expect(Object.keys(file.kanji).sort()).toEqual([...used].sort());
    expect(file.meta.count).toBe(used.size);
  });

  it("holds KANJIDIC2's own record, as the level snapshots do", () => {
    const levels = JLPT_LEVELS.map((l) => loadReference(l).kanji);
    for (const [char, record] of Object.entries(file.kanji)) {
      const source = levels.find((k) => k[char]);
      expect(source, `${char} is in no level snapshot`).toBeDefined();
      expect(record).toEqual(source![char]);
    }
  });

  it("gives every kanji a stroke count, a reading and a meaning", () => {
    for (const [char, k] of Object.entries(file.kanji)) {
      expect(k.strokeCount, char).toBeGreaterThan(0);
      expect(k.on.length + k.kun.length, `${char} readings`).toBeGreaterThan(0);
      expect(k.meanings.length, `${char} meanings`).toBeGreaterThan(0);
      if (k.grade !== undefined)
        expect([1, 2, 3, 4, 5, 6, 8, 9, 10], `${char} grade`).toContain(
          k.grade,
        );
    }
  });

  it("records its licence", () => {
    expect(file.meta.source.licence).toMatch(/CC BY-SA/);
  });

  it("is what the builder makes from the snapshots and the entries", () => {
    expect(buildKanjiReference(ROOT)).toEqual(file);
  });

  it("reads the entries it was built from", () => {
    expect(readdirSync(resolve(ROOT, "data/words")).length).toBeGreaterThan(0);
  });
});
