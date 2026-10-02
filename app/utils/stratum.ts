import type { StratumKey } from "~~/types/index";

/** The fill each layer is drawn with — the calendar's dots and the pattern bars
 *  share it, so a colour means the same layer everywhere. */
export const STRATUM_DOT: Record<StratumKey, string> = {
  wago: "bg-primary-500",
  kango: "bg-secondary-500",
  gairaigo: "bg-warning-500",
  hybrid: "bg-stone-400",
  unstated: "bg-stone-200 dark:bg-stone-700",
};
