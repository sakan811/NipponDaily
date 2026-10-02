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
  /** Set when the source text gives no split of the word, so this part is one
   *  of the word's own kanji and `meaning` is KANJIDIC2's dictionary sense of
   *  that character (which the word does not always use) — not a Wiktionary gloss. */
  glossSource?: "kanjidic2";
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

// --- PARTS (the morpheme index) ---

/** An open word, as the parts pages list it. */
export interface PartWordRef {
  date: string;
  term: string;
  kana: string;
  meaning: string;
  stratum?: WordStratum;
}

/** One recurring-or-not morpheme in the index: how many open words show it as a part. */
export interface PartSummary {
  text: string;
  /** Open words whose "Taken apart" row contains it. */
  count: number;
  /** Its distinct surface readings, most-used first. */
  readings: string[];
}

/** What GET /api/parts returns: every morpheme seen in an open word. */
export interface PartsIndexPayload {
  parts: PartSummary[];
}

/** One open word's use of a morpheme. */
export interface PartUse extends Pick<
  Morpheme,
  "meaning" | "base" | "irregular"
> {
  /** The reading it has in this word. */
  reading: string;
  word: PartWordRef;
  /** Every part of that word, left to right — so the page can link to the others. */
  parts: string[];
}

/** What GET /api/part?text= returns. */
export interface PartDetail {
  text: string;
  /** Open words showing it as a part. */
  count: number;
  /** The uses grouped by the reading it has in each word, most-used reading first. */
  readings: { reading: string; uses: PartUse[] }[];
  /** Open words whose spelling contains it but that show no breakdown with it —
   *  listed for orientation only: nothing is claimed about its role there. */
  alsoIn: PartWordRef[];
}

// --- EXPLORE (browse and filter) ---

/** An open word in a result list: enough to recognise it and link to its page. */
export interface WordSummary {
  date: string;
  term: string;
  kana: string;
  meaning: string;
  level: JlptLevel;
  stratum?: WordStratum;
  processes: WordProcess[];
  /** Whether its "Taken apart" row shows any parts. */
  hasParts: boolean;
}

/** The filters GET /api/explore accepts. Every one is optional; together they narrow. */
export interface ExploreFilters {
  /** Matches the term, the reading (katakana and hiragana alike) or the meaning. */
  q?: string;
  level?: JlptLevel;
  stratum?: WordStratum;
  process?: WordProcess;
  /** A part's text, as in /parts/<text>. */
  part?: string;
}

/** How many words a filter option would leave, given the other active filters. */
export interface FacetCount<T extends string> {
  value: T;
  count: number;
}

/** What GET /api/explore returns. */
export interface ExplorePayload {
  filters: ExploreFilters;
  /** Open words in all. */
  total: number;
  /** Open words matching every filter — the length of `words`. */
  count: number;
  /** The matches, newest first. */
  words: WordSummary[];
  /** Each facet counts the words matching every *other* filter, so choosing an
   *  option never shows a count it cannot deliver. */
  facets: {
    level: FacetCount<JlptLevel>[];
    stratum: FacetCount<WordStratum>[];
    process: FacetCount<WordProcess>[];
  };
}

// --- PATTERNS (counts across words) ---

/** A layer, or "unstated" when neither KANJIDIC2 nor the evidence establishes one. */
export type StratumKey = WordStratum | "unstated";

export interface PatternCount<T extends string> {
  value: T;
  count: number;
}

/** A row of a breakdown: how many words, and how they split by layer. */
export interface PatternRow<T extends string> {
  value: T;
  count: number;
  byStratum: Record<StratumKey, number>;
}

/** Two processes that the same words carry, with a few of those words. */
export interface ProcessPair {
  a: WordProcess;
  b: WordProcess;
  count: number;
  examples: WordNeighbor[];
}

/** One part whose reading changed inside the words that show it: the same
 *  `base → reading` seen in `count` words. */
export interface RendakuReading {
  /** The part as written (日, 仮名, 付く…). */
  part: string;
  /** Its reading on its own, and the reading it takes in these words. */
  base: string;
  reading: string;
  /** Whether it is the word's first part or a later one. */
  position: "first" | "later";
  /** Open words showing exactly this change. */
  count: number;
  /** A few of them. */
  examples: WordNeighbor[];
}

/** One sound change at the start of a reading (ひ → び), across every part
 *  that undergoes it. */
export interface RendakuSound {
  from: string;
  to: string;
  /** Open words in which a part's first kana changes this way. */
  count: number;
  readings: RendakuReading[];
}

/** The reading changes the entries record (a part's `base` differing from its
 *  `reading`), split by what changed. */
export interface RendakuPayload {
  /** Open words recording at least one change. */
  words: number;
  /** The first kana became its voiced counterpart (ひ → び, か → が). */
  voiced: RendakuSound[];
  /** The reading's last kana became っ (みつ → みっ). */
  sokuon: RendakuReading[];
  /** Any other recorded change — listed rather than dropped. */
  other: RendakuReading[];
}

/** What GET /api/patterns returns. */
export interface PatternsPayload {
  /** Open words counted. */
  total: number;
  /** Of those, how many show a "Taken apart" row. */
  withParts: number;
  /** Of those, how many show a part whose reading changed in the word (rendaku/sokuon). */
  withBase: number;
  strata: PatternCount<StratumKey>[];
  levels: PatternRow<JlptLevel>[];
  /** Most-used first. */
  processes: PatternRow<WordProcess>[];
  /** Most-shared first. */
  pairs: ProcessPair[];
  rendaku: RendakuPayload;
}

// --- RELATED (more like this) ---

/** What an open word has in common with the entry it is offered beside. */
export interface RelatedShared {
  /** Parts both words' "Taken apart" rows show. */
  parts: string[];
  processes: WordProcess[];
  /** Set when both words are in the same layer. */
  stratum?: WordStratum;
}

export interface RelatedWord extends PartWordRef {
  shared: RelatedShared;
}

/** What GET /api/related returns: open words that resemble one entry, closest first. */
export interface RelatedPayload {
  /** The entry they are related to. */
  date: string;
  words: RelatedWord[];
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
