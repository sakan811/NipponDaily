/**
 * Registry mapping each JLPT level that has a hand-authored lesson path to
 * its lesson data, so /vocab and /learn's level-aware pages don't need to
 * hardcode which module a given level's LESSONS/LESSON_STAGES/WORD_CLUSTERS
 * come from. Only levels with real editorial content appear here — N3/N2
 * are seeded pools with no lesson path yet (see CLAUDE.md's "Beyond N5"),
 * so they're simply absent rather than pointing at empty data.
 */
import type { JlptLevel } from "~~/types/index";
import {
  WORD_CLUSTERS,
  WORD_TYPE_GROUPS,
  type WordCluster,
} from "./vocab-guide";
import { N4_WORD_CLUSTERS } from "./vocab-guide-n4";
import {
  FIRST_LESSON_BY_KANJI,
  LESSON_NUMBER_BY_WORD,
  LESSON_STAGES,
  LESSONS,
  getLesson,
  type Lesson,
  type LessonStage,
} from "./lessons";
import {
  N4_FIRST_LESSON_BY_KANJI,
  N4_LESSON_NUMBER_BY_WORD,
  N4_LESSON_STAGES,
  N4_LESSONS,
  getN4Lesson,
} from "./lessons-n4";

export interface LessonSet {
  level: JlptLevel;
  lessons: Lesson[];
  stages: LessonStage[];
  lessonNumberByWord: ReadonlyMap<string, number>;
  firstLessonByKanji: ReadonlyMap<string, number>;
  getLesson: (number: number) => Lesson | undefined;
  wordClusters: WordCluster[];
}

export const LESSON_SETS: Partial<Record<JlptLevel, LessonSet>> = {
  N5: {
    level: "N5",
    lessons: LESSONS,
    stages: LESSON_STAGES,
    lessonNumberByWord: LESSON_NUMBER_BY_WORD,
    firstLessonByKanji: FIRST_LESSON_BY_KANJI,
    getLesson,
    wordClusters: WORD_CLUSTERS,
  },
  N4: {
    level: "N4",
    lessons: N4_LESSONS,
    stages: N4_LESSON_STAGES,
    lessonNumberByWord: N4_LESSON_NUMBER_BY_WORD,
    firstLessonByKanji: N4_FIRST_LESSON_BY_KANJI,
    getLesson: getN4Lesson,
    wordClusters: N4_WORD_CLUSTERS,
  },
};

/** Levels with a hand-authored lesson path — what /learn's level selector
 *  offers. N3/N2 are deliberately absent (seeded pools only, no lessons). */
export const LEVELS_WITH_LESSONS: JlptLevel[] = ["N5", "N4"];

export { WORD_TYPE_GROUPS };
