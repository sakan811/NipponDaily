/**
 * Which reading does each Etymology section of a Wiktionary Japanese entry
 * belong to? A page like 大人 has one section per reading (おとな, うし,
 * たいじん, だいにん); quoting the wrong one misattributes the claim. The
 * page's own templates say which: `{{ja-pron|おとな|…}}` and the headword
 * line (`{{ja-noun|おとな}}`) inside each section. Pure functions — the builder
 * (scripts/build-etymology-reference.mjs) records the result in the snapshot.
 */
import { toHiragana } from "wanakana";

const HEADWORD =
  /\{\{ja-(?:pron|noun|verb|verb-suru|suru|adj|na-adj|adv|phrase|pos|pron-noun|det|conj|interj|prefix|suffix|counter|proper noun|num|particle)\|([^|}=]*)/g;

/** The Japanese language section's Etymology sections, as raw wikitext, in
 *  page order (the same order the rendered HTML lists them). */
export function japaneseEtymologyWikitexts(wikitext) {
  const start = wikitext.search(/^==Japanese==\s*$/m);
  if (start === -1) return [];
  const rest = wikitext.slice(start + "==Japanese==".length);
  const end = rest.search(/^==[^=]/m);
  const body = end === -1 ? rest : rest.slice(0, end);
  const heads = [...body.matchAll(/^===\s*Etymology(?: \d+)?\s*===\s*$/gm)];
  return heads.map((h, i) =>
    body.slice(h.index + h[0].length, heads[i + 1]?.index ?? body.length),
  );
}

/** The hiragana readings one section's templates declare, deduplicated. */
export function readingsOf(sectionWikitext) {
  const out = [];
  for (const m of sectionWikitext.matchAll(HEADWORD)) {
    const raw = m[1].trim().replace(/[<_.].*$/, "");
    const kana = toHiragana(raw);
    if (/^[\p{sc=Hiragana}ー]+$/u.test(kana) && !out.includes(kana))
      out.push(kana);
  }
  return out;
}
