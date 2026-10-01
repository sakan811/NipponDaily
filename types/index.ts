export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}

// --- JLPT ---

/** The JLPT levels the daily words are drawn from — see shared/jlpt.ts's
 *  JLPT_LEVELS for the runtime-checkable version of this same set. */
export type JlptLevel = "N5" | "N4" | "N3" | "N2";

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

/** One line of Wiktionary's Etymology section for this word's reading, quoted
 *  verbatim from the pinned snapshot in data/reference/etymology-reference.json. */
export interface WordSource {
  quote: string;
}

/** One daily word — the unit of data/words/YYYY-MM.json, served by
 *  GET /api/daily-word.
 *
 *  Only `date`, `term` and `headline` are hand-written (data/word-plan/).
 *  Every other field is generated from sources by scripts/lib/word-entry.mjs
 *  (`pnpm data:words`): the pool/JMdict/KANJIDIC2 snapshots and the pinned
 *  Wiktionary text. test/content/ regenerates and compares, so a derived
 *  field can't be edited by hand or drift. */
export interface WordEntry {
  /** YYYY-MM-DD — the day this word is revealed (JST). */
  date: string;
  term: string;
  /** The word's full reading. */
  kana: string;
  /** Served meaning — identical to the pool's (JMdict-checked) meaning. */
  meaning: string;
  level: JlptLevel;
  /** JMdict's own part-of-speech tags for the sense the meaning came from,
   *  verbatim (e.g. "Ichidan verb", "transitive verb"). Empty only when JMdict
   *  has no entry for the word. */
  pos: string[];
  /** The layer of the vocabulary — present only when KANJIDIC2's readings
   *  (or the evidence) establish it; irregular spellings leave it out. */
  stratum?: WordStratum;
  processes: WordProcess[];
  /** The one hand-written line (data/word-plan/): a hook, not a claim. */
  headline: string;
  /** The word's parts, left to right — parsed from the Wiktionary lines, and
   *  present only when they literally spell the word and join to its reading.
   *  Empty when the source gives no clean breakdown. */
  morphemes: Morpheme[];
  /** What Wiktionary says about the word's origin, line by line, verbatim. */
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
