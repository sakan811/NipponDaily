import { describe, it, expect, beforeAll } from "vitest";
import type kuromoji from "kuromoji";
import { N2_WORD_CLUSTERS } from "~/app/data/vocab-guide-n2";
import { loadReference, tokenizer } from "../reference";

/**
 * The N2 counterpart to test/content/prose.test.ts — every Japanese word
 * N2's lesson prose mentions must be a real word. See that file's own
 * comment for why prose can only be checked mechanically this way.
 */

const JAPANESE = /[぀-ヿ一-鿿々ー]+/gu;

const reference = loadReference("N2");

describe("N2 lesson prose", () => {
  let tok: kuromoji.Tokenizer<kuromoji.IpadicFeatures>;
  beforeAll(async () => {
    tok = await tokenizer();
  });

  it("only mentions real Japanese words", () => {
    const known = new Set(reference.words);
    const unknown: string[] = [];
    for (const c of N2_WORD_CLUSTERS) {
      const texts = [
        c.title,
        c.subtitle,
        c.insight,
        c.extendedInsight ?? "",
        c.commonMistake ?? "",
        ...(c.examples ?? []).map((e) => e.jp),
        ...c.rows.map((r) => r.label ?? ""),
      ];
      for (const text of texts) {
        for (const [run] of text.matchAll(JAPANESE)) {
          // A run that is itself a dictionary word (じょう, ちゅう) is real
          // even when the tokenizer splits it into unplaceable fragments.
          if (known.has(run)) continue;
          for (const t of tok.tokenize(run)) {
            // A lone kanji the lessons discuss on its own (演, 迷, 咥) is a
            // real KANJIDIC2 character, not a word — bound kanji have no
            // JMdict headword of their own.
            const isKnownKanji =
              [...t.surface_form].length === 1 &&
              t.surface_form in reference.kanji;
            if (
              t.word_type === "UNKNOWN" &&
              !known.has(t.surface_form) &&
              !isKnownKanji
            ) {
              unknown.push(`${c.key}: ${t.surface_form} (in 「${run}」)`);
            }
          }
        }
      }
    }
    expect(
      unknown,
      "not a word in the tokenizer's dictionary or JMdict — misspelt? (if it's real, run pnpm data:reference:jlpt)",
    ).toEqual([]);
  });
});
