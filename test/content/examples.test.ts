import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";
import {
  loadSentenceSnapshot,
  // @ts-expect-error — untyped .mjs script helper
} from "../../scripts/lib/sentence-snapshot.mjs";
// @ts-expect-error — untyped .mjs script helper
import { TATOEBA_EXPORT } from "../../scripts/lib/tatoeba-export.mjs";
// @ts-expect-error — untyped .mjs script helper
import { snapshotMeta } from "../../scripts/build-sentences-reference.mjs";
// @ts-expect-error — untyped .mjs script helper
import {
  MAX_EXAMPLES,
  SENTENCE_LENGTH,
} from "../../scripts/lib/example-sentences.mjs";

/**
 * The example sentences each entry shows (data/reference/sentences/, picked
 * from one pinned Tatoeba export by `pnpm data:sentences`). The export itself
 * is too large to commit, so these checks read what is committed: each
 * sentence has to be a sentence of the word it is shown for.
 */

interface Snapshot {
  meta?: { license: string; export: string; files: Record<string, string> };
  entries: Record<
    string,
    { id: number; ja: string; en: string; enId: number; form: string }[]
  >;
}
const snapshot = loadSentenceSnapshot(
  resolve(import.meta.dirname, "../.."),
) as Snapshot;

const len = (s: string) => [...s].length;

describe("data/reference/sentences/", () => {
  it("records its source, licence and the export it was read from", () => {
    expect(snapshot.meta?.license).toMatch(/CC BY 2\.0 FR/);
    expect(snapshot.meta).toEqual(snapshotMeta());
    expect(snapshot.meta?.export).toBe(TATOEBA_EXPORT.date);
    for (const [name, pin] of Object.entries(TATOEBA_EXPORT.files))
      expect(snapshot.meta?.files[name], name).toBe((pin as any).sha256);
  });

  it("has no sentences for words that are not in the catalogue", () => {
    const used = new Set(WORD_ENTRIES.map((e) => e.term));
    expect(
      Object.keys(snapshot.entries).filter((t) => !used.has(t)),
      "re-run pnpm data:sentences after removing an entry",
    ).toEqual([]);
  });
});

describe("the example sentences of every entry", () => {
  it("are the committed snapshot's, and no entry invents one", () => {
    const stale = WORD_ENTRIES.filter(
      (e) =>
        JSON.stringify(e.examples ?? []) !==
        JSON.stringify(snapshot.entries[e.term] ?? []),
    ).map((e) => e.term);
    expect(stale, "run pnpm data:words").toEqual([]);
  });

  it("is a good share of them", () => {
    const withExamples = WORD_ENTRIES.filter((e) => e.examples?.length).length;
    expect(withExamples / WORD_ENTRIES.length).toBeGreaterThan(0.6);
  });

  describe.each(
    WORD_ENTRIES.filter((e) => e.examples?.length).map(
      (e) => [e.date, e.term, e] as const,
    ),
  )("%s %s", (_date, _term, entry) => {
    it("uses the word in a sentence that has a translation", () => {
      expect(entry.examples!.length).toBeLessThanOrEqual(MAX_EXAMPLES);
      for (const ex of entry.examples!) {
        // The form the sentence shows is really in it, and is the word: its
        // own spelling, kana for it, or an inflection that keeps its first
        // character.
        expect(ex.ja, `${ex.id} holds its form`).toContain(ex.form);
        expect(
          len(ex.form) >= 2 || /\p{sc=Han}/u.test(ex.form),
          `${ex.id}: ${ex.form} is too short to stand for a word`,
        ).toBe(true);
        const kanaForm = /^[\p{sc=Hiragana}\p{sc=Katakana}ー]+$/u.test(ex.form);
        expect(
          ex.form.startsWith([...entry.term][0]!) || kanaForm,
          `${ex.id}: ${ex.form} is no form of ${entry.term}`,
        ).toBe(true);
        expect(len(ex.ja)).toBeGreaterThanOrEqual(SENTENCE_LENGTH.min);
        expect(len(ex.ja)).toBeLessThanOrEqual(SENTENCE_LENGTH.max);
        expect(ex.en.trim().length, `${ex.id} translation`).toBeGreaterThan(0);
        expect(Number.isInteger(ex.id) && ex.id > 0).toBe(true);
        expect(Number.isInteger(ex.enId) && ex.enId > 0).toBe(true);
      }
      const jas = entry.examples!.map((e) => e.ja);
      expect(new Set(jas).size, "the same sentence twice").toBe(jas.length);
    });
  });
});
