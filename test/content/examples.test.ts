import { describe, it, expect, beforeAll } from "vitest";
import type kuromoji from "kuromoji";
import { WORD_CLUSTERS } from "~/app/data/vocab-guide";
import {
  KANJI_RE,
  kanaToRomaji,
  normRomaji,
  reference,
  tokenizer,
} from "./reference";

/**
 * Every example sentence's rōmaji must be a valid reading of its Japanese.
 *
 * The sentence is tokenized (kuromoji, IPAdic), and the rōmaji has to be
 * spelled out by some sequence of readings, one per token — where a token
 * (or a run of up to three tokens, for words the tokenizer splits, e.g.
 * 三日 / 二十日) may use the tokenizer's reading OR any reading JMdict lists
 * for that written form in data/reference/n5-reference.json. So 七時 may be
 * "shichi-ji" or "nana-ji", but 三日 as "sannichi" when the text says
 * "mikka" still has to match one of JMdict's readings, and a wrong or
 * mistyped reading fails.
 */

const MAX_SPAN = 3;
const PARTICLE_READINGS: Record<string, string[]> = {
  は: ["は", "わ"],
  へ: ["へ", "え"],
  を: ["を", "お"],
};

type Token = kuromoji.IpadicFeatures;

function tokenReadings(t: Token): string[] {
  const out = new Set<string>();
  if (t.pos === "助詞" && PARTICLE_READINGS[t.surface_form]) {
    PARTICLE_READINGS[t.surface_form]!.forEach((r) => out.add(r));
  }
  if (t.reading && t.reading !== "*") out.add(t.reading);
  if (!KANJI_RE.test(t.surface_form)) out.add(t.surface_form);
  for (const r of reference.readings[t.surface_form] ?? []) out.add(r);
  return [...out];
}

/** Can `target` be spelled by readings of tokens[i..]? */
export function readingMatches(tokens: Token[], target: string): boolean {
  const memo = new Map<string, boolean>();
  const go = (i: number, at: number): boolean => {
    if (i === tokens.length) return at === target.length;
    const key = `${i}:${at}`;
    if (memo.has(key)) return memo.get(key)!;
    let ok = false;
    for (
      let len = 1;
      len <= MAX_SPAN && i + len <= tokens.length && !ok;
      len++
    ) {
      const span = tokens.slice(i, i + len);
      const surface = span.map((t) => t.surface_form).join("");
      const candidates =
        len === 1
          ? tokenReadings(span[0]!)
          : KANJI_RE.test(surface)
            ? (reference.readings[surface] ?? [])
            : [];
      for (const kana of candidates) {
        // A token ending in small っ (洗っ|て) doubles the next consonant,
        // which only shows up once the next token is attached.
        const sokuon = /[っッ]$/.test(kana);
        const r = kanaToRomaji(sokuon ? kana.slice(0, -1) : kana);
        if (!target.startsWith(r, at)) continue;
        let next = at + r.length;
        if (sokuon) {
          const c = target[next];
          if (!c || /[aiueo]/.test(c) || target[next + 1] !== c) continue;
          next += 1;
        }
        if (go(i + len, next)) {
          ok = true;
          break;
        }
      }
    }
    memo.set(key, ok);
    return ok;
  };
  return go(0, 0);
}

const examples = WORD_CLUSTERS.flatMap((c) =>
  (c.examples ?? []).map((ex) => ({ where: c.key, ex })),
);

describe("the rōmaji checker itself", () => {
  let tok: kuromoji.Tokenizer<Token>;
  beforeAll(async () => {
    tok = await tokenizer();
  });
  const check = (jp: string, romaji: string) =>
    readingMatches(tok.tokenize(jp), normRomaji(romaji));

  it("accepts every reading JMdict lists, not just the tokenizer's guess", () => {
    expect(
      check("誕生日は五月三日です。", "Tanjoubi wa gogatsu mikka desu."),
    ).toBe(true);
    expect(check("毎朝七時に起きます。", "Maiasa shichi-ji ni okimasu.")).toBe(
      true,
    );
    expect(check("毎朝七時に起きます。", "Maiasa nana-ji ni okimasu.")).toBe(
      true,
    );
    expect(check("手を洗ってください。", "Te o aratte kudasai.")).toBe(true);
  });

  it("rejects wrong readings, wrong words and typos", () => {
    expect(
      check("誕生日は五月三日です。", "Tanjoubi wa gogatsu yokka desu."),
    ).toBe(false);
    expect(check("毎朝七時に起きます。", "Maiasa hachi-ji ni okimasu.")).toBe(
      false,
    );
    expect(check("手を洗ってください。", "Te o arate kudasai.")).toBe(false);
    expect(check("来週、日本に行きます。", "Senshuu, Nihon ni ikimasu.")).toBe(
      false,
    );
  });
});

describe("example sentences", () => {
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
      const ok = readingMatches(tok.tokenize(ex.jp), normRomaji(ex.romaji));
      const guess = tok
        .tokenize(ex.jp)
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
