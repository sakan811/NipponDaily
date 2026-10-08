import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { toHiragana } from "wanakana";
import { WORD_ENTRIES } from "~~/shared/words";
import { moraeOf } from "~/app/utils/pitch";
// @ts-expect-error — untyped .mjs script helper
import {
  PITCH_SOURCE,
  snapshotMeta,
} from "../../scripts/build-pitch-reference.mjs";

/**
 * The pitch accents each entry shows (data/reference/pitch.json, taken from
 * one pinned accent list by `pnpm data:pitch`). The list is not committed, so
 * these checks read what is: every number has to be one the word has the
 * morae for, and every entry has to show the snapshot's and nothing else.
 */

interface Snapshot {
  meta: ReturnType<typeof snapshotMeta>;
  entries: Record<string, { kana: string; accents: number[] }>;
}
const snapshot = JSON.parse(
  readFileSync(
    resolve(import.meta.dirname, "../../data/reference/pitch.json"),
    "utf8",
  ),
) as Snapshot;

describe("data/reference/pitch.json", () => {
  it("records its source, licence and the file it was read from", () => {
    expect(snapshot.meta).toEqual(snapshotMeta());
    expect(snapshot.meta.licence).toMatch(/CC BY-SA 4\.0/);
    expect(snapshot.meta.file.sha256).toBe(PITCH_SOURCE.sha256);
  });

  it("has only words in the catalogue, with their own reading", () => {
    const byTerm = new Map(WORD_ENTRIES.map((e) => [e.term, e]));
    for (const [term, { kana }] of Object.entries(snapshot.entries)) {
      const entry = byTerm.get(term);
      expect(entry, `${term} is not in the catalogue`).toBeDefined();
      expect(toHiragana(kana), `${term} reading`).toBe(toHiragana(entry!.kana));
    }
  });

  it("gives each accent as a whole number within the word's morae", () => {
    for (const [term, { kana, accents }] of Object.entries(snapshot.entries)) {
      expect(accents.length, term).toBeGreaterThan(0);
      for (const a of accents) {
        expect(Number.isInteger(a) && a >= 0, `${term} ${a}`).toBe(true);
        expect(
          a,
          `${term} has ${moraeOf(kana).length} morae`,
        ).toBeLessThanOrEqual(moraeOf(kana).length);
      }
    }
  });
});

describe("the pitch accent of every entry", () => {
  it("is the committed snapshot's, and no entry invents one", () => {
    const stale = WORD_ENTRIES.filter(
      (e) =>
        JSON.stringify(e.pitch ?? []) !==
        JSON.stringify(snapshot.entries[e.term]?.accents ?? []),
    ).map((e) => e.term);
    expect(stale, "run pnpm data:pitch, then pnpm data:words").toEqual([]);
  });

  it("covers most words", () => {
    const shown = WORD_ENTRIES.filter((e) => e.pitch?.length).length;
    expect(shown / WORD_ENTRIES.length).toBeGreaterThan(0.9);
  });
});
