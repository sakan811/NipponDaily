import type { StratumKey, WordStratum } from "~~/types/index";

/** The colour of a layer's badge, on an entry and in the docs. */
export const STRATUM_BADGE: Record<WordStratum, string> = {
  wago: "primary",
  kango: "secondary",
  gairaigo: "warning",
  hybrid: "gray",
};

/** The fill each layer is drawn with — the calendar's dots and the pattern bars
 *  share it, so a colour means the same layer everywhere. */
export const STRATUM_DOT: Record<StratumKey, string> = {
  wago: "bg-primary-500",
  kango: "bg-secondary-500",
  gairaigo: "bg-warning-500",
  hybrid: "bg-stone-400",
  unstated: "bg-stone-200 dark:bg-stone-700",
};
