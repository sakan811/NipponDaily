export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}

// --- JLPT LEARNING POOL ---

/** The JLPT levels NipponDaily has a seeded pool for — see shared/jlpt.ts's
 *  JLPT_LEVELS for the runtime-checkable version of this same set. The daily
 *  words (data/words/) are drawn from all four; see docs/content-accuracy.md. */
export type JlptLevel = "N5" | "N4" | "N3" | "N2";

export type KanaScript = "hiragana" | "katakana";

/** One hiragana or katakana character (base gojūon or a dakuten/digraph
 *  variant). Hardcoded seed data — see scripts/seed-pool-data.mjs. */
export interface KanaCharacter {
  id: string;
  char: string;
  script: KanaScript;
  /** Hepburn rōmaji, derived via wanakana at seed time. */
  romaji: string;
}

/** One kanji from a level's pool, enriched from KANJIDIC2. */
export interface PoolKanji {
  id: string;
  character: string;
  /** English meanings from KANJIDIC2. */
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  strokeCount: number;
  jlptLevel: JlptLevel;
}

/** One vocabulary word from a level's pool, cross-referenced against JMdict. */
export interface PoolVocab {
  id: string;
  /** Kanji/kana surface form, e.g. "食べる". */
  term: string;
  /** Kana reading. */
  kana: string;
  /** Hepburn rōmaji, derived via wanakana at seed time. */
  romaji: string;
  meaning: string;
  partOfSpeech?: string;
  jlptLevel: JlptLevel;
}

// --- DAILY WORD ---

/** Which layer of the Japanese vocabulary a word belongs to — 和語 native,
 *  漢語 Sino-Japanese, 外来語 loanword, or a 混種語 hybrid of layers. */
export type WordStratum = "wago" | "kango" | "gairaigo" | "hybrid";

/** The linguistic processes a daily word can illustrate — the closed set
 *  shared/words.ts labels and explains (WORD_PROCESSES). */
export type WordProcess =
  | "compound"
  | "derivation"
  | "rendaku"
  | "wasei"
  | "borrowing"
  | "clipping"
  | "sound-change"
  | "meaning-shift"
  | "ateji"
  | "reread"
  | "unclear";

/** One building block of a word, as it is read in that word. */
export interface Morpheme {
  /** The morpheme as written in the word (kanji, kana, or both with okurigana). */
  text: string;
  /** Its surface reading inside this word, in hiragana (after rendaku etc.). */
  reading: string;
  /** The reading before rendaku/sokuon changed it, when it differs. */
  base?: string;
  /** A gloss — for a single kanji, one of its KANJIDIC2 meanings. */
  meaning: string;
  /** Set when the reading is not one of the kanji's dictionary readings
   *  (ateji, jukujikun, archaic forms), so the content test skips that check. */
  irregular?: boolean;
}

/** One cited line of evidence — a verbatim quote from the pinned Wiktionary
 *  etymology in data/reference/etymology-reference.json. */
export interface WordSource {
  quote: string;
}

/** One daily word's linguistic write-up — the unit of data/words/YYYY-MM.json,
 *  served by GET /api/daily-word. Every field is checked in CI (see
 *  test/content/words.test.ts). */
export interface WordEntry {
  /** YYYY-MM-DD — the day this word is revealed (JST). */
  date: string;
  term: string;
  /** The word's full reading. */
  kana: string;
  /** Served meaning — identical to the pool's (JMdict-checked) meaning. */
  meaning: string;
  level: JlptLevel;
  stratum: WordStratum;
  processes: WordProcess[];
  /** One sentence that earns the reader's click. */
  headline: string;
  /** The word's parts, left to right. Empty when the origin is unknown and
   *  no breakdown can be defended. */
  morphemes: Morpheme[];
  /** The reading the morphemes join to when it is not `kana` — an earlier
   *  form sound change has since altered (夢: いめ → ゆめ), or the word's other
   *  reading in the pool (梅雨: ばいう vs つゆ). Omitted when they join to `kana`. */
  partsReading?: string;
  /** The write-up: short paragraphs of English that may quote Japanese
   *  forms, but only ones the cited evidence itself contains. */
  story: string[];
  /** Set when sources disagree or the origin is unknown — shown prominently. */
  uncertainty?: string;
  sources: WordSource[];
  /** The Wiktionary revision the sources were quoted from. */
  wiktionaryRev: number;
}

/** A pointer to a neighbouring open day, for prev/next navigation. */
export interface WordNeighbor {
  date: string;
  term: string;
}

/** What GET /api/daily-word returns: the entry plus its open neighbours. */
export interface DailyWordPayload {
  entry: WordEntry;
  /** The previous day with a word, if any. */
  prev: WordNeighbor | null;
  /** The next day with a word — only once that day has itself arrived. */
  next: WordNeighbor | null;
}

/** What GET /api/word-calendar returns for one day of a month. */
export interface WordCalendarDay {
  date: string;
  /** "open" once the day has arrived (today or earlier, JST); "upcoming" before. */
  status: "open" | "upcoming";
  /** Only present when open — an upcoming day reveals nothing. */
  term?: string;
  kana?: string;
  stratum?: WordStratum;
}

// --- SITE THEME ---

/**
 * Closed set of seasonal design presets. Deliberately kept in lockstep with
 * the [data-season="..."] blocks actually defined in
 * app/assets/css/tailwind.css (see shared/seasons.ts SEASON_IDS) — a season
 * only belongs in this union once it has a matching CSS preset.
 */
export type SeasonId = "sakura" | "summer" | "autumn" | "winter";

/**
 * NipponDaily's site-wide season — persisted at n5:site_theme and served by
 * GET /api/site-theme. Applied as a data-season attribute on <html>, which
 * the [data-season] blocks in tailwind.css key off of.
 */
export interface SiteTheme {
  season: SeasonId;
  updatedAt: number;
  /** Who wrote it: the daily season cron, or GET /api/site-theme's fallback. */
  source: "cron" | "fallback";
}
