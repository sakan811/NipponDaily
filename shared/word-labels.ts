/**
 * Display labels for a daily word's stratum and processes. Data-free on
 * purpose: app/ components import this, and shared/words.ts (which holds the
 * entries themselves, including future days') must never reach the browser.
 */
import type {
  FrequencyGroup,
  PosGroup,
  WordProcess,
  WordStratum,
} from "~~/types/index";

export const WORD_STRATA: Record<
  WordStratum,
  { label: string; native: string; description: string }
> = {
  wago: {
    label: "Native Japanese",
    native: "和語",
    description:
      "Words that were already Japanese before Chinese vocabulary arrived — usually written with kun'yomi and often short.",
  },
  kango: {
    label: "Sino-Japanese",
    native: "漢語",
    description:
      "Words built from Chinese-derived morphemes — borrowed from Chinese or coined in Japan out of Chinese parts — read with on'yomi.",
  },
  gairaigo: {
    label: "Loanword",
    native: "外来語",
    description:
      "Words taken from a language other than Chinese, mostly European ones, usually written in katakana.",
  },
  hybrid: {
    label: "Hybrid",
    native: "混種語",
    description:
      "Words that mix layers, e.g. a native part with a Chinese one.",
  },
};

export const WORD_PROCESSES: Record<
  WordProcess,
  { label: string; description: string }
> = {
  compound: {
    label: "Compound",
    description: "Two or more words or stems joined into one.",
  },
  derivation: {
    label: "Derivation",
    description: "A word built from a stem plus a suffix or prefix.",
  },
  rendaku: {
    label: "Rendaku",
    description:
      "The first sound of the second part voices when two native words join (kami → -gami).",
  },
  wasei: {
    label: "Made in Japan",
    description:
      "Coined in Japan from foreign material (wasei-kango, wasei-eigo), not borrowed whole.",
  },
  borrowing: {
    label: "Borrowing",
    description: "Taken over from another language.",
  },
  clipping: {
    label: "Clipping",
    description: "A longer word or phrase shortened in everyday use.",
  },
  "sound-change": {
    label: "Sound change",
    description: "The pronunciation shifted over the centuries.",
  },
  "meaning-shift": {
    label: "Meaning shift",
    description: "The word's meaning moved away from where it started.",
  },
  ateji: {
    label: "Ateji",
    description:
      "Kanji chosen for their sound or sense after the word existed.",
  },
  reread: {
    label: "Re-reading",
    description:
      "A native word whose spelling later picked up a Chinese reading.",
  },
  unclear: {
    label: "Origin unclear",
    description: "Scholars disagree, or nobody knows.",
  },
};

/** Words Wiktionary uses when it is not sure. A quoted line containing one is
 *  shown as "not settled" — detected, never written by hand. */
const HEDGE =
  /\b(probably|possibly|perhaps|likely|may be|may have|might|appears? to|seems? to|apparently|uncertain|unknown|unclear|speculat\w*|alternatively|theor(?:y|ies)|missing or incomplete|incomplete|disputed|doubtful)\b/i;

export const isHedged = (quote: string): boolean => HEDGE.test(quote);

/** How a word with no stated layer is named wherever layers are listed. */
export const STRATUM_UNSTATED = {
  label: "Not stated",
  native: "",
  description:
    "Neither KANJIDIC2's readings nor the cited text establish a layer for these words (irregular spellings, for example), so none is claimed.",
};

/** JMdict's part-of-speech tags are long and fine-grained (a dozen Godan
 *  endings, three noun senses), so Explore filters on these coarse groups. The
 *  tags themselves stay verbatim on each entry; a group only says which tags
 *  fall under it. */
export const POS_GROUPS: Record<
  PosGroup,
  { label: string; description: string }
> = {
  noun: {
    label: "Noun",
    description:
      "Common nouns, nouns that take suru, and nouns that take the particle の.",
  },
  verb: {
    label: "Verb",
    description:
      "Godan and Ichidan verbs, transitive and intransitive, and the irregular ones.",
  },
  adjective: {
    label: "Adjective",
    description:
      "い-adjectives, な-adjectives (JMdict's adjectival nouns) and pre-noun adjectivals.",
  },
  adverb: { label: "Adverb", description: "Adverbs." },
  affix: {
    label: "Prefix or suffix",
    description:
      "Prefixes and suffixes, including nouns used as one (JMdict's “noun, used as a suffix”).",
  },
  other: {
    label: "Other",
    description:
      "Pronouns, counters, numerals, conjunctions, interjections, auxiliary verbs and set phrases.",
  },
  unstated: {
    label: "Not stated",
    description: "JMdict has no entry for these words, so no tag is given.",
  },
};

export const POS_GROUP_IDS = Object.keys(POS_GROUPS) as PosGroup[];

/** Which group one JMdict tag falls under. Order matters: the affix and
 *  “noun or verb” cases must be read before the general noun and verb rules. */
export function posGroupOfTag(tag: string): Exclude<PosGroup, "unstated"> {
  if (/^nouns?, used as an? (suffix|prefix)/.test(tag)) return "affix";
  if (/^(suffix|prefix)$/.test(tag)) return "affix";
  if (/^noun or verb/.test(tag)) return "other";
  if (/^nouns?\b/.test(tag)) return "noun";
  if (/^(adjective|adjectival|pre-noun adjectival)/.test(tag))
    return "adjective";
  if (/^adverb/.test(tag)) return "adverb";
  if (/^auxiliary verb/.test(tag)) return "other";
  if (/verb/.test(tag)) return "verb";
  return "other";
}

/** The groups a word's tags fall under, in POS_GROUPS order — a word can sit
 *  in more than one (a noun that also takes suru and is used as an adverb);
 *  a word with no tags is "unstated". */
export function posGroupsOf(pos: readonly string[]): PosGroup[] {
  if (!pos.length) return ["unstated"];
  const found = new Set<PosGroup>(pos.map(posGroupOfTag));
  return POS_GROUP_IDS.filter((g) => found.has(g));
}

/** How common a word is, from JMdict's own priority codes. The codes stay
 *  verbatim on each entry; a group only says which codes fall under it. */
export const FREQUENCY_GROUPS: Record<
  FrequencyGroup,
  { label: string; description: string }
> = {
  common: {
    label: "Common",
    description:
      "JMdict counts the word as common: its spelling or reading is in the first tier of a frequency list (ichi1, news1, spec1, spec2 or gai1).",
  },
  less: {
    label: "Less common",
    description:
      "JMdict ranks the word, but only in a lower tier (news2, ichi2, gai2) or by a frequency band alone (nf01–nf48).",
  },
  unlisted: {
    label: "Not ranked",
    description:
      "JMdict gives the word no priority code, which says it is not in the lists it draws on, not that it is rare.",
  },
};

export const FREQUENCY_IDS = Object.keys(FREQUENCY_GROUPS) as FrequencyGroup[];

/** The first-tier codes JMdict treats as marking a common word. */
const COMMON_PRIORITY = /^(?:ichi1|news1|spec1|spec2|gai1)$/;

/** Which group an entry's priority codes fall under. */
export function frequencyOf(priority: readonly string[] = []): FrequencyGroup {
  if (priority.some((p) => COMMON_PRIORITY.test(p))) return "common";
  return priority.length ? "less" : "unlisted";
}

/** What KANJIDIC2's school grade means. */
export function kanjiGradeLabel(grade: number): string {
  if (grade >= 1 && grade <= 6)
    return `Taught in grade ${grade} (kyōiku kanji)`;
  if (grade === 8) return "Jōyō kanji taught in secondary school";
  if (grade === 9 || grade === 10) return "Jinmeiyō kanji, used in names";
  return `Grade ${grade}`;
}
