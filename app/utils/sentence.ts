import type { SentencePart } from "~~/types/index";

/** A stretch of a sentence to draw: its text, the reading shown over it (if
 *  any), and whether it is the word's own form, which the page marks. */
export interface SentencePiece {
  text: string;
  reading?: string;
  hit: boolean;
}

/**
 * A sentence in pieces, so the word's own form can be marked and the readings
 * drawn over their kanji. `furigana` joins back to `ja` (checked when the data
 * is built); without it the sentence is plain text. A reading never crosses
 * the edge of `form`, so a piece is wholly inside it or wholly outside.
 */
export function sentencePieces(
  ja: string,
  form: string,
  furigana?: SentencePart[],
): SentencePiece[] {
  const parts: SentencePart[] =
    furigana && furigana.map((p) => p[0]).join("") === ja ? furigana : [[ja]];
  const from = ja.indexOf(form);
  const to = from + form.length;
  const pieces: SentencePiece[] = [];
  let offset = 0;
  for (const [text, reading] of parts) {
    const end = offset + text.length;
    if (reading || from < 0 || end <= from || offset >= to) {
      pieces.push({
        text,
        reading,
        hit: from >= 0 && offset >= from && end <= to,
      });
    } else {
      // Plain text that holds an edge of the form: cut it there.
      const cuts = [offset, from, to, end].filter(
        (c) => c >= offset && c <= end,
      );
      for (let i = 0; i < cuts.length - 1; i++)
        if (cuts[i]! < cuts[i + 1]!)
          pieces.push({
            text: ja.slice(cuts[i], cuts[i + 1]),
            hit: cuts[i]! >= from && cuts[i + 1]! <= to,
          });
    }
    offset = end;
  }
  return pieces;
}
