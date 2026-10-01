import { ref } from "vue";
import type {
  ApiResponse,
  DailyWordPayload,
  WordCalendarDay,
} from "~~/types/index";

/**
 * Shared fetch logic for GET /api/daily-word, used by the home page's
 * word-of-the-day and the per-date page, so neither repeats the same
 * loading/error handling. Call fetchWord() with no date for today's word.
 */
export function useDailyWord() {
  const payload = ref<DailyWordPayload | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchWord = async (date?: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    payload.value = null;

    try {
      const response = await $fetch<ApiResponse<DailyWordPayload>>(
        "/api/daily-word",
        { query: date ? { date } : {} },
      );
      if (response?.data) {
        payload.value = response.data;
      }
    } catch (err: unknown) {
      console.error("Error fetching daily word:", err);
      const status = (err as { statusCode?: number })?.statusCode;
      error.value =
        status === 404
          ? "There is no word for this day."
          : status === 400
            ? "That day hasn't arrived yet."
            : "Failed to load the word. Please try again.";
    } finally {
      loading.value = false;
    }
  };

  return { payload, loading, error, fetchWord };
}

interface WordCalendarPayload {
  month: string;
  months: string[];
  today: string;
  days: WordCalendarDay[];
}

/** Shared fetch logic for GET /api/word-calendar — one month at a time. */
export function useWordCalendar() {
  const calendar = ref<WordCalendarPayload | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMonth = async (month?: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<ApiResponse<WordCalendarPayload>>(
        "/api/word-calendar",
        { query: month ? { month } : {} },
      );
      if (response?.data) {
        calendar.value = response.data;
      }
    } catch (err: unknown) {
      console.error("Error fetching word calendar:", err);
      error.value = "Failed to load the calendar. Please try again.";
    } finally {
      loading.value = false;
    }
  };

  return { calendar, loading, error, fetchMonth };
}
