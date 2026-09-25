/**
 * The N5 lesson path shown at /learn: every word in the N5 pool, laid out as
 * a numbered sequence of short lessons grouped into stages, so a learner can
 * simply start at Lesson 1 and keep pressing "Next".
 *
 * Lessons are derived from the curated WORD_CLUSTERS in vocab-guide.ts — each
 * stage walks a list of clusters in teaching order, and each cluster is cut
 * into bite-sized lessons of at most MAX_WORDS_PER_LESSON words (keeping a
 * cluster's rows together where they fit). A word that appears in more than
 * one cluster is taught once, in the first lesson that reaches it. The
 * test in test/unit/lessons.test.ts checks every N5 vocab id against
 * test/fixtures/n5-vocab-ids.json, so no word is left out of the path.
 */
import {
  WORD_CLUSTERS,
  type TopicExample,
  type WordCluster,
  type WordClusterRow,
} from "./vocab-guide";

export const MAX_WORDS_PER_LESSON = 12;
/** A lesson shorter than this is folded into a neighbouring part of the
 *  same topic when the two fit together under MAX_WORDS_PER_LESSON. */
const MIN_WORDS_PER_LESSON = 5;

export interface LessonStage {
  key: string;
  title: string;
  /** Short Japanese label shown as the stage badge. */
  jp: string;
  description: string;
  /** WORD_CLUSTERS keys, in the order they are taught. */
  clusters: string[];
}

export const LESSON_STAGES: LessonStage[] = [
  {
    key: "first-steps",
    title: "First Steps",
    jp: "はじめ",
    description:
      "Greetings, this/that, question words, people, family and numbers — the words every first conversation is built from.",
    clusters: [
      "greetings-fillers",
      "kosoado",
      "question-words",
      "people",
      "family",
      "numbers",
    ],
  },
  {
    key: "time",
    title: "Time & Dates",
    jp: "とき",
    description:
      "Clock times, days, weeks, months and years, plus the counters you need to say how many or how long.",
    clusters: [
      "time-of-day",
      "time-grid",
      "weekdays",
      "days-of-month",
      "counting-time",
      "counters",
      "sequence-words",
    ],
  },
  {
    key: "actions",
    title: "Everyday Actions",
    jp: "うごき",
    description:
      "The core verbs: being and having, daily routines, coming and going, handling things, and talking and learning.",
    clusters: [
      "existence-state-verbs",
      "daily-verbs",
      "motion-verbs",
      "handling-verbs",
      "state-change-verbs",
      "learning-communication",
      "everyday-essentials",
    ],
  },
  {
    key: "describing",
    title: "Describing the World",
    jp: "ようす",
    description:
      "Adjectives and their opposites, colours, feelings, how much and how often, and where things are.",
    clusters: [
      "descriptive-adjectives",
      "opposites",
      "colors",
      "feelings-states",
      "degree-frequency",
      "directions",
    ],
  },
  {
    key: "daily-life",
    title: "Home & Daily Life",
    jp: "くらし",
    description:
      "Food, clothes, the body, the home and its gadgets, the weather and the natural world.",
    clusters: [
      "food-drink",
      "clothing",
      "body",
      "house-rooms",
      "gadgets-entertainment",
      "weather",
      "nature-animals",
    ],
  },
  {
    key: "out-and-about",
    title: "Out & About",
    jp: "まち",
    description:
      "Around town, getting there, shopping, school and the everyday loanwords written in katakana.",
    clusters: [
      "places-town",
      "transportation",
      "shopping-money",
      "school-supplies",
      "loanwords",
    ],
  },
];

export interface Lesson {
  /** 1-based position in the whole path — also its URL (/learn/<number>). */
  number: number;
  stageKey: string;
  clusterKey: string;
  title: string;
  /** Which part of its cluster this lesson is, e.g. 2 of 3. */
  part: number;
  partCount: number;
  /** The cluster's rows, narrowed to the words taught in this lesson. */
  rows: WordClusterRow[];
  /** Every N5Vocab id taught in this lesson, in display order. */
  wordIds: string[];
  insight: string;
  extendedInsight?: string;
  examples?: TopicExample[];
  commonMistake?: string;
}

/** Splits `items` into the fewest chunks of at most `max`, as evenly sized
 *  as possible (so 13 words become 7 + 6, not 12 + 1). */
function evenChunks<T>(items: T[], max: number): T[][] {
  if (items.length === 0) return [];
  const chunkCount = Math.ceil(items.length / max);
  const size = Math.ceil(items.length / chunkCount);
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/** Packs a cluster's (already de-duplicated) rows into lesson-sized parts. */
function packRows(rows: WordClusterRow[], max: number): WordClusterRow[][] {
  // Any single row longer than a lesson is split into even pieces first.
  const segments = rows.flatMap((row) =>
    evenChunks(row.terms, max).map((terms) => ({ ...row, terms })),
  );
  const total = segments.reduce((sum, s) => sum + s.terms.length, 0);
  if (total === 0) return [];
  // Aim for evenly sized lessons rather than filling each one to `max`.
  const target = Math.ceil(total / Math.ceil(total / max));

  const size = (part: WordClusterRow[]) =>
    part.reduce((sum, s) => sum + s.terms.length, 0);

  const parts: WordClusterRow[][] = [];
  let current: WordClusterRow[] = [];
  for (const segment of segments) {
    const currentSize = size(current);
    if (
      currentSize > 0 &&
      (currentSize >= target || currentSize + segment.terms.length > max)
    ) {
      parts.push(current);
      current = [];
    }
    current.push(segment);
  }
  if (current.length > 0) parts.push(current);

  // Fold any too-short part into its smaller neighbour when they fit.
  for (let i = 0; i < parts.length;) {
    const n = size(parts[i]!);
    const prev = i > 0 ? size(parts[i - 1]!) : Infinity;
    const next = i < parts.length - 1 ? size(parts[i + 1]!) : Infinity;
    const into = prev <= next ? i - 1 : i + 1;
    if (n < MIN_WORDS_PER_LESSON && Math.min(prev, next) + n <= max) {
      const [first, second] = into < i ? [into, i] : [i, into];
      parts.splice(first, 2, [...parts[first]!, ...parts[second]!]);
      i = 0;
    } else {
      i++;
    }
  }
  return parts;
}

export function buildLessons(
  stages: LessonStage[] = LESSON_STAGES,
  clusters: WordCluster[] = WORD_CLUSTERS,
  max = MAX_WORDS_PER_LESSON,
): Lesson[] {
  const clusterByKey = new Map(clusters.map((c) => [c.key, c]));
  const taught = new Set<string>();
  const lessons: Lesson[] = [];

  for (const stage of stages) {
    for (const clusterKey of stage.clusters) {
      const cluster = clusterByKey.get(clusterKey);
      if (!cluster) {
        throw new Error(
          `Lesson stage ${stage.key} lists unknown cluster ${clusterKey}`,
        );
      }

      const freshRows = cluster.rows
        .map((row) => ({
          ...row,
          terms: row.terms.filter((id) => {
            if (taught.has(id)) return false;
            taught.add(id);
            return true;
          }),
        }))
        .filter((row) => row.terms.length > 0);

      const parts = packRows(freshRows, max);
      parts.forEach((rows, i) => {
        lessons.push({
          number: lessons.length + 1,
          stageKey: stage.key,
          clusterKey: cluster.key,
          title: cluster.title,
          part: i + 1,
          partCount: parts.length,
          rows,
          wordIds: rows.flatMap((row) => row.terms),
          insight: cluster.insight,
          extendedInsight: cluster.extendedInsight,
          examples: cluster.examples,
          commonMistake: cluster.commonMistake,
        });
      });
    }
  }
  return lessons;
}

export const LESSONS: Lesson[] = buildLessons();

/** vocab id -> the number of the lesson that teaches it. */
export const LESSON_NUMBER_BY_WORD: ReadonlyMap<string, number> = new Map(
  LESSONS.flatMap((lesson) =>
    lesson.wordIds.map((id) => [id, lesson.number] as const),
  ),
);

export function getLesson(number: number): Lesson | undefined {
  return Number.isInteger(number) ? LESSONS[number - 1] : undefined;
}

export function lessonsInStage(stageKey: string): Lesson[] {
  return LESSONS.filter((lesson) => lesson.stageKey === stageKey);
}

export function stageForLesson(lesson: Lesson): LessonStage | undefined {
  return LESSON_STAGES.find((stage) => stage.key === lesson.stageKey);
}

/** Matches one CJK ideograph — the characters KANJIDIC2 has entries for
 *  (々, the repeat mark, is deliberately excluded: it isn't a kanji). */
const KANJI_CHAR = /[一-鿿]/g;

/** The distinct kanji a word is written with, in order of appearance. */
export function kanjiInTerm(term: string): string[] {
  return [...new Set(term.match(KANJI_CHAR) ?? [])];
}

/**
 * kanji character -> the number of the first lesson whose words use it, so a
 * lesson can flag which kanji are new and which were met earlier. Built from
 * word ids, which keep a term's kanji intact (slugify only strips
 * punctuation and appends "-2"-style suffixes), so no pool fetch is needed.
 */
export const FIRST_LESSON_BY_KANJI: ReadonlyMap<string, number> = (() => {
  const first = new Map<string, number>();
  for (const lesson of LESSONS) {
    for (const id of lesson.wordIds) {
      for (const char of kanjiInTerm(id)) {
        if (!first.has(char)) first.set(char, lesson.number);
      }
    }
  }
  return first;
})();
