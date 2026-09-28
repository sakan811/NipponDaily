import { describe, it, expect, beforeAll } from "vitest";
import type kuromoji from "kuromoji";
import { N4_WORD_CLUSTERS } from "~/app/data/vocab-guide-n4";
import { loadReference, tokenizer } from "../reference";

/**
 * The N4 counterpart to test/content/prose.test.ts — every Japanese word
 * N4's lesson prose mentions must be a real word. See that file's own
 * comment for why prose can only be checked mechanically this way.
 */

const JAPANESE = /[぀-ヿ一-鿿々ー]+/gu;

const reference = loadReference("N4");

describe("N4 lesson prose", () => {
  let tok: kuromoji.Tokenizer<kuromoji.IpadicFeatures>;
  beforeAll(async () => {
    tok = await tokenizer();
  });

  it("only mentions real Japanese words", () => {
    const known = new Set(reference.words);
    const unknown: string[] = [];
    for (const c of N4_WORD_CLUSTERS) {
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
          for (const t of tok.tokenize(run)) {
            if (t.word_type === "UNKNOWN" && !known.has(t.surface_form)) {
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
