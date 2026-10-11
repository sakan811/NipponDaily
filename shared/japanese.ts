/**
 * How the app and the data scripts tell kanji and kana apart, written once: the
 * range that counts as a kanji, and katakana folded to hiragana. The kanji
 * records, the reference builders, the dictionary reader and the search all
 * read these, so they cannot disagree about what a kanji is. Data-free and
 * import-free (the scripts import it through node's type stripping).
 */

/** The ranges of a regular expression class that hold a kanji: CJK Unified
 *  Ideographs and Extension A. Not 々 or 〆, which repeat or abbreviate. */
export const KANJI_CHARS = "㐀-䶿一-鿿";

/** Every kanji in `text`, in order, repeats included. */
export const kanjiIn = (text: string): string[] =>
  text.match(new RegExp(`[${KANJI_CHARS}]`, "gu")) ?? [];

/** The distinct kanji of `text`, in the order they first appear. */
export const distinctKanji = (text: string): string[] => [
  ...new Set(kanjiIn(text)),
];

/** Whether `text` has a kanji, or 々 (the mark that repeats one). */
export const hasKanji = (text: string): boolean =>
  new RegExp(`[${KANJI_CHARS}々]`, "u").test(text);

/** Hiragana, katakana, kanji, 々 and the long-vowel mark: the characters a
 *  Japanese word is written with. */
export const JAPANESE_CHARS = `぀-ヿ${KANJI_CHARS}々ー`;

/** Katakana ァ–ヶ shifted to hiragana, so ラジオ equals らじお. Leaves
 *  everything else alone (wanakana would also turn romaji into kana). */
export const katakanaToHiragana = (text: string): string =>
  text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
