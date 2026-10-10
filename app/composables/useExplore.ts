import { toValue, type MaybeRefOrGetter } from "vue";
import type {
  ExploreFilters,
  ExplorePayload,
  PatternsPayload,
} from "~~/types/index";
import { queryFromFilters } from "~~/shared/explore-query";
import { useApiData } from "./useApiData";

/** GET /api/explore — the open words matching `filters`; refetches when they change. */
export function useExplore(filters: MaybeRefOrGetter<ExploreFilters>) {
  const { data, ...rest } = useApiData<ExplorePayload>({
    key: () => `explore:${JSON.stringify(toValue(filters))}`,
    path: "/api/explore",
    query: () => queryFromFilters(toValue(filters)),
    label: "explore",
    failed: "Failed to load the words. Please try again.",
    errors: {
      400: "Those filters aren't valid.",
      404: "No words to explore yet.",
    },
  });
  return { result: data, ...rest };
}

/** GET /api/patterns — counts across every open word. */
export function usePatterns() {
  const { data, ...rest } = useApiData<PatternsPayload>({
    key: "patterns",
    path: "/api/patterns",
    label: "patterns",
    failed: "Failed to load the patterns. Please try again.",
  });
  return { patterns: data, ...rest };
}
