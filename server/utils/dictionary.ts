import zlib from "node:zlib";

/** Nitro server asset name for the JMdict lookup table (see nuxt.config.ts `nitro.serverAssets`). */
const JMDICT_ASSET = "assets:jmdict";
const JMDICT_FILE = "jmdict-index.json.gz";

/** [reading, meaning, isCommon] — see scripts/build-jmdict-index.mjs. */
type JmdictCandidate = [string, string, 0 | 1];
export type JmdictIndex = Map<string, JmdictCandidate[]>;

let dictionaryPromise: Promise<JmdictIndex> | null = null;

/**
 * Lazily loads and decompresses the JMdict lookup table bundled as a Nitro
 * server asset, the same embedding pattern used for kuromoji's dictionary in
 * server/utils/tokenizer.ts (and for the same reason: serverless builds like
 * Vercel only deploy files reachable from the require/import graph). A
 * singleton like kuromoji's tokenizer, since the decompress+parse is a
 * one-time few-hundred-ms cost reused across requests.
 */
export const loadDictionary = (): Promise<JmdictIndex> => {
  if (!dictionaryPromise) {
    dictionaryPromise = (async () => {
      const bytes = await useStorage(JMDICT_ASSET).getItemRaw(JMDICT_FILE);
      if (!bytes) {
        throw new Error(`Missing JMdict dictionary asset: ${JMDICT_FILE}`);
      }
      const json = zlib
        .gunzipSync(Buffer.from(bytes as Uint8Array))
        .toString("utf-8");
      const raw = JSON.parse(json) as Record<string, JmdictCandidate[]>;
      return new Map(Object.entries(raw));
    })();
  }
  return dictionaryPromise;
};

/**
 * Best-effort English meaning for a word's dictionary-citation form. JMdict
 * only has base forms (e.g. 食べる, 表明する), not conjugations, so callers
 * must pass the word's dictionary form rather than its surface text — see
 * `dictionaryFormFor` in tokenizer.ts. Prefers a candidate whose reading
 * matches (disambiguates homograph nouns like 上/先生); otherwise falls back
 * to the most common sense.
 */
export const lookupMeaning = (
  index: JmdictIndex,
  dictionaryForm: string,
  reading: string,
): string | undefined => {
  const candidates = index.get(dictionaryForm);
  if (!candidates || candidates.length === 0) return undefined;
  const byReading = candidates.find(([r]) => r === reading);
  const [, meaning] = byReading ?? candidates[0]!;
  return meaning;
};
