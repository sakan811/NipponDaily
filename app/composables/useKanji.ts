import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useAsyncData } from "#app";
import type {
  ApiResponse,
  KanjiDetail,
  KanjiIndexPayload,
} from "~~/types/index";
import { describeError, fetchPage } from "./useDailyWord";

/** GET /api/kanji — every kanji an open word is written with. */
export function useKanjiIndex() {
  const { data, error, status, refresh } = useAsyncData(
    "kanji-index",
    (nuxtApp) =>
      fetchPage<KanjiIndexPayload>(
        nuxtApp,
        () => $fetch<ApiResponse<KanjiIndexPayload>>("/api/kanji"),
        "kanji index",
      ),
  );

  return {
    index: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value ? "Failed to load the kanji. Please try again." : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}

/** GET /api/kanji-detail?char= — one kanji and the open words written with it. */
export function useKanji(char: MaybeRefOrGetter<string>) {
  const { data, error, status, refresh } = useAsyncData(
    () => `kanji:${toValue(char)}`,
    (nuxtApp) =>
      fetchPage<KanjiDetail>(
        nuxtApp,
        () =>
          $fetch<ApiResponse<KanjiDetail>>("/api/kanji-detail", {
            query: { char: toValue(char) },
          }),
        "kanji",
      ),
  );

  return {
    kanji: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value
        ? describeError(
            error.value,
            { 404: "No word written with this kanji has opened yet." },
            "Failed to load this kanji. Please try again.",
          )
        : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}
