/**
 * Meaning helpers shared by the daily game (server/utils/daily-game.ts),
 * the vocab pool service (server/services/n5-data.ts), and the lesson
 * path's flip-card review (app/pages/learn/[lesson].vue), so every place a
 * word's meaning is shown or quizzed agrees on what that meaning is.
 */

/** How many KANJIDIC2 meanings a kanji answer shows — enough to cover a
 *  character's main senses (日: "day, sun, Japan") without turning a
 *  multiple-choice option into a paragraph. */
export const KANJI_MEANING_LIMIT = 3;

/**
 * A kanji's answer text: its first few distinct KANJIDIC2 meanings joined
 * together, instead of only the first one. Many N5 kanji carry several
 * equally common senses (日 day/sun/Japan, 上 above/up, 生 life/birth), and
 * showing just one hid the rest from the player.
 */
export function kanjiMeaningLabel(
  meanings: readonly string[],
  limit = KANJI_MEANING_LIMIT,
): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of meanings) {
    const meaning = raw.trim();
    const key = meaning.toLowerCase();
    if (!meaning || seen.has(key)) continue;
    seen.add(key);
    out.push(meaning);
    if (out.length >= limit) break;
  }
  return out.join(", ");
}

/**
 * Fuller glosses for N5 words whose source-list meaning (elzup/jlpt-word-list)
 * names only one of several everyday senses — e.g. 早い was only "early",
 * though it's just as often "quick", and 取る only covered "take (a class)".
 * Keyed by `term kana` (like scripts/seed-n5-data.mjs's overrides) so a
 * homograph with a different reading is never touched. Applied at read time
 * by server/services/n5-data.ts, so no re-seed is needed.
 */
export const VOCAB_MEANING_ENRICHMENTS: Record<string, string> = {
  "取る とる": "to take, to pick up; to get (a grade); to take (a class)",
  "早い はやい": "early; quick, soon",
  "鳥 とり": "bird; chicken",
  "口 くち": "mouth; opening; job opening",
  "つける つける": "to turn on (e.g., a light); to attach, to put on",
  "次 つぎ": "next, following",
  "方 かた": "person (polite form of 人); way of doing",
  "出る でる": "to leave, to go out; to appear; to attend",
  "見る みる": "to see, to look at, to watch",
  "立つ たつ": "to stand, to stand up; to rise",
  "止まる とまる": "to stop, to come to a halt",
  "始まる はじまる": "(something) begins, to start",
  "終る おわる": "to finish, to end, to close",
  "降りる おりる": "to get off (a vehicle); to go down, to descend",
  "分かる わかる": "to understand; to know, to find out",
  "吸う すう": "to breathe in, to suck; to smoke",
  "飲む のむ": "to drink; to take (medicine)",
  "忘れる わすれる": "to forget; to leave behind",
  "頭 あたま": "head; mind, brains",
  "手 て": "hand; arm",
  "本当 ほんとう": "truth, reality; real, true",
  "薄い うすい": "thin; weak (e.g., tea); pale (colour)",
  "そちら そちら": "that way, there (near you); you (polite)",
  "そっち そっち": "that way, there (near you)",
  "いかが いかが": "how about…?, how (polite)",
  "暖かい あたたかい": "warm, mild (weather)",
  "上げる あげる": "to raise, to lift; to give",
  "かかる かかる": "to take (time, money); to hang",
};

/**
 * Corrections to a word's written form or reading where the source word list
 * is simply wrong, verified against JMdict (each `reason` cites the entry).
 * Applied at read time with the word's id unchanged, so lessons and game
 * references keep working with no re-seed. test/content/ checks every
 * served word — corrected or not — against data/reference/n5-reference.json,
 * so a wrong form in the list fails CI until it's corrected here.
 */
export interface VocabFormCorrection {
  term?: string;
  kana?: string;
  romaji?: string;
  meaning?: string;
  reason: string;
}

export const VOCAB_FORM_CORRECTIONS: Record<string, VocabFormCorrection> = {
  "伯父 おじさん": {
    term: "伯父さん",
    reason:
      "The list pairs 伯父 (read おじ) with the reading おじさん; the おじさん word ('uncle; middle-aged man') is written 伯父さん (JMdict 2261490).",
  },
  // Rōmaji: the seed converts kana letter by letter, but は used as a
  // particle is pronounced わ — では is "dewa", not "deha".
  "では では": {
    romaji: "dewa",
    reason: "The は in では is the topic particle, pronounced わ.",
  },
  "それでは それでは": {
    romaji: "soredewa",
    reason: "The は in それでは is the topic particle, pronounced わ.",
  },
  "ラジオカセ ラジオカセ": {
    term: "ラジカセ",
    kana: "ラジカセ",
    romaji: "rajikase",
    meaning: "radio-cassette player",
    reason:
      "ラジオカセ is not a word; the radio-cassette player is ラジカセ (JMdict 1138960).",
  },
};

/** A pool vocab entry as the site serves it: form corrections and meaning
 *  enrichments applied, id untouched. */
export function servedVocab<
  T extends { term: string; kana: string; romaji: string; meaning: string },
>(vocab: T): T {
  const key = `${vocab.term} ${vocab.kana}`;
  const { reason: _reason, ...fix } = VOCAB_FORM_CORRECTIONS[key] ?? {
    reason: "",
  };
  return { ...vocab, meaning: enrichedVocabMeaning(vocab), ...fix };
}

/** A vocab entry's meaning with VOCAB_MEANING_ENRICHMENTS applied. */
export function enrichedVocabMeaning(vocab: {
  term: string;
  kana: string;
  meaning: string;
}): string {
  return (
    VOCAB_MEANING_ENRICHMENTS[`${vocab.term} ${vocab.kana}`] ?? vocab.meaning
  );
}

// Words too generic to say two glosses mean the same thing.
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "at",
  "is",
  "be",
  "and",
  "or",
  "for",
  "as",
  "by",
  "with",
  "from",
  "one",
  "ones",
  "etc",
  "abbr",
  "lit",
  "polite",
  "humble",
  "formal",
  "casual",
  "honorific",
  "hon",
  "counter",
  "something",
  "someone",
  "thing",
  "things",
  "very",
  "not",
  "e.g",
  "eg",
  "v.t",
  "v.i",
  "my",
  "your",
  "number",
  "day",
  "days",
]);

/** The content words of a gloss, lower-cased, with a trailing plural "s"
 *  folded so "shoe"/"shoes" count as the same word. */
export function meaningWords(text: string): Set<string> {
  const words = new Set<string>();
  for (const raw of text
    .toLowerCase()
    .replace(/[()~～,;:./!?'"…\-–—]/g, " ")
    .split(/\s+/)) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    words.add(raw.length > 3 && raw.endsWith("s") ? raw.slice(0, -1) : raw);
  }
  return words;
}

/**
 * True when two answers could both pass as correct — identical text, or a
 * shared content word ("hot (objects)" vs "hot (weather), warm"; "to be,
 * to have" for both 在る and 有る). Used to keep such pairs out of the same
 * multiple-choice question.
 */
export function meaningsOverlap(a: string, b: string): boolean {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true;
  const wordsA = meaningWords(a);
  for (const word of meaningWords(b)) {
    if (wordsA.has(word)) return true;
  }
  return false;
}

/**
 * Picks `count` distractor answers from `candidates` (already shuffled by
 * the caller) that can't be confused with `correct` or with each other.
 * If the pool is too small to satisfy that, it tops up with any answer
 * whose text simply differs — a question never ends up with duplicate
 * choices either way.
 */
export function pickDistractors(
  correct: string,
  candidates: readonly string[],
  count: number,
): string[] {
  const picked: string[] = [];
  for (const candidate of candidates) {
    if (picked.length >= count) break;
    if (meaningsOverlap(candidate, correct)) continue;
    if (picked.some((p) => meaningsOverlap(p, candidate))) continue;
    picked.push(candidate);
  }
  if (picked.length < count) {
    const used = new Set([correct, ...picked].map((a) => a.toLowerCase()));
    for (const candidate of candidates) {
      if (picked.length >= count) break;
      const key = candidate.toLowerCase();
      if (used.has(key)) continue;
      used.add(key);
      picked.push(candidate);
    }
  }
  return picked;
}
