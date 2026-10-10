import { toValue, type MaybeRefOrGetter } from "vue";
import type { KanjiDetail, KanjiIndexPayload } from "~~/types/index";
import { useApiData } from "./useApiData";

/** GET /api/kanji — every kanji an open word is written with. */
export function useKanjiIndex() {
  const { data, ...rest } = useApiData<KanjiIndexPayload>({
    key: "kanji-index",
    path: "/api/kanji",
    label: "kanji index",
    failed: "Failed to load the kanji. Please try again.",
  });
  return { index: data, ...rest };
}

/** GET /api/kanji-detail?char= — one kanji and the open words written with it. */
export function useKanji(char: MaybeRefOrGetter<string>) {
  const { data, ...rest } = useApiData<KanjiDetail>({
    key: () => `kanji:${toValue(char)}`,
    path: "/api/kanji-detail",
    query: () => ({ char: toValue(char) }),
    label: "kanji",
    failed: "Failed to load this kanji. Please try again.",
    errors: { 404: "No word written with this kanji has opened yet." },
  });
  return { kanji: data, ...rest };
}
