export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}

// --- N5 LEARNING POOL ---

/** Only one level is in scope today; kept as a named alias (not inlined
 *  "N5" everywhere) purely for self-documentation and cheap forward-compat
 *  if a later level is ever added. */
export type JlptLevel = "N5";

export type N5Script = "hiragana" | "katakana";

/** One hiragana or katakana character (base gojūon or a dakuten/digraph
 *  variant). Hardcoded seed data — see scripts/seed-n5-data.mjs. */
export interface KanaCharacter {
  id: string;
  char: string;
  script: N5Script;
  /** Hepburn rōmaji, derived via wanakana at seed time. */
  romaji: string;
}

/** One N5 kanji, enriched from KANJIDIC2. */
export interface N5Kanji {
  id: string;
  character: string;
  /** English meanings from KANJIDIC2. */
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  strokeCount: number;
  jlptLevel: JlptLevel;
}

/** One N5 vocabulary word, cross-referenced against JMdict. */
export interface N5Vocab {
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

export type N5PoolKind = "hiragana" | "katakana" | "kanji" | "vocab";

/** One multiple-choice question in a DailyGame round. */
export interface GameQuestion {
  /** The source item's id (kanji/vocab/kana id). */
  id: string;
  kind: N5PoolKind;
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
export type SeasonId = "sakura" | "autumn";

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
