import { describe, it, expect } from "vitest";
import { loadReference, type RefVocab } from "./reference";
import {
  readingIsAttested,
  // @ts-expect-error — untyped .mjs authoring helper
} from "../../scripts/lib/authoring-evidence.mjs";

/**
 * Every served word's reading — at every level, including N2, which has no
 * hand-written content to gate yet — must be a reading JMdict actually gives
 * for the entries matched to that word. This is the one `pnpm data:audit`
 * check strict enough to gate: a word whose kana JMdict doesn't attest is a
 * wrong-reading bug (目下 read めした carrying 'at present' was one — fixed by
 * a VOCAB_FORM_CORRECTIONS entry, see shared/meanings.ts). The audit's
 * meaning checks stay a review queue rather than a gate because synonyms
 * ("café" / "coffee shop") legitimately fail them.
 */
describe.each(["N5", "N4", "N3", "N2"])("%s readings", (level) => {
  it("are all attested by JMdict", () => {
    const unattested = loadReference(level)
      .vocab.filter((v: RefVocab) => !readingIsAttested(v))
      .map((v: RefVocab) => `${v.id}: ${v.term} (${v.kana})`);
    expect(
      unattested,
      "kana JMdict doesn't give for this word — correct it in shared/meanings.ts VOCAB_FORM_CORRECTIONS",
    ).toEqual([]);
  });
});
