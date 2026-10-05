import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { OgAssets } from "~/server/utils/og-image";

const dir = join(process.cwd(), "server/assets/og");
const read = (name: string) => readFileSync(join(dir, name));

/** The bundled share-image fonts, read from disk as the server reads them
 *  from its assets. */
export const ogAssetFiles = {
  "og:zen-old-mincho-bold.ttf": read("zen-old-mincho-bold.ttf"),
  "og:outfit-latin-700.woff": read("outfit-latin-700.woff"),
  "og:outfit-latin-ext-700.woff": read("outfit-latin-ext-700.woff"),
  "og:glyphs.json": read("glyphs.json"),
} as const;

export const ogAssets: OgAssets = {
  japanese: ogAssetFiles["og:zen-old-mincho-bold.ttf"],
  latin: [
    ogAssetFiles["og:outfit-latin-700.woff"],
    ogAssetFiles["og:outfit-latin-ext-700.woff"],
  ],
  glyphs: new Set<string>(
    (
      JSON.parse(ogAssetFiles["og:glyphs.json"].toString("utf8")) as {
        chars: string;
      }
    ).chars,
  ),
};
