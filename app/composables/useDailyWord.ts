import { toValue, type MaybeRefOrGetter } from "vue";
import type {
  DailyWordPayload,
  ExploreFilters,
  WordCalendarPayload,
} from "~~/types/index";
import { queryFromFilters } from "~~/shared/explore-query";
import { useApiData } from "./useApiData";

/**
 * GET /api/daily-word — the home page's word of the day (no date) and the
 * per-date page. `date` may be a getter so the page follows its route param.
 */
export function useDailyWord(date?: MaybeRefOrGetter<string | undefined>) {
  const { data, ...rest } = useApiData<DailyWordPayload>({
    key: () => `daily-word:${toValue(date) || "today"}`,
    path: "/api/daily-word",
    query: () => (toValue(date) ? { date: toValue(date) } : {}),
    label: "daily word",
    failed: "Failed to load the word. Please try again.",
    errors: {
      400: "That day hasn't arrived yet.",
      404: "There is no word for this day.",
    },
  });
  return { payload: data, ...rest };
}

/** GET /api/word-calendar — one month at a time, marked against `filters`;
 *  `month` and `filters` follow getters and refetch when they change. */
export function useWordCalendar(
  month?: MaybeRefOrGetter<string | undefined>,
  filters?: MaybeRefOrGetter<ExploreFilters>,
) {
  const { data, ...rest } = useApiData<WordCalendarPayload>({
    key: () =>
      `word-calendar:${toValue(month) || "current"}:${JSON.stringify(toValue(filters) ?? {})}`,
    path: "/api/word-calendar",
    query: () => ({
      ...(toValue(month) ? { month: toValue(month) } : {}),
      ...queryFromFilters(toValue(filters) ?? {}),
    }),
    label: "word calendar",
    failed: "Failed to load the calendar. Please try again.",
  });
  return { calendar: data, ...rest };
}
