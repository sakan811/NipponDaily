/**
 * Meaning helpers shared by the daily game (server/utils/daily-game.ts),
 * the vocab pool service (server/services/pool-data.ts), and the lesson
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
 * Keyed by `term kana` (like scripts/seed-pool-data.mjs's overrides) so a
 * homograph with a different reading is never touched. Applied at read time
 * by server/services/pool-data.ts, so no re-seed is needed.
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
 * references keep working with no re-seed. Applies across every seeded
 * level — keyed by `term kana` (the list's own raw columns), which never
 * collides across levels since each level seeds from its own word list.
 * test/content/ checks every served word — corrected or not — against that
 * level's own committed reference snapshot (currently N5's
 * data/reference/n5-reference.json and N4's data/reference/n4-reference.json
 * — see CLAUDE.md's Content Accuracy section), so a wrong form in the list
 * fails CI until it's corrected here.
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
  // N4 (elzup/jlpt-word-list's n4.csv): a run of rows have their term/kana
  // columns swapped (kana holding the kanji form, term holding the kana
  // spelling), wrapped in parenthetical/tilde grammar notation, or missing
  // okurigana — found via `pnpm data:reference:jlpt`'s unresolvedInJmdict
  // list and fixed the same way N5's own corrections were, one discovered
  // issue at a time (see CLAUDE.md's Content Accuracy section).
  "うそ 嘘": {
    term: "嘘",
    kana: "うそ",
    romaji: "uso",
    reason: "The list swaps term/kana; 嘘 read うそ is JMdict 1172400.",
  },
  "パート (タイム) パート (タイム)": {
    term: "パートタイム",
    kana: "パートタイム",
    romaji: "paatotaimu",
    reason:
      "The list wraps the term/kana in parenthetical notation; the word is パートタイム (JMdict 1100830).",
  },
  "いくら～ても いくら～ても": {
    term: "いくら",
    kana: "いくら",
    romaji: "ikura",
    reason:
      "～ても is a grammar collocation, not part of the headword — いくら itself already carries the 'however much, no matter how' sense (JMdict 1219980).",
  },
  "～(て) しまう ～(て) しまう": {
    term: "しまう",
    kana: "しまう",
    romaji: "shimau",
    reason:
      "The list's ～(て) notation marks the auxiliary's て-form attachment; the headword is the auxiliary verb しまう (JMdict 1305380).",
  },
  "いただく 頂く": {
    term: "頂く",
    kana: "いただく",
    romaji: "itadaku",
    reason: "The list swaps term/kana; 頂く read いただく is JMdict 1587290.",
  },
  "あいさつする 挨拶": {
    term: "挨拶する",
    kana: "あいさつする",
    romaji: "aisatsusuru",
    reason:
      "The list swaps term/kana and drops する from the reading; the suru-verb is 挨拶する read あいさつする (JMdict 1151120).",
  },
  "いっぱい 一杯": {
    term: "一杯",
    kana: "いっぱい",
    romaji: "ippai",
    reason: "The list swaps term/kana; 一杯 read いっぱい is JMdict 1165670.",
  },
  "お金持ち かねもち": {
    kana: "おかねもち",
    romaji: "okanemochi",
    reason:
      "The list's reading drops the leading お; お金持ち is read おかねもち (JMdict 2429350).",
  },
  "～(に) よると ～(に) よると": {
    term: "によると",
    kana: "によると",
    romaji: "niyoruto",
    reason:
      "によると is itself a JMdict entry ('according to', 1009670); the list's ～(に) notation isn't part of the headword.",
  },
  "堅 かたい": {
    term: "堅い",
    reason:
      "The list drops the okurigana; the word is 堅い read かたい (JMdict 1257110).",
  },
  "かっこう 格好": {
    term: "格好",
    kana: "かっこう",
    romaji: "kakkou",
    reason: "The list swaps term/kana; 格好 read かっこう is JMdict 1590480.",
  },
  "回る、回す まわる、まわす": {
    term: "回る",
    kana: "まわる",
    romaji: "mawaru",
    meaning: "to turn, to go around, to revolve",
    reason:
      "The list combines two related verbs (回る intransitive, 回す transitive) into one row; kept as 回る, the intransitive base form (JMdict 1604300), since one pool entry can only carry one headword.",
  },
  "スーパー (マーケット) スーパー (マーケット)": {
    term: "スーパーマーケット",
    kana: "スーパーマーケット",
    romaji: "suupaamaaketto",
    reason:
      "The list wraps the term/kana in parenthetical notation; the word is スーパーマーケット (JMdict 1066930).",
  },
  "～(に) ついて ～(に) ついて": {
    term: "について",
    kana: "について",
    romaji: "nitsuite",
    reason:
      "について is itself a JMdict entry ('concerning, regarding', 1009780); the list's ～(に) notation isn't part of the headword.",
  },
  "真中 まんなか": {
    term: "真ん中",
    reason:
      "The list drops the okurigana ん; the word is 真ん中 read まんなか (JMdict 1604350).",
  },
  "おかげ お陰": {
    term: "お陰",
    kana: "おかげ",
    romaji: "okage",
    reason: "The list swaps term/kana; お陰 read おかげ is JMdict 1001640.",
  },
  "うれしい 嬉しい": {
    term: "嬉しい",
    kana: "うれしい",
    romaji: "ureshii",
    reason: "The list swaps term/kana; 嬉しい read うれしい is JMdict 1219510.",
  },
  "または または": {
    romaji: "matawa",
    reason: "The は in または is the topic particle, pronounced わ.",
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
