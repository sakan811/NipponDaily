import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useAsyncData } from "#app";
import type {
  ApiResponse,
  PartDetail,
  PartsIndexPayload,
} from "~~/types/index";
import { describeError, fetchPage } from "./useDailyWord";

/** GET /api/parts — every morpheme shown by an open word. */
export function usePartsIndex() {
  const { data, error, status, refresh } = useAsyncData(
    "parts-index",
    (nuxtApp) =>
      fetchPage<PartsIndexPayload>(
        nuxtApp,
        () => $fetch<ApiResponse<PartsIndexPayload>>("/api/parts"),
        "parts index",
      ),
  );

  return {
    index: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value ? "Failed to load the parts. Please try again." : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}

/** GET /api/part?text= — one morpheme and every open word that shows it. */
export function usePart(text: MaybeRefOrGetter<string>) {
  const { data, error, status, refresh } = useAsyncData(
    () => `part:${toValue(text)}`,
    (nuxtApp) =>
      fetchPage<PartDetail>(
        nuxtApp,
        () =>
          $fetch<ApiResponse<PartDetail>>("/api/part", {
            query: { text: toValue(text) },
          }),
        "part",
      ),
  );

  return {
    part: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value
        ? describeError(
            error.value,
            { 404: "No word has been taken apart into this part yet." },
            "Failed to load this part. Please try again.",
          )
        : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}
