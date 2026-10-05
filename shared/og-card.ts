/**
 * The share image of one word, as a tree satori draws: 1200 x 630, in the
 * palette of the season the word's day falls in. It shows only fields the
 * entry already has (the word, its reading, meaning, level, layer and the
 * hand-written headline), so it adds no claim. Data-free: the entry is passed
 * in, so this never imports the catalogue.
 */
import type { WordEntry } from "~~/types/index";
import { SEASONS, seasonForDate } from "./seasons";
import { WORD_STRATA } from "./word-labels";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
/** Japanese is drawn in the site's display face, Latin in its text face (which
 *  has the macron vowels, ō and ū, that romanised headlines are full of); each
 *  falls back to the other for what it lacks. */
export const OG_JAPANESE_FONT = "Zen Old Mincho";
export const OG_LATIN_FONT = "Outfit";
const JAPANESE = `${OG_JAPANESE_FONT}, ${OG_LATIN_FONT}`;
const LATIN = `${OG_LATIN_FONT}, ${OG_JAPANESE_FONT}`;

const PAPER = "#fdfbf7";
const INK = "#2e231c";
const MUTED = "#6b5d52";

type Style = Record<string, string | number>;
export interface CardNode {
  type: string;
  props: { style?: Style; children?: CardNode | CardNode[] | string };
}

const el = (
  style: Style,
  children?: CardNode | CardNode[] | string,
): CardNode => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

/** Whether every character of `text` is one the card's fonts can draw
 *  (`server/assets/og/glyphs.json`, built by `pnpm assets:og-font`). */
export function canDraw(text: string, glyphs: ReadonlySet<string>): boolean {
  return [...text].every((c) => glyphs.has(c) || /\s/.test(c));
}

/** The reading as the card draws it: a source's fullwidth tilde (らい～) becomes
 *  the wave dash the font has. The same mark, not a change of reading. */
export const displayKana = (kana: string): string => kana.replace(/～/g, "〜");

/** The word is drawn as large as the card allows: long loanwords shrink. */
export function termFontSize(term: string): number {
  const chars = [...term].length;
  return Math.max(84, Math.min(250, Math.floor(1050 / chars)));
}

/** The season the word's day falls in (Japan's calendar), as in the site's look. */
export function cardSeason(date: string) {
  return SEASONS[seasonForDate(new Date(`${date}T00:00:00+09:00`))];
}

/** `glyphs` is what the fonts can draw; a headline they cannot draw is left
 *  out rather than shown with empty boxes. Without it everything is drawn. */
export function ogCard(
  entry: WordEntry,
  glyphs?: ReadonlySet<string>,
): CardNode {
  const season = cardSeason(entry.date);
  const { primary, secondary } = season.palette.light;
  const layer = entry.stratum ? WORD_STRATA[entry.stratum] : undefined;

  const pill = (text: string, color: string, filled = false) =>
    el(
      {
        padding: "6px 18px",
        borderRadius: 999,
        border: `2px solid ${color}`,
        backgroundColor: filled ? color : "transparent",
        color: filled ? PAPER : color,
        fontSize: 26,
      },
      text,
    );

  return el(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      backgroundColor: PAPER,
      color: INK,
      fontFamily: LATIN,
      fontWeight: 700,
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "44px 64px 48px 64px",
      borderLeft: `22px solid ${primary.hex}`,
      borderBottom: `10px solid ${secondary.hex}`,
    },
    [
      el({ justifyContent: "space-between", alignItems: "center" }, [
        el(
          { fontSize: 32, color: primary.hex, letterSpacing: 1 },
          "NipponDaily",
        ),
        el({ alignItems: "center", gap: 14, fontSize: 26, color: MUTED }, [
          el({}, entry.date),
          pill(entry.level, primary.hex, true),
        ]),
      ]),
      el({ flexDirection: "column" }, [
        el(
          {
            fontSize: termFontSize(entry.term),
            lineHeight: 1.05,
            color: INK,
            fontFamily: JAPANESE,
          },
          entry.term,
        ),
        el({ alignItems: "center", gap: 20, marginTop: 6 }, [
          // A word written in kana only would show the same text twice.
          entry.kana === entry.term
            ? el({})
            : el(
                { fontSize: 50, color: primary.hex, fontFamily: JAPANESE },
                displayKana(entry.kana),
              ),
          layer
            ? pill(`${layer.native} ${layer.label}`, secondary.hex)
            : el({}),
        ]),
        el(
          {
            fontSize: 38,
            marginTop: 10,
            lineClamp: 2,
          },
          entry.meaning,
        ),
      ]),
      glyphs && !canDraw(entry.headline, glyphs)
        ? el({})
        : el(
            { fontSize: 29, lineHeight: 1.3, color: MUTED, lineClamp: 3 },
            entry.headline,
          ),
    ],
  );
}
