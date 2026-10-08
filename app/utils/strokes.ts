/**
 * Helpers for drawing a kanji's strokes (KanjiVG paths on a 109 by 109
 * square). The paths come from the server as they are; this only reads where
 * each begins so a number can be put there.
 */

/** The square every path is drawn on. */
export const STROKE_VIEWBOX = "0 0 109 109";

/** Where a stroke begins: the first move-to of its path data (`m` counts as `M` at the start of a path). */
export function strokeStart(d: string): { x: number; y: number } | undefined {
  const m = /^\s*[Mm]\s*(-?[\d.]+)[\s,]*(-?[\d.]+)/.exec(d);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : undefined;
}
