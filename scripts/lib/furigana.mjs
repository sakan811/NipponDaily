/**
 * Furigana for an example sentence, kept only where two independent sources
 * agree. Pure and deterministic: no model supplies or chooses a reading.
 *
 * kuromoji (the IPADIC dictionary) reads each token of the sentence, but it
 * picks a reading by statistics and gets some wrong (後 as ご where the
 * sentence means のち, 柵 as しがらみ for さく). So a token's reading is kept
 * only when
 *  - Tatoeba's own index gives the dictionary word a reading and kuromoji
 *    reads the token the same way; or
 *  - the index is silent and JMdict gives that spelling exactly one reading,
 *    which kuromoji also reads.
 * A spelling JMdict reads several ways (今日, 何, 私) with no index reading to
 * settle it, a token the sources disagree on, and anything that is not plain
 * kanji with hiragana okurigana get no ruby; the sentence keeps its plain
 * text there.
 *
 * The result is a list of parts that, joined, give the sentence back
 * unchanged: `[text]` for plain text, `[kanji, reading]` for kanji with a
 * reading.
 */
import { toHiragana } from "wanakana";

const HAN = "\\p{sc=Han}々";
/** hiragana prefix, a run of kanji, hiragana okurigana */
const SHAPE = new RegExp(
  `^(\\p{sc=Hiragana}*)([${HAN}]+)(\\p{sc=Hiragana}*)$`,
  "u",
);

/**
 * @param {string} ja the sentence
 * @param {string} form the word's own form in it (食べた), which no reading
 *   may straddle: the page marks it, so a token that crosses its edge is left plain
 * @param {{ surface_form: string, reading?: string, basic_form?: string }[]} tokens
 *   kuromoji's tokens of `ja`
 * @param {{ indexReadings: Map<string, string>, jmdictReadings: (spelling: string) => string[] }} sources
 *   Tatoeba's index readings for this sentence by dictionary word (hiragana),
 *   and every reading JMdict gives a spelling
 * @returns {string[][] | undefined} the parts, or undefined when no kanji got a reading
 */
export function furiganaFor(
  ja,
  form,
  tokens,
  { indexReadings, jmdictReadings },
) {
  if (tokens.map((t) => t.surface_form).join("") !== ja) return undefined;

  /** The reading both sources stand behind for a dictionary word, if any. */
  const attested = (word) => {
    const indexed = indexReadings.get(word);
    if (indexed) return indexed;
    const all = [...new Set(jmdictReadings(word).map(toHiragana))];
    return all.length === 1 ? all[0] : undefined;
  };

  const at = ja.indexOf(form);
  const edges = at < 0 ? [] : [at, at + form.length];

  const parts = [];
  const push = (text, reading) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (!reading && last && last.length === 1) last[0] += text;
    else parts.push(reading ? [text, reading] : [text]);
  };

  let offset = 0;
  for (const token of tokens) {
    const surface = token.surface_form;
    const reading = readingOf(token, attested);
    const end = offset + surface.length;
    const straddles = edges.some((e) => e > offset && e < end);
    const m = SHAPE.exec(surface);
    if (!reading || straddles || !m) push(surface);
    else {
      push(m[1]);
      push(m[2], reading);
      push(m[3]);
    }
    offset = end;
  }
  return parts.some((p) => p.length === 2) ? parts : undefined;
}

/** The verified reading of a token's kanji run, or undefined. */
function readingOf(token, attested) {
  const surface = token.surface_form;
  const m = SHAPE.exec(surface);
  if (!m || !token.reading || token.reading === "*") return undefined;
  const [, prefix, , suffix] = m;
  const heard = toHiragana(token.reading);
  if (
    !heard.startsWith(prefix) ||
    !heard.endsWith(suffix) ||
    heard.length <= prefix.length + suffix.length
  )
    return undefined;
  const kanjiReading = heard.slice(prefix.length, heard.length - suffix.length);

  const base =
    token.basic_form && token.basic_form !== "*" ? token.basic_form : surface;
  if (base === surface)
    return attested(surface) === heard ? kanjiReading : undefined;

  // An inflected token (怒っ for 怒る): its kanji must be the dictionary
  // word's own, and read like its stem.
  const b = SHAPE.exec(base);
  if (!b || prefix || b[1] || b[2] !== m[2]) return undefined;
  const dictionary = attested(base);
  if (!dictionary || !dictionary.endsWith(b[3])) return undefined;
  return dictionary.slice(0, dictionary.length - b[3].length) === kanjiReading
    ? kanjiReading
    : undefined;
}
