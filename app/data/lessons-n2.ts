/**
 * The N2 lesson path shown at /learn?level=N2 — the N2 counterpart to
 * lessons-n3.ts. Every word in the N2 pool, laid out as a numbered sequence of
 * short lessons grouped into stages, built from N2_WORD_CLUSTERS
 * (vocab-guide-n2.ts) with lessons.ts's buildLessons()/kanjiInTerm(), reused
 * rather than duplicated. test/content/n2/vocabulary.test.ts checks that every
 * N2 vocab id is taught by exactly one lesson.
 */
import { N2_WORD_CLUSTERS } from "./vocab-guide-n2";
import {
  buildLessons,
  firstLessonByKanji,
  lessonNumberByWord,
  type Lesson,
  type LessonStage,
} from "./lessons";

export const N2_LESSON_STAGES: LessonStage[] = [
  {
    key: "n2-physical-verbs",
    title: "Physical Verbs & Transitive/Intransitive Pairs",
    jp: "どうし・ぶつり",
    description:
      "Verbs of breaking, rolling, blocking, burning, hanging, cutting and taking — many of them come in transitive/intransitive pairs (something is done to an object / it happens by itself), N4's signature pattern taken further.",
    clusters: [
      "n2-v01-break-crush",
      "n2-v02-turning-rolling-scattering",
      "n2-v03-blocked-stuck-attached",
      "n2-v04-shape-size",
      "n2-v05-heat-light",
      "n2-v06-nature-change-state",
      "n2-v07-hanging-wrapping-tying",
      "n2-v08-cutting-digging-rubbing",
      "n2-v09-taking-out-cancelling",
      "n2-v10-catching-searching-aiming",
    ],
  },
  {
    key: "n2-social-verbs",
    title: "Speech, Feelings, Duty & Movement Verbs",
    jp: "どうし・こころ",
    description:
      "The verbs of talking to people, feeling about them, doing your duty, looking, approaching and behaving — including the formal ずる verbs and humble keigo that N2 reading expects.",
    clusters: [
      "n2-v11-calling-speaking",
      "n2-v12-formal-verbs",
      "n2-v13-respect-ritual",
      "n2-v14-looking-seeing",
      "n2-v15-feelings-attitudes",
      "n2-v16-work-duty-completion",
      "n2-v17-approaching-moving",
      "n2-v18-fit-balance-appearance",
      "n2-v19-hindering-staying-behaving",
      "n2-v20-body-reactions-and-household",
      "n2-v21-giving-throwing-telling",
    ],
  },
  {
    key: "n2-adjectives",
    title: "Adjectives of Character, Atmosphere & Quality",
    jp: "けいようし",
    description:
      "い- and な-adjectives for judging people, describing a scene, textures, quality and precision — the descriptive range that separates plain N3 sentences from N2 prose.",
    clusters: [
      "n2-a01-annoying-character",
      "n2-a02-busy-dim-dangerous",
      "n2-a03-nostalgia-gratitude-admiration",
      "n2-a04-texture-weight-color",
      "n2-a05-manner-humble-frank",
      "n2-a06-quality-refinement",
      "n2-a07-appropriate-precise-unusual",
      "n2-a08-shape-direction-colour",
    ],
  },
  {
    key: "n2-time-places-travel",
    title: "Time, Places, Travel & Getting Around",
    jp: "じかん・ばしょ・りょこう",
    description:
      "The calendar, schedules and times of day, plus streets, stations, routes, regions and events — the vocabulary for planning and describing where and when.",
    clusters: [
      "n2-n01-calendar-time",
      "n2-n33-schedules-timetables",
      "n2-n32-sun-weather-times-of-day",
      "n2-n02-transport-commuting",
      "n2-n61-streets-rails-shipping",
      "n2-n48-straight-lines-routes",
      "n2-n08-geography-places",
      "n2-n17-places-landmarks-roads",
      "n2-n37-directions-viewpoints",
      "n2-n47-farming-pasture-herds",
      "n2-n62-events-gatherings-rentals",
      "n2-n67-regions-prefixes-plural",
    ],
  },
  {
    key: "n2-school-language-science",
    title: "School, Language, Writing & Science",
    jp: "がっこう・ことば・かがく",
    description:
      "School life and subjects, grammar and writing terms, books and documents, and the maths, physics and measuring vocabulary of textbooks.",
    clusters: [
      "n2-n03-holidays-work-school",
      "n2-n19-school-study-learning",
      "n2-n50-school-subjects-instruments",
      "n2-n07-grammar-writing-literature",
      "n2-n51-writing-editing-publishing",
      "n2-n63-documents-explanations",
      "n2-n22-meetings-questions-answers",
      "n2-n39-books-printing-performance",
      "n2-n16-classics-theatre-pastimes",
      "n2-n38-numbers-curves-measurement",
      "n2-n06-maths-geometry-science",
      "n2-n26-measurement-size-change",
      "n2-n60-electricity-gravity-astronomy",
      "n2-n31-concepts-structure-terms",
    ],
  },
  {
    key: "n2-people-body-health",
    title: "People, Family, Body & Health",
    jp: "ひと・からだ・けんこう",
    description:
      "Relatives and social roles, feelings toward others, the body and how it is cared for, and misfortune and complaint.",
    clusters: [
      "n2-n04-family-relatives",
      "n2-n23-people-family-names",
      "n2-n65-family-status-manner",
      "n2-n42-people-society-japan",
      "n2-n52-body-family-appearance",
      "n2-n24-body-posture-health",
      "n2-n05-fingers-health-body",
      "n2-n57-fingers-pharmacy-health",
      "n2-n13-people-misc-nouns",
      "n2-n30-reception-gratitude-feelings",
      "n2-n49-trouble-loss-conflict",
    ],
  },
  {
    key: "n2-society-business",
    title: "Society, Government, Business & Ideas",
    jp: "しゃかい・けいざい",
    description:
      "Public life and institutions, offices and procedures, commerce and money, and the abstract nouns used to discuss them.",
    clusters: [
      "n2-n09-public-law-institutions",
      "n2-n21-government-officials-rulers",
      "n2-n36-procedures-maintenance",
      "n2-n53-money-offices-procedures",
      "n2-n64-rules-limits-adjustment",
      "n2-n20-commerce-sales-prices",
      "n2-n12-change-decline-effect",
      "n2-n11-levels-sequence-scope",
      "n2-n27-foundation-work-practice",
      "n2-n54-abstract-nouns-quality-degree",
      "n2-n55-festivals-entertainment",
      "n2-n43-trains-growth-processes",
      "n2-n15-school-shrine-office",
      "n2-n14-origins-materials",
      "n2-n29-temple-garden-tools-writing",
      "n2-n56-prefixes-and-loose-nouns",
    ],
  },
  {
    key: "n2-home-nature-materials",
    title: "Home, Nature & Materials",
    jp: "いえ・しぜん・ざいりょう",
    description:
      "Household objects, rooms and clothing, fire, colour and cooking, farmland, forests and water, and the everyday stuff of a house and its surroundings.",
    clusters: [
      "n2-n10-household-objects",
      "n2-n25-home-rooms-bedding",
      "n2-n58-fixtures-fittings",
      "n2-n34-small-household-items",
      "n2-n35-clothing-textiles",
      "n2-n44-fire-volcano-power",
      "n2-n45-colours-patterns-paint",
      "n2-n46-kitchen-cooking-bottles",
      "n2-n59-metals-machine-parts",
      "n2-n18-earth-weather-eruption",
      "n2-n40-forest-timber-fishing",
      "n2-n41-water-states-hot-springs",
      "n2-n66-food-farm-nature",
      "n2-n28-daily-life-loose-ends",
    ],
  },
  {
    key: "n2-katakana",
    title: "Katakana Loanwords & Native Kana Words",
    jp: "カタカナご",
    description:
      "Loanwords for clothes, campus, sport, machines and food, plus everyday native words that are normally written in kana.",
    clusters: [
      "n2-k01-clothing-accessories",
      "n2-k02-school-media-programs",
      "n2-k03-sports-leisure-jobs",
      "n2-k04-machines-materials-tools",
      "n2-k05-body-reflexes-native-words",
      "n2-k06-food-snacks-health",
      "n2-k07-units-money-quantities",
      "n2-k08-ideas-patterns-manner",
      "n2-k09-native-kana-words",
    ],
  },
  {
    key: "n2-adverbs",
    title: "Adverbs, Connectors & Attitude Words",
    jp: "ふくし・せつぞく",
    description:
      "Sound-symbolic adverbs, adverbs of time and degree, and the connectors and attitude words that shape how a sentence is meant.",
    clusters: [
      "n2-m01-mimetic-manner",
      "n2-m02-time-degree-adverbs",
      "n2-m03-connectors-attitude",
    ],
  },
  {
    key: "n2-phrases",
    title: "Greetings, Polite Requests & Set Phrases",
    jp: "あいさつ・ていねいなひょうげん",
    description:
      "Greetings, thanks, service phrases, visiting manners, apologies and small talk words.",
    clusters: [
      "n2-m04-daily-greetings-thanks",
      "n2-m05-polite-requests-apologies",
      "n2-m06-set-phrases-misc-words",
    ],
  },
  {
    key: "n2-affixes",
    title: "Prefixes, Counters & Suffixes",
    jp: "せっとうじ・じょすうし・せつびじ",
    description:
      "The building blocks that attach to other words — prefixes, counters for things and days, and suffixes for people, places and fields.",
    clusters: [
      "n2-x01-prefixes",
      "n2-x02-counters-things",
      "n2-x03-counters-time-places",
      "n2-x04-suffixes-people-fields",
      "n2-x05-suffixes-places-things",
      "n2-x06-verb-adjective-endings",
    ],
  },
];

export const N2_LESSONS: Lesson[] = buildLessons(
  N2_LESSON_STAGES,
  N2_WORD_CLUSTERS,
);

/** vocab id -> the number of the lesson that teaches it (N2's own numbering,
 *  independent of the other levels'). */
export const N2_LESSON_NUMBER_BY_WORD: ReadonlyMap<string, number> =
  lessonNumberByWord(N2_LESSONS);

/** kanji character -> the number of the first N2 lesson whose words use it. */
export const N2_FIRST_LESSON_BY_KANJI: ReadonlyMap<string, number> =
  firstLessonByKanji(N2_LESSONS);

export function getN2Lesson(number: number): Lesson | undefined {
  return Number.isInteger(number) ? N2_LESSONS[number - 1] : undefined;
}

export function n2LessonsInStage(stageKey: string): Lesson[] {
  return N2_LESSONS.filter((lesson) => lesson.stageKey === stageKey);
}

export function n2StageForLesson(lesson: Lesson): LessonStage | undefined {
  return N2_LESSON_STAGES.find((stage) => stage.key === lesson.stageKey);
}
