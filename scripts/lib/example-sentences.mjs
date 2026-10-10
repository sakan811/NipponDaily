/**
 * Picks the example sentences of a word from a Tatoeba export (see
 * scripts/lib/tatoeba-export.mjs). Pure and deterministic: no model writes or
 * chooses anything, and a sentence is only used when the corpus itself indexes
 * it under this word.
 *
 * A sentence qualifies when
 *  - the corpus's index lists the word's spelling as one of its dictionary
 *    words, with the reading `kana` if the index says which reading (and, for a
 *    spelling JMdict reads several ways, only when it does say, since 今日 may
 *    be きょう or こんにち);
 *  - the form the index says the word takes in it (食べた for 食べる) is really
 *    in the sentence's text, is at least two characters or contains a kanji,
 *    so a single kana cannot stand for a word, and is the word itself: its own
 *    spelling, an inflection that keeps its first character, or the word in
 *    kana. The corpus also files other spellings (１日 for 一日, 弾 for 玉)
 *    under a headword; they are left out;
 *  - it has an English translation, and is short enough to read at a glance;
 *  - neither side holds a word on the small filter below.
 * The sentences with the fewest kanji left without a reading win (when the
 * caller can say), then the shortest, then the lowest id.
 */
import { toHiragana } from "wanakana";
import { MAX_EXAMPLES } from "../../shared/limits.ts";
/** Sentence length, in characters, a card can show. */
export const SENTENCE_LENGTH = { min: 6, max: 40 };

/** Words that keep an automatic pick off a page read by anyone. It is a filter,
 *  not a review: skim the sentences of each new month. */
const UNWANTED_EN =
  /\b(sex\w*|fuck\w*|shit\w*|rap(?:e|ed|ing|ist)|porn\w*|nude|naked|kill\w*|murder\w*|suicid\w*|nazi\w*|bitch\w*|slut\w*|whore\w*|penis|vagina|dick|cock|pussy|asshole|molest\w*|prostitut\w*|terroris\w*)\b/i;
const UNWANTED_JA = /殺|強姦|レイプ|自殺|セックス|ポルノ|売春|裸|エッチ|変態/;

const HAN = /\p{sc=Han}/u;
const KANA_ONLY = /^[\p{sc=Hiragana}\p{sc=Katakana}ー]+$/u;
const len = (s) => [...s].length;

/** The example sentences for a word: [{ id, ja, en, enId, form }].
 *  `word` is { term, kana, spellingReadings? }; `corpus` is readExport()'s result. */
export function pickExamples(word, corpus, max = MAX_EXAMPLES, unread) {
  const { term, kana, spellingReadings } = word;
  const want = toHiragana(kana);
  const shared = (spellingReadings?.length ?? 0) > 1;
  const found = [];
  for (const hit of corpus.index.get(term) ?? []) {
    if (hit.reading) {
      if (toHiragana(hit.reading) !== want) continue;
    } else if (shared) {
      // The index gives no reading for this spelling: only a kana form that is
      // the word's own reading settles which word it is.
      if (!hit.form || toHiragana(hit.form) !== want) continue;
    }
    const ja = corpus.jpn.get(hit.id);
    if (!ja) continue;
    const form = hit.form ?? term;
    if (!ja.includes(form) || (len(form) < 2 && !HAN.test(form))) continue;
    if (!form.startsWith([...term][0]) && !KANA_ONLY.test(form)) continue;
    if (len(ja) < SENTENCE_LENGTH.min || len(ja) > SENTENCE_LENGTH.max)
      continue;
    // The translation the index points at, else the lowest-numbered one.
    const linked = (corpus.links.get(hit.id) ?? []).filter((id) =>
      corpus.eng.has(id),
    );
    const enId = linked.includes(hit.translation)
      ? hit.translation
      : [...linked].sort((a, b) => Number(a) - Number(b))[0];
    if (!enId) continue;
    const en = corpus.eng.get(enId);
    if (UNWANTED_EN.test(en) || UNWANTED_JA.test(ja)) continue;
    found.push({ id: Number(hit.id), ja, en, enId: Number(enId), form });
  }
  // `unread(sentence)` counts the kanji the page could not give a reading: the
  // fewest come first, so a word is shown in a sentence a learner can read.
  const missing = new Map(found.map((s) => [s, unread?.(s) ?? 0]));
  found.sort(
    (a, b) =>
      missing.get(a) - missing.get(b) || len(a.ja) - len(b.ja) || a.id - b.id,
  );
  const seen = new Set();
  return found.filter((s) => !seen.has(s.ja) && seen.add(s.ja)).slice(0, max);
}
