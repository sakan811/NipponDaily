/**
 * The N3 lesson path shown at /learn?level=N3 — the N3 counterpart to
 * lessons.ts's N5 LESSONS/LESSON_STAGES and lessons-n4.ts's N4 counterpart.
 * Every word in the N3 pool, laid out as a numbered sequence of short
 * lessons grouped into stages, built from N3_WORD_CLUSTERS
 * (vocab-guide-n3.ts) the same way N5's and N4's own lesson paths are built
 * — see lessons.ts's buildLessons()/kanjiInTerm(), reused here rather than
 * duplicated. test/content/n3/vocabulary.test.ts checks every N3 vocab id
 * against data/reference/n3-reference.json, so no word is left out of the
 * path.
 */
import { N3_WORD_CLUSTERS } from "./vocab-guide-n3";
import {
  buildLessons,
  firstLessonByKanji,
  lessonNumberByWord,
  type Lesson,
  type LessonStage,
} from "./lessons";

export const N3_LESSON_STAGES: LessonStage[] = [
  {
    key: "n3-sound-alikes",
    title: "Sound-Alikes & Reading Puzzles",
    jp: "どうおんいぎご",
    description:
      "N3 leans hard into kanji: dozens of words share a reading but split into different kanji and meanings, and a handful of kanji (現, 適, 通, 中, 同…) build whole families of related words. Sorting these out is the single biggest reading-comprehension skill N3 adds.",
    clusters: [
      "n3-b01-homophones",
      "n3-b02-sei-homograph",
      "n3-b02-reading-puzzles-verbs",
      "n3-b02-warm-temperature-verbs",
      "n3-b03-ishi-homophones",
      "n3-b03-reading-variants",
      "n3-b04-homophones",
      "n3-b05-gen-prefix",
      "n3-b05-kyuu-homophones",
      "n3-b05-homophone-readings",
      "n3-b06-homophone-verbs",
      "n3-b06-word-patterns",
      "n3-b06-mei-title",
      "n3-b07-homophone-families",
      "n3-b07-yuu-reading",
      "n3-b07-you-reading",
      "n3-b07-ri-reading",
      "n3-b07-nature-shapes",
      "n3-b08-homophones",
      "n3-b09-tsuu-passage",
      "n3-b09-chuu-center-focus",
      "n3-b09-suitability-simplicity",
      "n3-b09-sameness-traits",
      "n3-b09-tsuku-homophones",
      "n3-b09-tokeru-homophones",
      "n3-b10-homophone-verbs",
      "n3-b11-fu-negative-prefix",
      "n3-b11-kanji-building-blocks",
      "n3-b12-homophone-verbs",
      "n3-b12-maku-family",
      "n3-b12-homophones-1",
      "n3-b12-homophones-2",
    ],
  },
  {
    key: "n3-verb-pairs-change",
    title: "Verbs of Change — Transitive & Intransitive Pairs",
    jp: "じどうし・たどうし",
    description:
      'More of N4\'s signature transitive/intransitive verb pairs, one level up — mixing, piling, intensifying, and changing shape or amount, each described from both the "it happens" and "someone makes it happen" angle.',
    clusters: [
      "n3-b04-change-verbs",
      "n3-b04-transactional-verbs",
      "n3-b08-verb-pairs",
      "n3-b09-piling-scattering",
      "n3-b10-verb-pairs-flow",
      "n3-b11-transitive-intransitive-pairs",
      "n3-b12-intensity-verbs",
      "n3-b12-mixing-verbs",
    ],
  },
  {
    key: "n3-everyday-verbs",
    title: "Everyday Verbs & Action",
    jp: "どうし",
    description:
      "General-purpose verbs for getting things done — handling, repairing, responding, and the physical actions that fill an ordinary day.",
    clusters: [
      "n3-b01-guidance-repair",
      "n3-b02-everyday-verbs",
      "n3-b03-verbs-motion-action",
      "n3-b03-verbs-giving-responding",
      "n3-b05-everyday-verbs-hardship",
      "n3-b07-everyday-verbs",
      "n3-b07-formal-verbs",
      "n3-b08-daily-actions",
      "n3-b10-handling-reaching",
      "n3-b10-effort-sound-sudden",
      "n3-b11-everyday-verbs",
      "n3-b12-everyday-verbs",
    ],
  },
  {
    key: "n3-adverbs-connectors",
    title: "Adverbs, Connectors & Formal Discourse",
    jp: "ふくし・接続",
    description:
      "The connective tissue of more advanced Japanese — degree adverbs, discourse connectors, and the more formal, written-register vocabulary N3 introduces for explaining, qualifying, and connecting ideas.",
    clusters: [
      "n3-b01-adverbs-connectors",
      "n3-b02-adjectives-state",
      "n3-b02-adverbs-connectors",
      "n3-b03-degree-time-adverbs",
      "n3-b04-describing-qualifying",
      "n3-b05-discussion-conclusion",
      "n3-b05-language-arts",
      "n3-b06-expressions-hypothetical",
      "n3-b07-masu-stem-nouns",
      "n3-b07-formal-discourse",
      "n3-b08-connectives",
      "n3-b08-manner-time-adverbs",
      "n3-b09-connectors-certainty",
      "n3-b10-indefinites-connectors",
      "n3-b11-adverbs-degree",
      "n3-b12-grammar-fillers",
      "n3-b12-formal-abstract",
      "n3-b12-adjectives-outcomes",
    ],
  },
  {
    key: "n3-mind-feelings",
    title: "Mind, Feelings & Character",
    jp: "きもち・せいかく",
    description:
      "Words for judging character, noticing your own reactions, and expressing trust, doubt, and everything in between.",
    clusters: [
      "n3-b01-feelings-character",
      "n3-b02-mind-trust-personality",
      "n3-b02-feelings-social",
      "n3-b03-character-emotion",
      "n3-b04-feelings-thoughts",
      "n3-b05-noticing-impressions",
      "n3-b06-judgment-quality",
      "n3-b07-personality-mood",
      "n3-b08-emotions-values",
      "n3-b09-feelings-trust",
      "n3-b11-judgment-evaluation",
      "n3-b12-certainty-feeling",
    ],
  },
  {
    key: "n3-people-society",
    title: "People, Family & Society",
    jp: "ひと・しゃかい",
    description:
      "Family and social roles beyond N4's basics, plus the vocabulary of a nation, a community, and the written word that holds a society together.",
    clusters: [
      "n3-b01-people-roles",
      "n3-b01-society-importance",
      "n3-b02-people-relationships",
      "n3-b03-people-royalty-family",
      "n3-b06-nation-justice",
      "n3-b06-communication-relationships",
      "n3-b07-people-society",
      "n3-b09-society-knowledge-ideas",
      "n3-b11-people-relationships",
      "n3-b12-family-life-health",
    ],
  },
  {
    key: "n3-body-health",
    title: "Body & Health",
    jp: "からだ・けんこう",
    description:
      "The body, its senses, and the vocabulary of medical checkups, symptoms, and care.",
    clusters: [
      "n3-b02-health-body",
      "n3-b03-body-health",
      "n3-b04-body-senses",
      "n3-b05-body-health",
      "n3-b06-body-health",
      "n3-b08-body-health",
      "n3-b10-wishes-body",
      "n3-b11-body-face",
    ],
  },
  {
    key: "n3-nature-science",
    title: "Nature, Science & the Environment",
    jp: "しぜん・かがく",
    description:
      "The natural world at a more technical level — geography, materials, weather, and the vocabulary of science and the environment.",
    clusters: [
      "n3-b01-science-nature",
      "n3-b03-nature-animals",
      "n3-b04-weather",
      "n3-b04-nature-materials",
      "n3-b05-materials-sensory",
      "n3-b06-nature-food",
      "n3-b08-nature-geography",
      "n3-b09-geography-infrastructure",
      "n3-b09-time-weather-nature",
      "n3-b10-land-farming",
      "n3-b10-nature-japan",
      "n3-b11-nature-change-scenery",
      "n3-b12-science-craft",
      "n3-b12-nature-culture",
    ],
  },
  {
    key: "n3-business-economy",
    title: "Business, Money & Institutions",
    jp: "けいざい・きかん",
    description:
      "The vocabulary of work, money, and the institutions — companies, government, the press — that structure adult life.",
    clusters: [
      "n3-b01-money-business",
      "n3-b02-business-admin",
      "n3-b02-industry-society",
      "n3-b03-business-science",
      "n3-b04-money-finance",
      "n3-b04-business-institutions",
      "n3-b05-money-cash",
      "n3-b05-business-trade",
      "n3-b05-institutions-construction",
      "n3-b05-records-law-extras",
      "n3-b06-work-production",
      "n3-b07-housing-money",
      "n3-b07-work-career",
      "n3-b08-government",
      "n3-b08-publishing-events",
      "n3-b08-quantity-scale",
      "n3-b08-work-org-situations",
      "n3-b09-business-work",
      "n3-b10-publishing-records",
      "n3-b11-business-economy",
      "n3-b12-work-institutions-society",
    ],
  },
  {
    key: "n3-work-roles",
    title: "Achievement, Occupations & Social Life",
    jp: "しょくぎょう",
    description:
      "Careers, milestones, and the social rituals — meetings, manners, invitations — that go with adult working life.",
    clusters: [
      "n3-b01-reality-execution",
      "n3-b01-agreement-participation",
      "n3-b01-prizes-order",
      "n3-b02-growth-progress-study",
      "n3-b03-manners-feelings",
      "n3-b04-occupations-politics",
      "n3-b04-process-management",
      "n3-b04-viewing-surroundings",
      "n3-b05-social-manners-romance",
      "n3-b06-personal-fulfillment",
      "n3-b06-meeting-facing-applying",
      "n3-b10-occupations-institutions",
    ],
  },
  {
    key: "n3-objects-places",
    title: "Everyday Objects, Places & Time",
    jp: "もの・ばしょ・とき",
    description:
      "Concrete, everyday vocabulary — objects, places, and more precise ways to talk about time — that rounds out daily conversation at N3.",
    clusters: [
      "n3-b01-time-travel",
      "n3-b01-culture-objects",
      "n3-b02-everyday-objects-places",
      "n3-b03-everyday-objects-places",
      "n3-b04-home-household",
      "n3-b06-daily-objects",
      "n3-b06-time-superlatives",
      "n3-b06-places-casual",
      "n3-b07-time-night-yo-prefix",
      "n3-b07-everyday-misc",
      "n3-b08-home-travel-objects",
      "n3-b09-everyday-life",
      "n3-b10-years-age",
      "n3-b10-everyday-objects",
      "n3-b11-words-speech-atmosphere",
      "n3-b11-travel-structures",
      "n3-b11-everyday-objects-occasions",
      "n3-b12-objects-places",
    ],
  },
  {
    key: "n3-crime-safety",
    title: "Crime, Conflict & Safety",
    jp: "じけん・あんぜん",
    description:
      "Vocabulary for talking about danger, conflict, and the law — from an everyday accident to a criminal case.",
    clusters: [
      "n3-b01-incidents-conditions",
      "n3-b03-trust-conflict-law",
      "n3-b06-crime-danger",
      "n3-b08-conflict-law",
      "n3-b09-chance-danger",
      "n3-b11-crime-protection-misfortune",
    ],
  },
  {
    key: "n3-katakana",
    title: "Katakana Loanwords",
    jp: "カタカナ語",
    description:
      "Modern loanwords across sport, leisure, business, and everyday life — read at sight once you know the pattern, the same as N4's own katakana vocabulary.",
    clusters: [
      "n3-b02-katakana-loanwords",
      "n3-b06-katakana-loanwords",
      "n3-b07-katakana-loanwords",
      "n3-b09-katakana-loanwords",
      "n3-b10-katakana-loanwords",
      "n3-b11-katakana-loanwords",
      "n3-b12-katakana-loanwords",
      "n3-b05-loanwords",
    ],
  },
  {
    key: "n3-misc",
    title: "Culture, Arts & Everyday Extras",
    jp: "ぶんか・げいじゅつ",
    description:
      "A final wide-ranging stage — food, documents, the arts, rules and duty, and the everyday words that don't fit one narrow topic.",
    clusters: [
      "n3-b01-food",
      "n3-b01-writing-documents",
      "n3-b02-nature-textures-misc",
      "n3-b03-media-performance",
      "n3-b03-time-and-ichi",
      "n3-b03-fortune-sound-misc",
      "n3-b04-formal-meetings",
      "n3-b04-education",
      "n3-b04-arts-culture",
      "n3-b04-harm-illness",
      "n3-b05-rules-rights",
      "n3-b05-cooperation-danger-extremes",
      "n3-b08-groups-scale-individuality",
      "n3-b10-hatsu-compounds",
      "n3-b10-friends-compatibility",
      "n3-b10-abstract-extremes",
    ],
  },
];

export const N3_LESSONS: Lesson[] = buildLessons(
  N3_LESSON_STAGES,
  N3_WORD_CLUSTERS,
);

/** vocab id -> the number of the lesson that teaches it (N3's own numbering,
 *  independent of N5's/N4's LESSON_NUMBER_BY_WORD). */
export const N3_LESSON_NUMBER_BY_WORD: ReadonlyMap<string, number> =
  lessonNumberByWord(N3_LESSONS);

/** kanji character -> the number of the first N3 lesson whose words use it. */
export const N3_FIRST_LESSON_BY_KANJI: ReadonlyMap<string, number> =
  firstLessonByKanji(N3_LESSONS);

export function getN3Lesson(number: number): Lesson | undefined {
  return Number.isInteger(number) ? N3_LESSONS[number - 1] : undefined;
}

export function n3LessonsInStage(stageKey: string): Lesson[] {
  return N3_LESSONS.filter((lesson) => lesson.stageKey === stageKey);
}

export function n3StageForLesson(lesson: Lesson): LessonStage | undefined {
  return N3_LESSON_STAGES.find((stage) => stage.key === lesson.stageKey);
}
