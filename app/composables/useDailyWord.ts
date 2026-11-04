import { toValue, type MaybeRefOrGetter } from "vue";
import type { DailyWordPayload } from "~~/types/index";
import { useApiData } from "./useApiData";
import { ROUTES } from "~~/shared/routes";

/**
 * GET /api/daily-word — the home page's word of the day (no date) and the
 * per-date page. `date` may be a getter so the page follows its route param.
 */
export function useDailyWord(date?: MaybeRefOrGetter<string | undefined>) {
  const { data, ...rest } = useApiData<DailyWordPayload>({
    key: () => `daily-word:${toValue(date) || "today"}`,
    path: ROUTES.dailyWord,
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
