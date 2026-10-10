import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useAsyncData } from "#app";
import type {
  ApiResponse,
  PartDetail,
  PartsIndexPayload,
  RelatedPayload,
} from "~~/types/index";
import { useApiData } from "./useApiData";

/** GET /api/parts — every morpheme shown by an open word. */
export function usePartsIndex() {
  const { data, ...rest } = useApiData<PartsIndexPayload>({
    key: "parts-index",
    path: "/api/parts",
    label: "parts index",
    failed: "Failed to load the parts. Please try again.",
  });
  return { index: data, ...rest };
}

/** GET /api/part?text= — one morpheme and every open word that shows it. */
export function usePart(text: MaybeRefOrGetter<string>) {
  const { data, ...rest } = useApiData<PartDetail>({
    key: () => `part:${toValue(text)}`,
    path: "/api/part",
    query: () => ({ text: toValue(text) }),
    label: "part",
    failed: "Failed to load this part. Please try again.",
    errors: { 404: "No word has been taken apart into this part yet." },
  });
  return { part: data, ...rest };
}

/** GET /api/related?date= — open words that resemble one entry. Supplementary:
 *  the page shows the row only when it loads, so a failure is not an error state. */
export function useRelatedWords(date: MaybeRefOrGetter<string>) {
  const { data } = useAsyncData(
    () => `related:${toValue(date)}`,
    async () => {
      // Not fetchPage: a failure here must never turn the whole page into a 404.
      try {
        const response = await $fetch<ApiResponse<RelatedPayload>>(
          "/api/related",
          { query: { date: toValue(date) } },
        );
        return response?.data ?? null;
      } catch {
        return null;
      }
    },
  );

  return { related: computed(() => data.value ?? null) };
}
