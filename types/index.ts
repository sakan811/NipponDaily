export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  count?: number;
  timestamp: string;
}

// --- JAPANESE-LEARNING LESSONS ---

/** JLPT proficiency bands, easiest (N5) to hardest (N1). */
export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export interface VocabItem {
  term: string;
  reading: string;
  romaji: string;
  meaning: string;
  /** Part of speech, e.g. "noun", "godan verb", "i-adjective", "particle". */
  partOfSpeech?: string;
  jlptLevel: JlptLevel;
  exampleSentence: string;
  /** exampleSentence with furigana as inline <ruby> HTML markup. */
  exampleFurigana?: string;
  /** Hepburn rōmaji transliteration of exampleSentence. */
  exampleRomaji?: string;
}

export interface GrammarNote {
  pattern: string;
  /** pattern with furigana as inline <ruby> HTML markup. */
  patternFurigana?: string;
  /** Hepburn rōmaji transliteration of pattern. */
  patternRomaji?: string;
  /** Part of speech the pattern acts as, e.g. "conjunction", "auxiliary verb", "sentence-ending particle". */
  partOfSpeech?: string;
  explanation: string;
  exampleSentence: string;
  /** Rōmaji transliteration of exampleSentence. */
  romaji: string;
  /** exampleSentence with furigana as inline <ruby> HTML markup. */
  exampleFurigana?: string;
}

/**
 * A single Japanese-language news article turned into a self-contained lesson by
 * the external MCP agent. There is no clustering, no cross-article synthesis and
 * no topic taxonomy — one record is one article plus the lesson authored from
 * its own Japanese text.
 */
export interface Lesson {
  id: string;
  /** English translation of the article headline. */
  title: string;
  /** Original Japanese headline. */
  titleJa?: string;
  /** Publisher domain, e.g. "https://www3.nhk.or.jp". */
  source: string;
  url: string;
  /** Derived server-side from the source domain. */
  favicon?: string;
  /** ISO 8601 timestamp of the original publish date. */
  publishedAt: string;
  /** ms epoch when the lesson was written to Redis; set server-side. */
  addedAt: number;
  /** 0–1 publisher reliability; cached per-domain and reused. */
  credibilityScore: number;
  /** Overall JLPT difficulty estimate for this lesson. */
  difficultyLevel: JlptLevel;
  /** A representative passage from the article's Japanese text. */
  originalText: string;
  /** English translation of originalText. */
  englishText: string;
  /** The same passage with furigana as inline <ruby> HTML markup. */
  furiganaText: string;
  /** Hepburn rōmaji transliteration of originalText. */
  romajiText: string;
  /** 8–15 notable terms from the passage. */
  vocabList: VocabItem[];
  /** 1–3 grammar patterns worth flagging from the passage. */
  grammarNotes: GrammarNote[];
}
