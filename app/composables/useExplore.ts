import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useAsyncData } from "#app";
import type {
  ApiResponse,
  ExploreFilters,
  ExplorePayload,
  PatternsPayload,
} from "~~/types/index";
import { queryFromFilters } from "~~/shared/explore-query";
import { describeError, fetchPage } from "./useDailyWord";

/** GET /api/explore — the open words matching `filters`; refetches when they change. */
export function useExplore(filters: MaybeRefOrGetter<ExploreFilters>) {
  const { data, error, status, refresh } = useAsyncData(
    () => `explore:${JSON.stringify(toValue(filters))}`,
    (nuxtApp) =>
      fetchPage<ExplorePayload>(
        nuxtApp,
        () =>
          $fetch<ApiResponse<ExplorePayload>>("/api/explore", {
            query: queryFromFilters(toValue(filters)),
          }),
        "explore",
      ),
  );

  return {
    result: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value
        ? describeError(
            error.value,
            {
              400: "Those filters aren't valid.",
              404: "No words to explore yet.",
            },
            "Failed to load the words. Please try again.",
          )
        : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}

/** GET /api/patterns — counts across every open word. */
export function usePatterns() {
  const { data, error, status, refresh } = useAsyncData("patterns", (nuxtApp) =>
    fetchPage<PatternsPayload>(
      nuxtApp,
      () => $fetch<ApiResponse<PatternsPayload>>("/api/patterns"),
      "patterns",
    ),
  );

  return {
    patterns: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value ? "Failed to load the patterns. Please try again." : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}
