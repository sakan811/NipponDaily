/**
 * Pitch accent, from the mora number after which the pitch falls.
 *
 * An entry's `pitch` holds those numbers exactly as the accent dictionary
 * gives them (0: the pitch never falls, 1: it falls after the first mora…).
 * Everything here only lays that number over the word's own kana, so a reader
 * can see it; it adds no new fact. Used by the page, the pitch builder and the
 * tests.
 */

/** Kana that join the mora before them (きゃ, ファ) rather than make their own. */
const COMBINING = /[ゃゅょゎぁぃぅぇぉャュョヮァィゥェォ]/;

/** A reading cut into morae (the beats pitch is counted in): ちょっと is
 *  ちょ, っ, と; ニッポン is ニ, ッ, ポ, ン; ラーメン is ラ, ー, メ, ン. */
export function moraeOf(kana: string): string[] {
  const morae: string[] = [];
  for (const ch of kana) {
    if (COMBINING.test(ch) && morae.length) morae[morae.length - 1] += ch;
    else morae.push(ch);
  }
  return morae;
}

/** High (`true`) or low (`false`) for each of `count` morae. */
export function pitchContour(count: number, accent: number): boolean[] {
  return Array.from({ length: count }, (_, i) => {
    const mora = i + 1;
    if (accent === 0) return mora > 1; // flat: low, then high
    if (accent === 1) return mora === 1; // falls after the first
    return mora > 1 && mora <= accent;
  });
}

export type PitchType = "heiban" | "atamadaka" | "nakadaka" | "odaka";

/** The name of an accent pattern in a word of `count` morae. */
export function pitchType(count: number, accent: number): PitchType {
  if (accent === 0) return "heiban";
  if (accent === 1) return "atamadaka";
  return accent === count ? "odaka" : "nakadaka";
}

/** What each pattern means, for people who do not know the names. */
export const PITCH_TYPES: Record<PitchType, { label: string; hint: string }> = {
  heiban: {
    label: "flat (heiban)",
    hint: "Low on the first mora, then high, and it does not fall afterwards, not even on a following particle.",
  },
  atamadaka: {
    label: "head-high (atamadaka)",
    hint: "High on the first mora, then it falls.",
  },
  nakadaka: {
    label: "middle-high (nakadaka)",
    hint: "Low on the first mora, high through the accented mora, then it falls.",
  },
  odaka: {
    label: "tail-high (odaka)",
    hint: "Low on the first mora, high to the end, and it falls on a following particle.",
  },
};
