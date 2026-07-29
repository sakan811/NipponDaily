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

export type CategoryId = (typeof NEWS_CATEGORIES)[number]["id"];
export type CategoryName = (typeof VALID_CATEGORIES)[number];

export const CATEGORY_ID_TO_NAME_MAP: Record<string, CategoryName> = {
  society: "Society",
  tech: "Tech",
  "pop-culture": "Pop Culture",
  tourism: "Tourism",
  food: "Food",
  "disaster-prep": "Nature",
};

export const FETCHABLE_CATEGORY_IDS = [
  "society",
  "tech",
  "pop-culture",
  "tourism",
  "food",
  "disaster-prep",
] as const;
