/**
 * The documentation, as a book: every chapter written once. The `/docs` index,
 * each chapter's title, description and canonical path, the contents rail,
 * the previous/next links, the home page and the sitemap all read this list.
 * Data-free, so it is safe for `app/`. A test keeps it in step with
 * `app/pages/docs/`.
 */

export const DOC_PARTS = [
  "The idea",
  "How it is built",
  "The words",
  "Working on it",
] as const;

export type DocPart = (typeof DOC_PARTS)[number];

export interface DocChapter {
  slug: string;
  part: DocPart;
  title: string;
  /** One sentence: the chapter's lede, its card on the index and its meta description. */
  summary: string;
}

export const DOC_CHAPTERS: readonly DocChapter[] = [
  {
    slug: "core-theme",
    part: "The idea",
    title: "Core theme",
    summary:
      "What the app is, why time is its theme, and the five principles every feature is checked against.",
  },
  {
    slug: "features",
    part: "The idea",
    title: "Core features",
    summary:
      "What a reader gets: a word a day, a calendar, patterns across the words, the evidence behind every claim, and no tracking.",
  },
  {
    slug: "architecture",
    part: "How it is built",
    title: "Architecture",
    summary:
      "The stack, the layout, and the one rule that keeps upcoming words out of the browser.",
  },
  {
    slug: "words",
    part: "How it is built",
    title: "Daily words",
    summary:
      "What an entry holds, when a day opens, and how the app reads across the words.",
  },
  {
    slug: "api",
    part: "How it is built",
    title: "API",
    summary: "Every endpoint, what it returns and when it answers an error.",
  },
  {
    slug: "seasons",
    part: "How it is built",
    title: "Seasons",
    summary:
      "How the year clock works: the cron, the site theme and the reader's own pick.",
  },
  {
    slug: "color-palette",
    part: "How it is built",
    title: "Colour and shape",
    summary:
      "The four seasonal palettes, named, and the shape language each season gives the UI.",
  },
  {
    slug: "error-states",
    part: "How it is built",
    title: "Error and fallback states",
    summary:
      "A live catalogue of every degraded, empty or failure state the UI can render.",
  },
  {
    slug: "data-integrity",
    part: "The words",
    title: "Data integrity",
    summary:
      "Where every claim comes from, how an entry is generated and checked, and the licences behind the sources.",
  },
  {
    slug: "authoring",
    part: "The words",
    title: "Adding and fixing words",
    summary:
      "How to add a month, correct a word, refresh the sources and read a failing check.",
  },
  {
    slug: "development",
    part: "Working on it",
    title: "Development",
    summary:
      "Setup, environment, commands, tests, and how these docs are kept true.",
  },
  {
    slug: "roadmap",
    part: "Working on it",
    title: "Roadmap and limits",
    summary: "What is not built yet, and what the app cannot promise.",
  },
];

/** The book's front page, `/docs`: the contents. */
export const DOC_FRONT = {
  part: "Contents",
  title: "Documentation",
  summary:
    "How NipponDaily works, as a short book: the idea, how it is built, how the words are made and checked, and how to work on it.",
} as const;

export const docPath = (slug: string): string => `/docs/${slug}`;

export const DOC_PATHS: readonly string[] = [
  "/docs",
  ...DOC_CHAPTERS.map((c) => docPath(c.slug)),
];

export const chapterBySlug = (slug: string): DocChapter | undefined =>
  DOC_CHAPTERS.find((c) => c.slug === slug);

/** 1-based position in the book, or 0 for an unknown slug. */
export const chapterNumber = (slug: string): number =>
  DOC_CHAPTERS.findIndex((c) => c.slug === slug) + 1;

const KANJI_DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

/** 1 → 一, 12 → 十二, 20 → 二十 (chapter numbers only, so up to 99). */
export function kanjiNumeral(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 99) return String(n);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${tens > 1 ? KANJI_DIGITS[tens] : ""}${tens ? "十" : ""}${KANJI_DIGITS[ones]}`;
}

/** The chapters either side of one; the front page's next is the first chapter. */
export function neighbours(slug?: string): {
  prev: DocChapter | null;
  next: DocChapter | null;
} {
  if (!slug) return { prev: null, next: DOC_CHAPTERS[0] ?? null };
  const i = DOC_CHAPTERS.findIndex((c) => c.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: DOC_CHAPTERS[i - 1] ?? null,
    next: DOC_CHAPTERS[i + 1] ?? null,
  };
}
