export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}

// --- JLPT LEARNING POOL ---

/** The JLPT levels NipponDaily has a seeded pool for — see shared/jlpt.ts's
 *  JLPT_LEVELS for the runtime-checkable version of this same set. N5 is the
 *  only level with hand-authored lesson content (WORD_CLUSTERS) so far;
 *  N4-N2 exist as seeded, dictionary-verified pools and API/game surfaces
 *  only — see docs/content-accuracy.md. */
export type JlptLevel = "N5" | "N4" | "N3" | "N2";

/** JlptLevel plus "ALL" — the one extra value GET /api/daily-game's
 *  `?level=` accepts, drawing a round from every level's kanji/vocab pool
 *  merged together (see PoolDataService.getFullPool). Only ever a *daily
 *  game* selector value: pool-browsing endpoints/pages (GET /api/pool-vocab,
 *  GET /api/pool-kanji, /vocab, /learn) stay JlptLevel-only, since there's
 *  no persisted "ALL" pool to browse — just a merge built on demand. */
export type DailyGameLevel = JlptLevel | "ALL";

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

// --- DAILY GAME ---

export type PoolKind = "hiragana" | "katakana" | "kanji" | "vocab";

/** One multiple-choice question in a DailyGame round. */
export interface GameQuestion {
  /** The source item's id (kanji/vocab/kana id). */
  id: string;
  kind: PoolKind;
  /** The Japanese character/word shown to the player. */
  prompt: string;
  /** Furigana reading rendered above the prompt when it contains kanji —
   *  a kanji character's own reading, or a vocab term's full kana reading. */
  promptSub?: string;
  correctAnswer: string;
  /** Length 4, includes correctAnswer, shuffled. */
  choices: string[];
}

/**
 * The whole daily payload — persisted at n5:daily_game:<date> and served by
 * GET /api/daily-game. Entirely self-contained; the client never needs to
 * fetch anything else to play, and never persists anything back.
 */
export interface DailyGame {
  /** YYYY-MM-DD */
  date: string;
  /** Which level's kanji/vocab pool the questions were drawn from. Defaults
   *  to "N5"; the game's level selector (app/components/DailyGameBoard.vue)
   *  can request another, including "ALL" (every level's pool merged into
   *  one round). The field is real (not inferred) so a level's
   *  repeat-avoidance history and persisted key never mix with another
   *  level's. */
  level: DailyGameLevel;
  questions: GameQuestion[];
  generatedAt: number;
  /** Which path produced it — see server/api/daily-game.get.ts. */
  source: "agent" | "fallback";
}

// --- SITE THEME ---

/**
 * Closed set of seasonal design presets an agent may select via the MCP
 * server's save_site_theme tool. Deliberately kept in lockstep with the
 * [data-season="..."] blocks actually defined in
 * app/assets/css/tailwind.css (see server/utils/site-theme.ts SEASON_IDS) —
 * a season only belongs in this union once it has a matching CSS preset.
 */
export type SeasonId = "sakura" | "summer" | "autumn" | "winter";

/**
 * NipponDaily's active seasonal palette — persisted at n5:site_theme and
 * served by GET /api/site-theme. Applied as a data-season attribute on
 * <html>, which the [data-season] blocks in tailwind.css key off of.
 */
export interface SiteTheme {
  season: SeasonId;
  updatedAt: number;
  /** Which path produced it — see server/api/site-theme.get.ts. */
  source: "agent" | "fallback";
}
