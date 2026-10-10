import { notFound } from "../utils/api-response";
import { openDateSchema, safeGetQuery } from "../utils/http-query";
import { renderOgImage, type OgAssets } from "../utils/og-image";
import { OG_CACHE_CONTROL } from "~~/shared/endpoints";
import { entryForDate } from "~~/shared/words";

const ASSET_KEYS = {
  japanese: "og:zen-old-mincho-bold.ttf",
  latin: ["og:outfit-latin-700.woff", "og:outfit-latin-ext-700.woff"],
  glyphs: "og:glyphs.json",
};

let assetsPromise: Promise<OgAssets> | undefined;

/** The fonts bundled with the server (`server/assets/og/`), read once. */
function ogAssets(): Promise<OgAssets> {
  const storage = useStorage("assets:server");
  const raw = async (key: string): Promise<Uint8Array> => {
    const data = await storage.getItemRaw<Uint8Array>(key);
    if (!data) throw new Error(`The share-image asset ${key} is missing`);
    return data;
  };
  assetsPromise ??= (async () => {
    const [japanese, glyphs, ...latin] = await Promise.all([
      raw(ASSET_KEYS.japanese),
      raw(ASSET_KEYS.glyphs),
      ...ASSET_KEYS.latin.map(raw),
    ]);
    return {
      japanese,
      latin,
      glyphs: new Set<string>(
        (JSON.parse(Buffer.from(glyphs).toString("utf8")) as { chars: string })
          .chars,
      ),
    };
  })().catch((error) => {
    // Do not keep a failed read for ever.
    assetsPromise = undefined;
    throw error;
  });
  return assetsPromise;
}

const noImage = (date: string) =>
  notFound(`There is no share image for ${date}.`);

export default defineEventHandler(async (event) => {
  const date = String(safeGetQuery(event).date ?? "");

  // An upcoming or unknown day is a 404 either way, so the image cannot be
  // used to learn a word before its day.
  if (!openDateSchema.safeParse(date).success) throw noImage(date);
  const entry = entryForDate(date);
  if (!entry) throw noImage(date);

  const png = await renderOgImage(entry, await ogAssets());
  setHeader(event, "content-type", "image/png");
  setHeader(event, "cache-control", OG_CACHE_CONTROL);
  return Buffer.from(png);
});
