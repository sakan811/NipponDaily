import { computed } from "vue";
import { useAsyncData } from "#app";
import type { ApiResponse } from "~~/types/index";
import type { CatalogueSummary } from "~~/shared/catalogue";
import { fetchPage } from "./useDailyWord";

/**
 * GET /api/catalogue — the written word range and count, so a page never
 * types them. A failed fetch just leaves `catalogue` null; the caller falls
 * back to wording that states no number.
 */
export function useCatalogue() {
  const { data } = useAsyncData("catalogue", (nuxtApp) =>
    fetchPage<CatalogueSummary>(
      nuxtApp,
      () => $fetch<ApiResponse<CatalogueSummary>>("/api/catalogue"),
      "catalogue",
    ),
  );

  return {
    catalogue: computed(() =>
      data.value && typeof data.value.total === "number" ? data.value : null,
    ),
  };
}
