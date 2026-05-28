export const NEWS_CATEGORIES = [
  { id: "all", name: "All News" },
  { id: "society", name: "Society & Prefectures" },
  { id: "tech", name: "Tech & Mobility" },
  { id: "pop-culture", name: "Pop Culture & Gaming" },
  { id: "tourism", name: "Travel & Heritage" },
  { id: "food", name: "Food & Gastronomy" },
  { id: "disaster-prep", name: "Nature & Resilience" },
] as const;

export const VALID_CATEGORIES = [
  "Society",
  "Tech",
  "Pop Culture",
  "Tourism",
  "Food",
  "Nature",
  "Other",
] as const;

export const AI_FALLBACK_SUMMARY =
  "No summary available. Read full article at source.";

export type CategoryId = (typeof NEWS_CATEGORIES)[number]["id"];
export type CategoryName = (typeof VALID_CATEGORIES)[number];
