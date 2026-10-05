import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { WordEntry } from "~~/types/index";
import {
  OG_HEIGHT,
  OG_JAPANESE_FONT,
  OG_LATIN_FONT,
  OG_WIDTH,
  ogCard,
} from "~~/shared/og-card";

/** What a card is drawn with, from `server/assets/og/` (`pnpm assets:og-font`). */
export interface OgAssets {
  /** Zen Old Mincho Bold, subset. */
  japanese: Uint8Array;
  /** Outfit Bold, Latin and Latin Extended. */
  latin: Uint8Array[];
  /** Every character the fonts can draw. */
  glyphs: ReadonlySet<string>;
}

const font = (name: string, data: Uint8Array) => ({
  name,
  data: data as unknown as ArrayBuffer,
  weight: 700 as const,
  style: "normal" as const,
});

/** Draws one word's share image as a PNG. satori turns the text into
 *  outlines, so the rasteriser needs no font of its own. */
export async function renderOgImage(
  entry: WordEntry,
  assets: OgAssets,
): Promise<Uint8Array> {
  const svg = await satori(
    ogCard(entry, assets.glyphs) as unknown as Parameters<typeof satori>[0],
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [
        font(OG_JAPANESE_FONT, assets.japanese),
        ...assets.latin.map((data) => font(OG_LATIN_FONT, data)),
      ],
    },
  );
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } })
    .render()
    .asPng();
}
