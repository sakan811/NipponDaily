import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { setResponseStatus, useAsyncData, useRequestEvent } from "#app";
import type {
  ApiResponse,
  DailyWordPayload,
  WordCalendarDay,
} from "~~/types/index";

/**
 * Shared fetch plumbing for the pages that read the catalogue. Everything here
 * goes through `useAsyncData`, so the server renders the page with its data
 * already in it (crawlers and link previews see the word, not a skeleton) and
 * the browser reuses that payload instead of fetching again.
 */

/** A readable message for a failed fetch; `notFound` is what a 404/400 means
 *  for this particular page. */
export function describeError(
  err: unknown,
  notFound: { 400?: string; 404: string },
  fallback: string,
): string {
  const status = (err as { statusCode?: number } | null)?.statusCode;
  if (status === 404) return notFound[404];
  if (status === 400 && notFound[400]) return notFound[400];
  return fallback;
}

/** Runs a fetch for `useAsyncData`; when a page fetch fails during server
 *  rendering, the HTTP response becomes a 404 so a missing or not-yet-open day
 *  is never indexed as a normal page. */
export async function fetchPage<T>(
  nuxtApp: Parameters<typeof useRequestEvent>[0],
  load: () => Promise<ApiResponse<T>>,
  label: string,
): Promise<T | null> {
  try {
    const response = await load();
    return response?.data ?? null;
  } catch (err: unknown) {
    console.error(`Error fetching ${label}:`, (err as Error)?.message ?? err);
    if (import.meta.server) {
      const status = (err as { statusCode?: number } | null)?.statusCode;
      const event = useRequestEvent(nuxtApp);
      if (event && (status === 400 || status === 404)) {
        setResponseStatus(event, 404);
      }
    }
    throw err;
  }
}

/**
 * GET /api/daily-word — the home page's word of the day (no date) and the
 * per-date page. `date` may be a getter so the page follows its route param.
 */
export function useDailyWord(date?: MaybeRefOrGetter<string | undefined>) {
  const { data, error, status, refresh } = useAsyncData(
    () => `daily-word:${toValue(date) || "today"}`,
    (nuxtApp) =>
      fetchPage<DailyWordPayload>(
        nuxtApp,
        () =>
          $fetch<ApiResponse<DailyWordPayload>>("/api/daily-word", {
            query: toValue(date) ? { date: toValue(date) } : {},
          }),
        "daily word",
      ),
  );

  return {
    payload: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value
        ? describeError(
            error.value,
            {
              400: "That day hasn't arrived yet.",
              404: "There is no word for this day.",
            },
            "Failed to load the word. Please try again.",
          )
        : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}

interface WordCalendarPayload {
  month: string;
  months: string[];
  today: string;
  days: WordCalendarDay[];
}

/** GET /api/word-calendar — one month at a time; `month` follows a getter. */
export function useWordCalendar(month?: MaybeRefOrGetter<string | undefined>) {
  const { data, error, status, refresh } = useAsyncData(
    () => `word-calendar:${toValue(month) || "current"}`,
    (nuxtApp) =>
      fetchPage<WordCalendarPayload>(
        nuxtApp,
        () =>
          $fetch<ApiResponse<WordCalendarPayload>>("/api/word-calendar", {
            query: toValue(month) ? { month: toValue(month) } : {},
          }),
        "word calendar",
      ),
  );

  return {
    calendar: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value ? "Failed to load the calendar. Please try again." : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}
