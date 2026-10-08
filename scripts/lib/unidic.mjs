/**
 * A second morphological analyser for the furigana (scripts/lib/furigana.mjs):
 * Lindera with the UniDic dictionary (`lindera-wasm-nodejs-unidic`, pinned in
 * package.json, embedded in the package and run offline).
 *
 * kuromoji uses IPADIC and Tatoeba's own software is MeCab, so their mistakes
 * may agree. UniDic is a different dictionary built on different corpora, so
 * where it hears the same reading it is an independent witness.
 *
 * UniDic gives a token's reading as its dictionary form's (済む is スム, even in
 * 済ま), where kuromoji gives the surface reading (スマ). `shapeTokens` turns
 * the first into the second, the shape furiganaFor already reads, and says
 * nothing (`*`) where that cannot be done safely (来る read き, 為る read し).
 */
import { createRequire } from "node:module";
import { toKatakana } from "wanakana";

const require = createRequire(import.meta.url);

export const UNIDIC_PACKAGE = {
  name: "lindera-wasm-nodejs-unidic",
  version: require("lindera-wasm-nodejs-unidic/package.json").version,
};

const TAIL = /\p{sc=Hiragana}*$/u;

/** The surface reading of one UniDic token, in katakana, or `*`. */
function surfaceReading(token) {
  const { surface, orthographicBaseForm: base, reading } = token;
  // Unknown words carry no dictionary details.
  if (typeof reading !== "string" || !reading) return "*";
  if (typeof base !== "string" || typeof surface !== "string") return "*";
  if (!base || base === "*" || base === surface) return reading;
  // An inflected token: the dictionary reading less the base form's okurigana,
  // plus the okurigana the sentence has. Without okurigana in the sentence
  // (来 for 来る) the stem may change and nothing is claimed.
  const baseTail = base.match(TAIL)[0];
  const tail = surface.match(TAIL)[0];
  const lemmaTail = toKatakana(baseTail);
  if (!baseTail || !tail || !reading.endsWith(lemmaTail)) return "*";
  return reading.slice(0, reading.length - lemmaTail.length) + toKatakana(tail);
}

/** UniDic's tokens in the shape of kuromoji's: `{ surface_form, reading,
 *  basic_form }`, the reading in katakana. */
export function shapeTokens(tokens) {
  return tokens.map((t) => ({
    surface_form: t.surface,
    reading: surfaceReading(t),
    basic_form:
      typeof t.orthographicBaseForm === "string" &&
      t.orthographicBaseForm !== "*"
        ? t.orthographicBaseForm
        : "*",
  }));
}

/** `{ tokenize(text) }`, as kuromoji's tokenizer has it. */
export function openUnidic() {
  const lindera = require("lindera-wasm-nodejs-unidic");
  const builder = new lindera.TokenizerBuilder();
  builder.setMode("normal");
  builder.setDictionary("embedded://unidic");
  const tokenizer = builder.build();
  return {
    tokenize: (text) => shapeTokens(tokenizer.tokenize(text)),
  };
}
