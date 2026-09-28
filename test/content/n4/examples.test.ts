import { describe, it, expect, beforeAll } from "vitest";
import type kuromoji from "kuromoji";
import { N4_WORD_CLUSTERS } from "~/app/data/vocab-guide-n4";
import {
  kanaToRomaji,
  loadReference,
  normRomaji,
  tokenizer,
} from "../reference";
import { readingMatches } from "../examples.test";

/**
 * The N4 counterpart to test/content/examples.test.ts — every N4 example
 * sentence's rōmaji must be a valid reading of its Japanese, checked with
 * the same tokenizer-driven matcher N5 uses (readingMatches()), against
 * data/reference/n4-reference.json's own readings.
 */

const reference = loadReference("N4");

type Token = kuromoji.IpadicFeatures;

const examples = N4_WORD_CLUSTERS.flatMap((c) =>
  (c.examples ?? []).map((ex) => ({ where: c.key, ex })),
);

describe("N4 example sentences", () => {
  let tok: kuromoji.Tokenizer<Token>;
  beforeAll(async () => {
    tok = await tokenizer();
  });

  it("has examples to check", () => {
    expect(examples.length).toBeGreaterThan(50);
  });

  it.each(examples.map((e) => [`${e.where}: ${e.ex.jp}`, e.ex] as const))(
    "%s — rōmaji matches the Japanese",
    (_label, ex) => {
      expect(ex.romaji, "use wāpuro rōmaji (ou/ei), no macrons").not.toMatch(
        /[āīūēō]/,
      );
      const tokens = tok.tokenize(ex.jp);
      const ok = readingMatches(tokens, normRomaji(ex.romaji), reference);
      const guess = tokens
        .map((t) =>
          t.reading && t.reading !== "*" ? t.reading : t.surface_form,
        )
        .join("");
      expect(
        ok,
        `"${ex.romaji}" is not a reading of 「${ex.jp}」 (tokenizer reads it as ${kanaToRomaji(guess)})`,
      ).toBe(true);
      expect(ex.en.trim().length, "English translation").toBeGreaterThan(0);
    },
  );
});
