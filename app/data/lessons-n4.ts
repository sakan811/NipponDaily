/**
 * The N4 lesson path shown at /learn?level=N4 — the N4 counterpart to
 * lessons.ts's N5 LESSONS/LESSON_STAGES. Every word in the N4 pool, laid out
 * as a numbered sequence of short lessons grouped into stages, built from
 * N4_WORD_CLUSTERS (vocab-guide-n4.ts) the same way N5's own lesson path is
 * built from WORD_CLUSTERS — see lessons.ts's buildLessons()/kanjiInTerm(),
 * reused here rather than duplicated. test/content/n4/lessons.test.ts checks
 * every N4 vocab id against data/reference/n4-reference.json, so no word is
 * left out of the path.
 */
import { N4_WORD_CLUSTERS } from "./vocab-guide-n4";
import {
  buildLessons,
  firstLessonByKanji,
  lessonNumberByWord,
  type Lesson,
  type LessonStage,
} from "./lessons";

export const N4_LESSON_STAGES: LessonStage[] = [
  {
    key: "keigo-people",
    title: "Keigo & People",
    jp: "けいご",
    description:
      "The honorific/humble verb system N4 is built around, plus the family and address vocabulary it's used to talk about.",
    clusters: ["keigo", "family-titles"],
  },
  {
    key: "grammar-patterns",
    title: "Grammar Patterns",
    jp: "ぶんぽう",
    description:
      "The formal nouns, connectors, verb suffixes and counters that stitch N4 sentences together.",
    clusters: [
      "saikou-prefix",
      "reasons-expectations",
      "connectors",
      "verb-suffixes",
      "counters-suffixes",
    ],
  },
  {
    key: "time-degree",
    title: "Time & Degree",
    jp: "じかん",
    description:
      "Talking about when, how much, and how carefully something happens.",
    clusters: ["time-recent", "degree-manner"],
  },
  {
    key: "verbs-of-change",
    title: "Verbs of Change & Action",
    jp: "どうし",
    description:
      "N4's transitive/intransitive verb pairs, everyday actions, movement, communication, and reacting to the world.",
    clusters: [
      "verb-pairs",
      "everyday-actions",
      "more-verbs-1",
      "movement-travel",
      "communication",
      "emotion-verbs",
      "sports",
    ],
  },
  {
    key: "life-home-health",
    title: "Life, Home & Health",
    jp: "せいかつ",
    description:
      "Housing, food, clothing, the body, feelings, and the abstract everyday words that don't fit one narrow topic.",
    clusters: [
      "housing",
      "food-more",
      "clothing-more",
      "body-health",
      "feelings-personality",
      "sensory-physical",
      "abstract-nouns",
    ],
  },
  {
    key: "society-world",
    title: "Society & the World",
    jp: "しゃかい",
    description:
      "School, work, technology, getting around town, jobs, the wider world, shopping, nature, and hobbies.",
    clusters: [
      "school",
      "work-business",
      "technology",
      "transportation-places",
      "occupations",
      "society-economy",
      "shopping",
      "nature",
      "hobbies-arts",
      "places-objects",
      "fillers-events",
    ],
  },
];

export const N4_LESSONS: Lesson[] = buildLessons(
  N4_LESSON_STAGES,
  N4_WORD_CLUSTERS,
);

/** vocab id -> the number of the lesson that teaches it (N4's own numbering,
 *  independent of N5's LESSON_NUMBER_BY_WORD). */
export const N4_LESSON_NUMBER_BY_WORD: ReadonlyMap<string, number> =
  lessonNumberByWord(N4_LESSONS);

/** kanji character -> the number of the first N4 lesson whose words use it. */
export const N4_FIRST_LESSON_BY_KANJI: ReadonlyMap<string, number> =
  firstLessonByKanji(N4_LESSONS);

export function getN4Lesson(number: number): Lesson | undefined {
  return Number.isInteger(number) ? N4_LESSONS[number - 1] : undefined;
}

export function n4LessonsInStage(stageKey: string): Lesson[] {
  return N4_LESSONS.filter((lesson) => lesson.stageKey === stageKey);
}

export function n4StageForLesson(lesson: Lesson): LessonStage | undefined {
  return N4_LESSON_STAGES.find((stage) => stage.key === lesson.stageKey);
}
