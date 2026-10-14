import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";
// @ts-expect-error — untyped .mjs script helper
import {
  COMPONENTS_SOURCE,
  snapshotMeta,
} from "../../scripts/build-components-reference.mjs";

/**
 * The shapes of the kanji pages (data/reference/components.json, taken from
 * one pinned KRADFILE by `pnpm data:components`). The archive is not
 * committed, so these checks read what is: every kanji of the entries has a
 * line, and no line is for a character the entries do not use.
 */

const read = (file: string) =>
  JSON.parse(readFileSync(resolve(import.meta.dirname, "../..", file), "utf8"));
const snapshot = read("data/reference/components.json") as {
  meta: ReturnType<typeof snapshotMeta>;
  components: Record<string, string[]>;
};
const kanji = read("data/reference/kanji.json").kanji as Record<
  string,
  unknown
>;

describe("data/reference/components.json", () => {
  it("records its source, licence and the file it was read from", () => {
    expect(snapshot.meta).toEqual(snapshotMeta());
    expect(snapshot.meta.licence).toMatch(/CC BY-SA 4\.0/);
    expect(snapshot.meta.file.sha256).toBe(COMPONENTS_SOURCE.sha256);
    expect(snapshot.meta.file.bytes).toBe(COMPONENTS_SOURCE.bytes);
  });

  it("has only kanji of the kanji snapshot, each with at least one shape", () => {
    for (const [char, parts] of Object.entries(snapshot.components)) {
      expect(kanji[char], `${char} is not in kanji.json`).toBeDefined();
      expect(parts.length, char).toBeGreaterThan(0);
      for (const p of parts) expect(p, char).not.toMatch(/\s/);
    }
  });

  it("covers every kanji the words are written with", () => {
    const used = new Set(
      WORD_ENTRIES.flatMap((e) => e.term.match(/[㐀-䶿一-鿿]/gu) ?? []),
    );
    const missing = [...used].filter((c) => !snapshot.components[c]);
    expect(missing.length / used.size).toBeLessThan(0.02);
  });
});
