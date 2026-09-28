import { describe, it, expect, beforeAll } from "vitest";
import type kuromoji from "kuromoji";
import { toRomaji } from "wanakana";
import { servedVocab } from "~~/shared/meanings";
import { loadReference, tokenizer } from "../reference";
import { spokenKana } from "../romaji.test";

/**
 * The N4 counterpart to test/content/romaji.test.ts — every served N4
 * word's rōmaji must match how the word is actually spoken, reusing the
 * same spokenKana() particle-sound checker N5 uses (は/へ/を as topic/
 * direction/object particles pronounced わ/え/お).
 */

const reference = loadReference("N4");

type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

describe("N4 word-card rōmaji", () => {
  let tok: Tokenizer;
  beforeAll(async () => {
    tok = await tokenizer();
  });

  it("matches how every served N4 word is pronounced", () => {
    const wrong: string[] = [];
    for (const v of reference.vocab) {
      if (/[～〜~()（）\s、]/.test(v.kana + v.listTerm)) continue;
      const seedKana = v.seedKey.slice(v.listTerm.length + 1);
      const served = servedVocab({
        term: v.listTerm,
        kana: seedKana,
        romaji: toRomaji(seedKana), // exactly what the seed stores
        meaning: v.meaning,
      });
      const spoken = spokenKana(tok, served.term, served.kana);
      if (spoken === null) continue;
      const expected = toRomaji(spoken);
      if (served.romaji !== expected) {
        wrong.push(`${v.id}: "${served.romaji}" should be "${expected}"`);
      }
    }
    expect(
      wrong,
      "add a romaji correction in shared/meanings.ts VOCAB_FORM_CORRECTIONS",
    ).toEqual([]);
  });
});
