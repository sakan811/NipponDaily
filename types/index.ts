export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}

// --- JLPT ---

/** The JLPT levels the daily words are drawn from — see shared/jlpt.ts's
 *  JLPT_LEVELS for the runtime-checkable version of this same set. */
export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

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

/** An example sentence for a word, picked from the pinned Tatoeba export
 *  (data/reference/sentences/) by the rules in scripts/lib/example-sentences.mjs.
 *  Tatoeba's text, never rewritten. */
export interface WordExample {
  /** The Japanese sentence's Tatoeba number (tatoeba.org/sentences/show/<id>). */
  id: number;
  ja: string;
  /** An English translation of it. */
  en: string;
  /** The English sentence's Tatoeba number. */
  enId: number;
  /** The form of the word as it stands in `ja` (食べた for 食べる). */
  form: string;
  /** `ja` cut into parts that join back to it: `[text]` for plain text,
   *  `[kanji, reading]` where a reading is shown over the kanji. A reading is
   *  here only where kuromoji and Tatoeba's index or JMdict agree
   *  (scripts/lib/furigana.mjs); left out when none was. */
  furigana?: SentencePart[];
}

/** A stretch of a sentence: plain text, or kanji with the reading to show over it. */
export type SentencePart = [text: string] | [text: string, reading: string];

/** One line of Wiktionary's Etymology section for this word's reading, quoted
 *  verbatim from the pinned snapshot in data/reference/etymology/. */
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
  /** JMdict's priority codes for this spelling and reading, verbatim (ichi1,
   *  news1, gai1, nf05…); left out when JMdict tags neither. */
  priority?: string[];
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
  /** Sentences that use the word, from Tatoeba; left out when the pinned export
   *  has none that qualifies. */
  examples?: WordExample[];
  /** Date of the Wiktionary dump the sources were quoted from (YYYY-MM-DD). */
  wiktionaryDump: string;
}

/** A pointer to a neighbouring open day, for prev/next navigation. */
export interface WordNeighbor {
  date: string;
  term: string;
}

/** What GET /api/daily-word returns: the entry plus its open neighbours. */
export interface DailyWordPayload {
  entry: WordEntry;
  /** Which lap of the catalogue the entry is shown on: 1 until the last
   *  written day has passed, then 2 for the second time through, and so on. */
  lap: number;
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
  /** Only present when open: whether the word passes the calendar's filters
   *  (always true when there are none). An upcoming day is never matched. */
  match?: boolean;
}

/** What GET /api/word-calendar returns: one month's days, marked against the
 *  filters, plus the counts the month picker and the filter chips show. */
export interface WordCalendarPayload {
  month: string;
  /** Every month that has words, oldest first. */
  months: string[];
  today: string;
  days: WordCalendarDay[];
  /** The filters applied, as the API read them. */
  filters: ExploreFilters;
  /** Open words in all. */
  total: number;
  /** Open words matching every filter, across all months. */
  count: number;
  /** Open words matching every filter, for each month in `months`. */
  monthCounts: Record<string, number>;
  facets: ExploreFacets;
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

// --- KANJI (KANJIDIC2 records of the characters the words are written with) ---

/** One kanji in the index: how many open words are written with it. */
export interface KanjiSummary {
  char: string;
  /** Open words whose spelling contains it. */
  count: number;
  /** KANJIDIC2's school grade (1–6, 8, 9 or 10), when it has one. */
  grade?: number;
}

/** What GET /api/kanji returns: every kanji an open word is written with. */
export interface KanjiIndexPayload {
  kanji: KanjiSummary[];
}

/** What GET /api/kanji-detail?char= returns: KANJIDIC2's record of one
 *  character and the open words written with it. */
export interface KanjiDetail {
  char: string;
  strokeCount: number;
  grade?: number;
  /** Rank by newspaper frequency among KANJIDIC2's 2,500 most used. */
  freq?: number;
  /** On'yomi, in katakana as KANJIDIC2 gives them. */
  on: string[];
  /** Kun'yomi as KANJIDIC2 gives them: a dot marks where okurigana begin. */
  kun: string[];
  meanings: string[];
  /** Open words whose spelling contains it, oldest first. */
  count: number;
  words: PartWordRef[];
  /** Whether some open word shows it as a part, so /parts/<char> exists. */
  isPart: boolean;
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

/** A coarse group of JMdict part-of-speech tags (see POS_GROUPS in
 *  shared/word-labels.ts). "unstated" is a word JMdict has no entry for. */
export type PosGroup =
  "noun" | "verb" | "adjective" | "adverb" | "affix" | "other" | "unstated";

/** How common JMdict says a word is, read from its priority codes: "common"
 *  when it carries one of the lists JMdict counts as common (ichi1, news1,
 *  spec1, spec2, gai1), "less" when it carries only other codes (news2, ichi2,
 *  gai2, nf…), "unlisted" when it carries none. */
export type FrequencyGroup = "common" | "less" | "unlisted";

/** How several choices in the same filter combine: "any" keeps a word that has
 *  at least one of them, "all" only a word that has every one. It matters for
 *  the filters a word can hold several values of (process, part of speech);
 *  a word has one level and one layer, so those always read "any". */
export type ExploreMatch = "any" | "all";

/** The filters GET /api/explore accepts. Every one is optional; different
 *  filters narrow together, and several choices within one filter combine
 *  according to `match`. */
export interface ExploreFilters {
  /** Matches the term, the reading (katakana and hiragana alike) or the meaning. */
  q?: string;
  level?: JlptLevel[];
  /** "unstated" picks the words whose layer neither KANJIDIC2 nor the
   *  evidence establishes. */
  stratum?: StratumKey[];
  process?: WordProcess[];
  pos?: PosGroup[];
  frequency?: FrequencyGroup[];
  /** A part's text, as in /parts/<text>. */
  part?: string;
  /** Defaults to "any". */
  match?: ExploreMatch;
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
  facets: ExploreFacets;
}

/** Each facet counts the words matching every *other* filter that carry the
 *  option, so an option never shows a count it cannot deliver. */
export interface ExploreFacets {
  level: FacetCount<JlptLevel>[];
  stratum: FacetCount<StratumKey>[];
  process: FacetCount<WordProcess>[];
  pos: FacetCount<PosGroup>[];
  frequency: FacetCount<FrequencyGroup>[];
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

/** Three or more tags that the same words carry together: processes, and
 *  optionally the layer. `count` is the words carrying all of them (and
 *  possibly more). */
export interface TagCombination {
  stratum?: WordStratum;
  processes: WordProcess[];
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
  /** Most-shared first: sets of three or more tags (processes and layer)
   *  that turn up on the same words, beyond the pairs above. */
  combinations: TagCombination[];
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
