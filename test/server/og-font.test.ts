import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import opentype from "opentype.js";
import { WORD_ENTRIES } from "~~/shared/words";
import { WORD_STRATA } from "~~/shared/word-labels";
import { canDraw, displayKana } from "~~/shared/og-card";
import { ogAssets } from "../mocks/og-assets";

const DIR = join(process.cwd(), "server/assets/og");
const parse = (name: string) => {
  const b = readFileSync(join(DIR, name));
  return opentype.parse(
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength),
  );
};
const fonts = [
  "zen-old-mincho-bold.ttf",
  "outfit-latin-700.woff",
  "outfit-latin-ext-700.woff",
].map(parse);

const drawable = (c: string) => fonts.some((f) => f.charToGlyphIndex(c) > 0);
const missing = (text: string): string[] =>
  [...new Set(text)].filter((c) => !/\s/.test(c) && !drawable(c));

describe("the share-image fonts", () => {
  it("ship with their licences", () => {
    for (const f of ["OFL.txt", "OFL-outfit.txt"])
      expect(existsSync(join(DIR, f)), f).toBe(true);
  });

  it("are small enough to ship with the server", () => {
    const bytes = [
      "zen-old-mincho-bold.ttf",
      "outfit-latin-700.woff",
      "outfit-latin-ext-700.woff",
    ].reduce((n, f) => n + readFileSync(join(DIR, f)).length, 0);
    expect(bytes).toBeLessThan(2 * 1024 * 1024);
  });

  it("draw the word, reading, meaning, date and level of every entry, upcoming included", () => {
    // Run `pnpm assets:og-font` after adding words with a new kanji.
    const text = WORD_ENTRIES.map(
      (e) => e.term + displayKana(e.kana) + e.meaning + e.date + e.level,
    ).join("");
    expect(missing(text)).toEqual([]);
  });

  it("draw the marks and layer names the card adds itself", () => {
    const own =
      "NipponDaily 0123456789-:" +
      Object.values(WORD_STRATA)
        .map((s) => s.native + s.label)
        .join("");
    expect(missing(own)).toEqual([]);
  });

  it("have a glyph list that agrees with the fonts, character by character", () => {
    const listed = [...ogAssets.glyphs];
    expect(listed.filter((c) => !drawable(c))).toEqual([]);
    const all = [...new Set(WORD_ENTRIES.map((e) => e.headline).join(""))];
    expect(all.filter((c) => drawable(c) && !ogAssets.glyphs.has(c))).toEqual(
      [],
    );
  });

  it("let nearly every headline be drawn, so a card rarely loses its hook", () => {
    const drawn = WORD_ENTRIES.filter((e) =>
      canDraw(e.headline, ogAssets.glyphs),
    ).length;
    expect(drawn / WORD_ENTRIES.length).toBeGreaterThan(0.94);
  });
});
