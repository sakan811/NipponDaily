import { describe, it, expect } from "vitest";
import { RELATED_LIMIT } from "~~/shared/limits";
import { referencesFor, relatedWords } from "~~/shared/related";
import { WORD_ENTRIES } from "~~/shared/words";

const TODAY = "2010-05-10";
const entry = (date: string) => WORD_ENTRIES.find((e) => e.date === date)!;

describe("relatedWords", () => {
  it("offers at most a handful of other words, never the entry itself", () => {
    const words = relatedWords(entry("2009-07-10"), TODAY);

    expect(words.length).toBeGreaterThan(0);
    expect(words.length).toBeLessThanOrEqual(RELATED_LIMIT);
    expect(words.map((w) => w.date)).not.toContain("2009-07-10");
    expect(new Set(words.map((w) => w.date)).size).toBe(words.length);
  });

  it("ranks words that share a part first, and says which part", () => {
    // 月曜日 is 月 + 曜 + 日; the other weekdays share 曜 and 日.
    const words = relatedWords(entry("2009-07-10"), TODAY);

    expect(words[0]!.shared.parts.length).toBeGreaterThan(0);
    const partsShared = words.map((w) => w.shared.parts.length);
    expect(partsShared).toEqual([...partsShared].sort((a, b) => b - a));
    for (const w of words) {
      const own = new Set(entry(w.date).morphemes.map((m) => m.text));
      for (const part of w.shared.parts) {
        expect(own.has(part)).toBe(true);
        expect(entry("2009-07-10").morphemes.map((m) => m.text)).toContain(
          part,
        );
      }
    }
  });

  it("only reports sharing that is really there", () => {
    const base = entry("2010-02-10"); // 手紙
    for (const w of relatedWords(base, TODAY)) {
      const other = entry(w.date);
      for (const p of w.shared.processes) {
        expect(base.processes).toContain(p);
        expect(other.processes).toContain(p);
      }
      if (w.shared.stratum) {
        expect(base.stratum).toBe(w.shared.stratum);
        expect(other.stratum).toBe(w.shared.stratum);
      }
      expect(
        w.shared.parts.length || w.shared.processes.length || w.shared.stratum,
      ).toBeTruthy();
    }
  });

  it("does not pad the row with words that share only a very common tag", () => {
    // 今年 has no parts and no stated layer; every other open word sharing its
    // "compound" and "borrowing" tags is a weak match, so none is offered.
    expect(relatedWords(entry("2009-05-11"), TODAY)).toEqual([]);
  });

  it("carries the fields the card shows", () => {
    const [w] = relatedWords(entry("2010-02-10"), TODAY);
    const e = entry(w!.date);

    expect(w).toMatchObject({
      date: e.date,
      term: e.term,
      kana: e.kana,
      meaning: e.meaning,
    });
  });

  it("never offers a word that has not opened", () => {
    // On 2009-07-16 only the first 67 days are open.
    const words = relatedWords(entry("2009-07-10"), "2009-07-16");

    expect(words.length).toBeGreaterThan(0);
    for (const w of words) expect(w.date <= "2009-07-16").toBe(true);
    // Same entry, an earlier "today": nothing from after it can appear either.
    for (const w of relatedWords(entry("2009-05-14"), "2009-05-20")) {
      expect(w.date <= "2009-05-20").toBe(true);
    }
  });

  it("is empty when no other word has opened", () => {
    expect(relatedWords(entry("2009-05-11"), "2009-05-11")).toEqual([]);
  });
});

describe("referencesFor", () => {
  const withRefs = WORD_ENTRIES.find(
    (e) => e.antonyms?.length && e.date <= TODAY,
  )!;

  it("hands back the entry's own references, in order, and nothing else", () => {
    const { antonyms, seeAlso } = referencesFor(withRefs, "2026-12-31");

    expect(antonyms.map(({ term, kana }) => ({ term, kana }))).toEqual(
      withRefs.antonyms!.map(({ term, kana }) => ({ term, kana })),
    );
    expect(seeAlso.map((r) => r.term)).toEqual(
      (withRefs.seeAlso ?? []).map((r) => r.term),
    );
  });

  it("links a reference only to a word that has opened, and only when it is just one", () => {
    // 異常 いじょう (2005-06 or so) points at 正常: it links once 正常 has opened.
    const entry = WORD_ENTRIES.find((e) => e.term === "異常")!;
    const target = WORD_ENTRIES.find((e) => e.term === "正常")!;
    expect(target).toBeDefined();

    const before = referencesFor(entry, "2005-01-01");
    expect(before.antonyms[0]!.word).toBeUndefined();

    const after = referencesFor(entry, "2026-12-31");
    expect(after.antonyms[0]!.word).toMatchObject({
      date: target.date,
      term: "正常",
    });
  });

  it("never names a word whose day has not come", () => {
    for (const e of WORD_ENTRIES.filter((x) => x.date <= TODAY)) {
      const { antonyms, seeAlso } = referencesFor(e, TODAY);
      for (const r of [...antonyms, ...seeAlso])
        if (r.word) expect(r.word.date <= TODAY).toBe(true);
    }
  });

  it("leaves a reference with two candidate words unlinked", () => {
    // 上 alone is うえ, かみ and じょう once all of them are open.
    const entry = WORD_ENTRIES.find((e) => e.term === "下" && e.kana === "げ")!;
    const ups = WORD_ENTRIES.filter((e) => e.term === "上");
    expect(ups.length).toBeGreaterThan(1);
    const { seeAlso } = referencesFor(entry, "2099-12-31");
    expect(seeAlso.find((r) => r.term === "上")?.word).toBeUndefined();
  });
});
