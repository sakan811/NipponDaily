/**
 * Display labels for a daily word's stratum and processes. Data-free on
 * purpose: app/ components import this, and shared/words.ts (which holds the
 * entries themselves, including future days') must never reach the browser.
 */
import type { WordProcess, WordStratum } from "~~/types/index";

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
