/**
 * Registry mapping each JLPT level that has a hand-authored lesson path to
 * its lesson data, so /vocab and /learn's level-aware pages don't need to
 * hardcode which module a given level's LESSONS/LESSON_STAGES/WORD_CLUSTERS
 * come from. Only levels with real editorial content appear here.
 */
import type { JlptLevel } from "~~/types/index";
import {
  WORD_CLUSTERS,
  WORD_TYPE_GROUPS,
  type WordCluster,
} from "./vocab-guide";
import { N4_WORD_CLUSTERS } from "./vocab-guide-n4";
import { N3_WORD_CLUSTERS } from "./vocab-guide-n3";
import { N2_WORD_CLUSTERS } from "./vocab-guide-n2";
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
import {
  N3_FIRST_LESSON_BY_KANJI,
  N3_LESSON_NUMBER_BY_WORD,
  N3_LESSON_STAGES,
  N3_LESSONS,
  getN3Lesson,
} from "./lessons-n3";
import {
  N2_FIRST_LESSON_BY_KANJI,
  N2_LESSON_NUMBER_BY_WORD,
  N2_LESSON_STAGES,
  N2_LESSONS,
  getN2Lesson,
} from "./lessons-n2";

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
  N3: {
    level: "N3",
    lessons: N3_LESSONS,
    stages: N3_LESSON_STAGES,
    lessonNumberByWord: N3_LESSON_NUMBER_BY_WORD,
    firstLessonByKanji: N3_FIRST_LESSON_BY_KANJI,
    getLesson: getN3Lesson,
    wordClusters: N3_WORD_CLUSTERS,
  },
  N2: {
    level: "N2",
    lessons: N2_LESSONS,
    stages: N2_LESSON_STAGES,
    lessonNumberByWord: N2_LESSON_NUMBER_BY_WORD,
    firstLessonByKanji: N2_FIRST_LESSON_BY_KANJI,
    getLesson: getN2Lesson,
    wordClusters: N2_WORD_CLUSTERS,
  },
};

/** Levels with a hand-authored lesson path — what /learn's level selector
 *  offers. */
export const LEVELS_WITH_LESSONS: JlptLevel[] = ["N5", "N4", "N3", "N2"];

export { WORD_TYPE_GROUPS };
