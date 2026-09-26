import { describe, it, expect, beforeAll } from "vitest";
import type kuromoji from "kuromoji";
import { WORD_CLUSTERS } from "~/app/data/vocab-guide";
import {
  DAKUTEN_GROUPS,
  DIGRAPH_GROUPS,
  KANA_ROWS,
} from "~/app/data/kana-guide";
import { kanaToRomaji, normRomaji, reference, tokenizer } from "./reference";

/**
 * Checks on free-text lesson copy. Prose can't be verified line by line, so
 * these cover what can be checked mechanically: every Japanese word it
 * mentions is a real word, and every "かな (romaji)" pair is spelled right.
 * Facts that need checking belong in structured fields (examples, rows),
 * which test/content/examples.test.ts and vocabulary.test.ts verify.
 */

const JAPANESE = /[぀-ヿ一-鿿々ー]+/gu;

describe("lesson prose", () => {
  let tok: kuromoji.Tokenizer<kuromoji.IpadicFeatures>;
  beforeAll(async () => {
    tok = await tokenizer();
  });

  it("only mentions real Japanese words", () => {
    const known = new Set(reference.words);
    const unknown: string[] = [];
    for (const c of WORD_CLUSTERS) {
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
      "not a word in the tokenizer's dictionary or JMdict — misspelt? (if it's real, run pnpm data:reference)",
    ).toEqual([]);
  });
});

describe("kana guide", () => {
  it("pairs every kana with its standard Hepburn rōmaji", () => {
    for (const row of KANA_ROWS) {
      for (const e of row.entries) {
        expect(kanaToRomaji(e.hiragana), e.hiragana).toBe(normRomaji(e.romaji));
        expect(kanaToRomaji(e.katakana), e.katakana).toBe(normRomaji(e.romaji));
      }
    }
  });

  it("spells every 'かな (romaji)' example correctly", () => {
    const pairs = [...DAKUTEN_GROUPS, ...DIGRAPH_GROUPS].flatMap((g) =>
      [
        ...`${g.description} ${g.example}`.matchAll(
          /([぀-ヿ]+) \(([a-z]+)[,)]/g,
        ),
      ].map((m) => [m[1]!, m[2]!] as const),
    );
    expect(pairs.length).toBeGreaterThan(5);
    const wrong = pairs.filter(
      ([kana, romaji]) =>
        kanaToRomaji(kana) !== normRomaji(romaji) &&
        // "tempura": ん before p/b/m is often written m in Hepburn
        kanaToRomaji(kana).replace(/n(?=[pbm])/g, "m") !== normRomaji(romaji),
    );
    expect(wrong).toEqual([]);
  });
});
