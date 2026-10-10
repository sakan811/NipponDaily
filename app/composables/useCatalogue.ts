import { computed } from "vue";
import type { CatalogueSummary } from "~~/shared/catalogue";
import { useApiData } from "./useApiData";

/**
 * GET /api/catalogue — the written word range and count, so a page never
 * types them. A failed fetch just leaves `catalogue` null; the caller falls
 * back to wording that states no number.
 */
export function useCatalogue() {
  const { data } = useApiData<CatalogueSummary>({
    key: "catalogue",
    path: "/api/catalogue",
    label: "catalogue",
  });

  return {
    catalogue: computed(() =>
      data.value && typeof data.value.total === "number" ? data.value : null,
    ),
  };
}
