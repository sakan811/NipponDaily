import { toValue, type MaybeRefOrGetter } from "vue";
import type {
  ExploreFilters,
  ExplorePayload,
  PatternsPayload,
} from "~~/types/index";
import { queryFromFilters } from "~~/shared/explore-query";
import { useApiData } from "./useApiData";
import { EXPLORE_PAGE_SIZE } from "~~/shared/limits";
import { ROUTES } from "~~/shared/routes";

/** GET /api/explore — the newest `limit` open words matching `filters`;
 *  refetches when either changes. */
export function useExplore(
  filters: MaybeRefOrGetter<ExploreFilters>,
  limit: MaybeRefOrGetter<number> = EXPLORE_PAGE_SIZE,
) {
  const { data, ...rest } = useApiData<ExplorePayload>({
    key: () => `explore:${JSON.stringify(toValue(filters))}:${toValue(limit)}`,
    path: ROUTES.explore,
    query: () => ({
      ...queryFromFilters(toValue(filters)),
      // The server's default is one page, so only a longer list is asked for.
      ...(toValue(limit) > EXPLORE_PAGE_SIZE
        ? { limit: String(toValue(limit)) }
        : {}),
    }),
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
    path: ROUTES.patterns,
    label: "patterns",
    failed: "Failed to load the patterns. Please try again.",
  });
  return { patterns: data, ...rest };
}
