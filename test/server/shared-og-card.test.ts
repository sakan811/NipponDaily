import { describe, it, expect } from "vitest";
import {
  OG_HEIGHT,
  canDraw,
  displayKana,
  OG_WIDTH,
  cardSeason,
  ogCard,
  termFontSize,
  type CardNode,
} from "~~/shared/og-card";
import { WORD_ENTRIES } from "~~/shared/words";

const textOf = (n: CardNode | string | undefined): string[] => {
  if (n === undefined) return [];
  if (typeof n === "string") return [n];
  const c = n.props.children;
  return Array.isArray(c) ? c.flatMap(textOf) : textOf(c);
};

const entry = WORD_ENTRIES.find((e) => e.term === "電話")!;

describe("the share card", () => {
  it("is 1200 by 630", () => {
    expect(OG_WIDTH).toBe(1200);
    expect(OG_HEIGHT).toBe(630);
    const root = ogCard(entry).props.style!;
    expect(root.width).toBe(1200);
    expect(root.height).toBe(630);
  });

  it("shows the word's own fields and nothing else", () => {
    const text = textOf(ogCard(entry));
    expect(text).toEqual(
      expect.arrayContaining([
        "NipponDaily",
        entry.date,
        entry.level,
        entry.term,
        entry.kana,
        entry.meaning,
        entry.headline,
      ]),
    );
    expect(text).toContain("漢語 Sino-Japanese");
  });

  it("leaves the layer out when the entry states none", () => {
    const text = textOf(ogCard({ ...entry, stratum: undefined }));
    expect(
      text.some((t) => /Sino-Japanese|Native|Loanword|Hybrid/.test(t)),
    ).toBe(false);
  });

  it("uses the palette of the season the day falls in", () => {
    expect(cardSeason("2026-10-01").id).toBe("autumn");
    expect(cardSeason("2025-04-01").id).toBe("sakura");
    expect(cardSeason("2025-07-31").id).toBe("summer");
    // Japan's calendar, not UTC: midnight on 1 December in Tokyo is still 30 Nov UTC.
    expect(cardSeason("2025-12-01").id).toBe("winter");
    expect(cardSeason("2025-03-01").id).toBe("sakura");
    const style = ogCard({ ...entry, date: "2026-10-01" }).props.style!;
    expect(String(style.borderLeft)).toContain("#d26b38");
  });

  it("leaves out a headline the fonts cannot draw, and keeps the rest of the card", () => {
    const glyphs = new Set([...entry.term, ...entry.kana, ...entry.meaning]);
    const text = textOf(ogCard(entry, glyphs));
    expect(text).not.toContain(entry.headline);
    expect(text).toContain(entry.term);
    expect(textOf(ogCard(entry))).toContain(entry.headline);
  });

  it("checks characters, ignoring whitespace", () => {
    const glyphs = new Set(["a", "b"]);
    expect(canDraw("a b", glyphs)).toBe(true);
    expect(canDraw("a ɸ", glyphs)).toBe(false);
  });

  it("draws a source's fullwidth tilde as the wave dash its font has", () => {
    expect(displayKana("らい～")).toBe("らい〜");
    expect(displayKana("ひびき")).toBe("ひびき");
  });

  it("shrinks long words to fit and never below a readable size", () => {
    expect(termFontSize("手")).toBe(250);
    expect(termFontSize("電話")).toBe(250);
    expect(termFontSize("スーパーマーケット")).toBeLessThan(150);
    expect(termFontSize("あ".repeat(40))).toBe(84);
    for (const e of WORD_ENTRIES)
      expect(termFontSize(e.term) * [...e.term].length).toBeLessThanOrEqual(
        1050 + 84,
      );
  });
});
