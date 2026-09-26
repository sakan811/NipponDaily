import { describe, it, expect, beforeAll } from "vitest";
import type kuromoji from "kuromoji";
import { toKatakana, toRomaji } from "wanakana";
import { servedVocab } from "~~/shared/meanings";
import { reference, tokenizer } from "./reference";

/**
 * The rōmaji shown on every word card must match how the word is spoken.
 *
 * The seed derives rōmaji by converting kana letter by letter, which is
 * wrong wherever は/へ/を are particles: では is "dewa", not "deha". The
 * word's written form is tokenized (kuromoji knows では is pronounced デワ
 * while 歯 is ハ), and every served rōmaji must equal the kana converted
 * with those particle sounds. Fix a failure with a `romaji` entry in
 * shared/meanings.ts VOCAB_FORM_CORRECTIONS.
 */

const PARTICLE_SOUND: Record<string, string> = { ハ: "ワ", ヘ: "エ", ヲ: "オ" };

type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

/** The kana as spoken: particle は/へ/を swapped for わ/え/お where the
 *  tokenizer's pronunciation says so. Null if the tokenizer's reading of
 *  the written form doesn't match the kana (then there's nothing to say). */
export function spokenKana(tok: Tokenizer, term: string, kana: string) {
  const tokens = tok.tokenize(term);
  const reading = tokens
    .map((t) => (t.reading && t.reading !== "*" ? t.reading : t.surface_form))
    .join("");
  if (toKatakana(reading) !== toKatakana(kana)) return null;
  let at = 0;
  const out = [...kana];
  for (const t of tokens) {
    const r = toKatakana(
      t.reading && t.reading !== "*" ? t.reading : t.surface_form,
    );
    const p = t.pronunciation && t.pronunciation !== "*" ? t.pronunciation : r;
    if (p.length === r.length) {
      [...r].forEach((c, i) => {
        if (c !== p[i] && PARTICLE_SOUND[c] === p[i]) {
          out[at + i] = kana[at + i] === c ? p[i]! : toHiraganaChar(p[i]!);
        }
      });
    }
    at += r.length;
  }
  return out.join("");
}

const toHiraganaChar = (c: string) =>
  String.fromCharCode(c.charCodeAt(0) - 0x60);

describe("word-card rōmaji", () => {
  let tok: Tokenizer;
  beforeAll(async () => {
    tok = await tokenizer();
  });

  it("the checker knows particle は from the letter は", () => {
    expect(toRomaji(spokenKana(tok, "では", "では")!)).toBe("dewa");
    expect(toRomaji(spokenKana(tok, "歯", "は")!)).toBe("ha");
    expect(toRomaji(spokenKana(tok, "母", "はは")!)).toBe("haha");
    expect(toRomaji(spokenKana(tok, "八", "はち")!)).toBe("hachi");
  });

  it("matches how every served N5 word is pronounced", () => {
    const wrong: string[] = [];
    for (const v of reference.vocab) {
      // Words carrying list notation (～円, 散歩 (する)) have no particles.
      if (/[～〜~()（）\s]/.test(v.kana + v.listTerm)) continue;
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
