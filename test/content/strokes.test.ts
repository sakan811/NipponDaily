import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";
// @ts-expect-error — untyped .mjs script helper
import {
  STROKES_SOURCE,
  snapshotMeta,
} from "../../scripts/build-strokes-reference.mjs";

/**
 * The stroke order of the kanji pages (data/reference/strokes.json, taken from
 * one pinned KanjiVG release by `pnpm data:strokes`). The release is not
 * committed, so these checks read what is: each kanji has as many strokes as
 * KANJIDIC2 counts, and the kanji without strokes are the few the two sources
 * count differently.
 */

const read = (file: string) =>
  JSON.parse(readFileSync(resolve(import.meta.dirname, "../..", file), "utf8"));
const snapshot = read("data/reference/strokes.json") as {
  meta: ReturnType<typeof snapshotMeta>;
  strokes: Record<string, string[]>;
};
const kanji = read("data/reference/kanji.json").kanji as Record<
  string,
  { strokeCount: number }
>;

describe("data/reference/strokes.json", () => {
  it("records its source, licence and the release it was read from", () => {
    expect(snapshot.meta).toEqual(snapshotMeta());
    expect(snapshot.meta.licence).toMatch(/CC BY-SA 3\.0/);
    expect(snapshot.meta.file.sha256).toBe(STROKES_SOURCE.sha256);
  });

  it("has only kanji of the kanji snapshot, each with KANJIDIC2's stroke count", () => {
    for (const [char, paths] of Object.entries(snapshot.strokes)) {
      expect(kanji[char], `${char} is not in kanji.json`).toBeDefined();
      expect(paths, char).toHaveLength(kanji[char]!.strokeCount);
      for (const d of paths) expect(d, char).toMatch(/^[Mm]\s*[\d.-]/);
    }
  });

  it("covers nearly every kanji the words are written with", () => {
    const used = new Set(
      WORD_ENTRIES.flatMap(
        (e) => e.term.match(/[\u3400-\u4dbf\u4e00-\u9fff]/gu) ?? [],
      ),
    );
    const missing = [...used].filter((c) => !snapshot.strokes[c]);
    expect(missing.length / used.size).toBeLessThan(0.02);
  });
});
