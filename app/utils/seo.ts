import type { ExploreFilters, WordEntry } from "~~/types/index";
import { queryFromFilters } from "~~/shared/explore-query";

/** Cuts `text` to at most `max` characters at a word boundary, with an ellipsis. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.—-]+$/, "")}…`;
}

/** The path to a word's share image (`GET /og.png`). */
export function shareImagePath(date: string): string {
  return `/og.png?date=${date}`;
}

/** The tab title for a word: the word, its reading, its meaning. */
export function wordTitle(entry: Pick<WordEntry, "term" | "kana" | "meaning">) {
  return `${entry.term} (${entry.kana}) — ${entry.meaning}`;
}

/** The search/preview snippet for a word. Only fields that are already on the
 *  page: the pool meaning, the parts (when shown) and the hand-written headline. */
export function wordDescription(
  entry: Pick<
    WordEntry,
    "term" | "kana" | "meaning" | "headline" | "morphemes"
  >,
): string {
  const parts = entry.morphemes.length
    ? ` Taken apart: ${entry.morphemes.map((m) => m.text).join(" + ")}.`
    : "";
  return truncate(
    `${entry.term} (${entry.kana}), ${entry.meaning}.${parts} ${entry.headline}`,
  );
}

/** The path of a part's page. */
export function partPath(text: string): string {
  return `/parts/${encodeURIComponent(text)}`;
}

/** The Explore page narrowed by `filters`, as a link. */
export function explorePath(filters: ExploreFilters): string {
  return `/explore?${new URLSearchParams(queryFromFilters(filters)).toString()}`;
}
