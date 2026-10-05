import { describe, it, expect } from "vitest";
import { renderOgImage } from "~/server/utils/og-image";
import { WORD_ENTRIES } from "~~/shared/words";

import { ogAssets } from "../mocks/og-assets";

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const size = (png: Uint8Array) => {
  const v = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { w: v.getUint32(16), h: v.getUint32(20) };
};

describe("renderOgImage", () => {
  it("draws a 1200 by 630 PNG for a word", async () => {
    const png = await renderOgImage(
      WORD_ENTRIES.find((e) => e.date === "2026-10-01")!,
      ogAssets,
    );
    expect([...png.slice(0, 8)]).toEqual(SIGNATURE);
    expect(size(png)).toEqual({ w: 1200, h: 630 });
    expect(png.length).toBeGreaterThan(10_000);
  });

  it("draws the longest word and the longest headline without failing", async () => {
    const longestTerm = [...WORD_ENTRIES].sort(
      (a, b) => [...b.term].length - [...a.term].length,
    )[0]!;
    const longestHeadline = [...WORD_ENTRIES].sort(
      (a, b) => b.headline.length - a.headline.length,
    )[0]!;
    for (const e of [longestTerm, longestHeadline]) {
      const png = await renderOgImage(e, ogAssets);
      expect(size(png)).toEqual({ w: 1200, h: 630 });
    }
  });

  it("draws every kind of entry: kana only, loanword, no layer, no breakdown", async () => {
    const kinds = [
      WORD_ENTRIES.find((e) => /^\p{sc=Hiragana}+$/u.test(e.term)),
      WORD_ENTRIES.find((e) => e.stratum === "gairaigo"),
      WORD_ENTRIES.find((e) => !e.stratum),
      WORD_ENTRIES.find((e) => e.morphemes.length === 0),
    ];
    for (const e of kinds) {
      expect(e).toBeDefined();
      expect(size(await renderOgImage(e!, ogAssets))).toEqual({
        w: 1200,
        h: 630,
      });
    }
  });
});
