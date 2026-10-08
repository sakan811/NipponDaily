/**
 * The one place that names the data NipponDaily is built from: who owns it,
 * where it lives, under which licence, and the credit line that goes with it.
 *
 * Everything that shows an attribution reads from here: the footer, each
 * entry's citation, `/docs/data-integrity`, and (through `pnpm docs:sync`) the
 * README. Add or change a source or licence in this file only;
 * `test/server/docs-sync.test.ts` fails if a licence name or URL is typed
 * anywhere else.
 *
 * Data-free and import-free, so `app/`, `server/` and the node scripts can all
 * use it. Keep it to plain erasable TypeScript (the scripts load it directly).
 *
 * Text fields are "markdown-light": `[text](url)` links and `code` spans only.
 */

export interface Licence {
  name: string;
  url?: string;
}

export const LICENCES = {
  ccBySa4: {
    name: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  ccBy2Fr: {
    name: "CC BY 2.0 FR",
    url: "https://creativecommons.org/licenses/by/2.0/fr/",
  },
  // tanos.co.uk states "Creative Commons BY" with no version, so none is named.
  ccBy: { name: "CC BY" },
  apache2: {
    name: "Apache licence 2.0",
    url: "https://www.apache.org/licenses/LICENSE-2.0",
  },
  mit: { name: "MIT licence" },
  // NINJAL offers UniDic under any one of these.
  unidic: { name: "BSD, LGPL or GPL" },
  ccBySa3: {
    name: "CC BY-SA 3.0",
    url: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  ofl11: {
    name: "SIL Open Font License 1.1",
    url: "https://openfontlicense.org/",
  },
} as const satisfies Record<string, Licence>;

export interface DataSource {
  id:
    | "edrdg"
    | "wiktionary"
    | "tatoeba"
    | "jlpt-word-list"
    | "wanakana"
    | "kuromoji"
    | "unidic"
    | "kanjium"
    | "kanjivg"
    | "og-fonts";
  /** Display name. */
  name: string;
  /** Short form for tight spaces such as the footer. */
  short: string;
  url: string;
  licence: Licence;
  /** The rights holder, when it isn't the project itself. */
  holder?: string;
  holderShort?: string;
  /** How it reaches the repo, when not straight from `url`. */
  via?: { name: string; url: string };
  /** Where the data was originally compiled, when `url` is a redistribution. */
  origin?: { name: string; url: string; licence: Licence };
  /** What the site takes from it. */
  use: string;
  /** The attribution sentence(s), as shown to readers. */
  credit: string;
}

const link = (text: string, url: string) => `[${text}](${url})`;

const EDRDG_URL = "https://www.edrdg.org/";
const WIKTIONARY_URL = "https://en.wiktionary.org";
const KAIKKI = { name: "Kaikki.org", url: "https://kaikki.org/" } as const;
// Kaikki.org asks that work using its data cite this paper and link the site.
const WIKTEXTRACT_PAPER = {
  title: "Wiktextract: Wiktionary as Machine-Readable Structured Data",
  url: "https://aclanthology.org/2022.lrec-1.140/",
} as const;
const TATOEBA_URL = "https://tatoeba.org";
const WORD_LIST_URL = "https://github.com/elzup/jlpt-word-list";
const TANOS = {
  name: "tanos.co.uk",
  url: "https://www.tanos.co.uk/jlpt/",
} as const;
const WANAKANA_URL = "https://github.com/WaniKani/WanaKana";
const KANJIUM_URL = "https://github.com/mifunetoshiro/kanjium";
const KANJIVG_URL = "https://kanjivg.tagaini.net";
const KUROMOJI_URL = "https://github.com/takuyaa/kuromoji.js";
const UNIDIC_URL = "https://clrd.ninjal.ac.jp/unidic/";
const LINDERA_URL = "https://github.com/lindera/lindera";
const ZEN_OLD_MINCHO_URL =
  "https://github.com/google/fonts/tree/main/ofl/zenoldmincho";
const OUTFIT_URL = "https://github.com/google/fonts/tree/main/ofl/outfit";
const NOTO_SERIF_JP_URL =
  "https://github.com/google/fonts/tree/main/ofl/notoserifjp";
const EDRDG_NAME = "Electronic Dictionary Research and Development Group";

export const SOURCES = {
  edrdg: {
    id: "edrdg",
    name: "JMdict and KANJIDIC2",
    short: "JMdict & KANJIDIC2",
    url: EDRDG_URL,
    licence: LICENCES.ccBySa4,
    holder: EDRDG_NAME,
    holderShort: "EDRDG",
    use: "Readings, meanings, parts of speech, priority, register, field, dialect and kanji readings",
    credit: `JMdict and KANJIDIC2 are property of the ${link(EDRDG_NAME, EDRDG_URL)}, used under ${link(LICENCES.ccBySa4.name, LICENCES.ccBySa4.url)}, from the dated files the group publishes.`,
  },
  wiktionary: {
    id: "wiktionary",
    name: "English Wiktionary",
    short: "Wiktionary",
    url: WIKTIONARY_URL,
    licence: LICENCES.ccBySa4,
    via: KAIKKI,
    use: "Etymology text, quoted verbatim from a pinned dump",
    credit: `Etymology text is quoted from ${link("English Wiktionary", WIKTIONARY_URL)} under ${link(LICENCES.ccBySa4.name, LICENCES.ccBySa4.url)}, as extracted by wiktextract and distributed by ${link(KAIKKI.name, KAIKKI.url)}, which is maintained by Tatu Ylonen. See Ylonen, ${link(WIKTEXTRACT_PAPER.title, WIKTEXTRACT_PAPER.url)}, Proceedings of the 13th Conference on Language Resources and Evaluation (LREC), 2022, pp. 1317–1325. Each entry names the dated dump it quotes, links the page and quotes it verbatim; the one-line headline is NipponDaily's own.`,
  },
  tatoeba: {
    id: "tatoeba",
    name: "Tatoeba",
    short: "Tatoeba",
    url: TATOEBA_URL,
    licence: LICENCES.ccBy2Fr,
    holder: "Tatoeba contributors",
    use: "Example sentences, their English translations and furigana, picked from a pinned export",
    credit: `Example sentences, their translations and their furigana are from ${link("Tatoeba", TATOEBA_URL)}, a collection written by its community, under ${link(LICENCES.ccBy2Fr.name, LICENCES.ccBy2Fr.url)}. Each shows its Tatoeba number, which links to the sentence and its authors. They are picked from a dated export by fixed rules and quoted unchanged; nobody reviews them one by one.`,
  },
  "jlpt-word-list": {
    id: "jlpt-word-list",
    name: "elzup/jlpt-word-list",
    short: "JLPT word lists",
    url: WORD_LIST_URL,
    licence: LICENCES.mit,
    origin: { ...TANOS, licence: LICENCES.ccBy },
    use: "The JLPT N5–N1 vocabulary the daily words are drawn from",
    credit: `The word lists come from the community list originally compiled at ${link(TANOS.name, TANOS.url)} (${LICENCES.ccBy.name}; credit required), via ${link("elzup/jlpt-word-list", WORD_LIST_URL)} (${LICENCES.mit.name}).`,
  },
  wanakana: {
    id: "wanakana",
    name: "wanakana",
    short: "wanakana",
    url: WANAKANA_URL,
    licence: LICENCES.mit,
    use: "Kana conversion in the data scripts and checks",
    credit: `Kana conversion in the data scripts and checks uses ${link("wanakana", WANAKANA_URL)} (${LICENCES.mit.name}).`,
  },
  kuromoji: {
    id: "kuromoji",
    name: "kuromoji",
    short: "kuromoji",
    url: KUROMOJI_URL,
    licence: LICENCES.apache2,
    holder: "Nara Institute of Science and Technology (NAIST)",
    holderShort: "NAIST",
    use: "A first reading of example sentences, to check Tatoeba's furigana",
    credit: `Tatoeba's furigana is first checked against ${link("kuromoji", KUROMOJI_URL)} (${LICENCES.apache2.name}) with its IPADIC dictionary, copyright Nara Institute of Science and Technology, which permits its use and distribution. The analyser runs only when the data is built; nothing of it is sent to or shipped to a reader.`,
  },
  unidic: {
    id: "unidic",
    name: "UniDic",
    short: "UniDic",
    url: UNIDIC_URL,
    licence: LICENCES.unidic,
    holder: "National Institute for Japanese Language and Linguistics (NINJAL)",
    holderShort: "NINJAL",
    via: { name: "Lindera", url: LINDERA_URL },
    use: "A second, independent reading of example sentences, to check Tatoeba's furigana",
    credit: `It is then checked against a second analyser, ${link("Lindera", LINDERA_URL)} (${LICENCES.mit.name}) with the ${link("UniDic", UNIDIC_URL)} dictionary of the National Institute for Japanese Language and Linguistics (${LICENCES.unidic.name}). The analyser runs only when the data is built; nothing of it is sent to or shipped to a reader.`,
  },
  kanjium: {
    id: "kanjium",
    name: "Kanjium",
    short: "Kanjium",
    url: KANJIUM_URL,
    licence: LICENCES.ccBySa4,
    holder: "Kanjium contributors",
    use: "Pitch accent of the words",
    credit: `Pitch accents are from the accent list of ${link("Kanjium", KANJIUM_URL)}, under ${link(LICENCES.ccBySa4.name, LICENCES.ccBySa4.url)}, which credits its accent data to Uros O.'s free database. A word is shown an accent only where the list gives that exact spelling and reading.`,
  },
  kanjivg: {
    id: "kanjivg",
    name: "KanjiVG",
    short: "KanjiVG",
    url: KANJIVG_URL,
    licence: LICENCES.ccBySa3,
    holder: "Ulrich Apel",
    use: "Stroke order of the kanji",
    credit: `Stroke order is from ${link("KanjiVG", KANJIVG_URL)}, copyright Ulrich Apel, under ${link(LICENCES.ccBySa3.name, LICENCES.ccBySa3.url)}. A kanji is drawn only where KanjiVG and KANJIDIC2 count the same number of strokes.`,
  },
  "og-fonts": {
    id: "og-fonts",
    name: "Zen Old Mincho, Outfit and Noto Serif JP",
    short: "Zen Old Mincho, Outfit & Noto Serif JP",
    url: ZEN_OLD_MINCHO_URL,
    licence: LICENCES.ofl11,
    use: "The faces the site is set in and the share images are drawn in",
    credit: `The site is set in ${link("Zen Old Mincho", ZEN_OLD_MINCHO_URL)}, ${link("Outfit", OUTFIT_URL)} and ${link("Noto Serif JP", NOTO_SERIF_JP_URL)}, served from the app by way of the \`@fontsource\` packages, and the share images are drawn in the first two; all are under the ${link(LICENCES.ofl11.name, LICENCES.ofl11.url)}. The share-image licences ship beside the font files in \`server/assets/og/\`.`,
  },
} as const satisfies Record<DataSource["id"], DataSource>;

/** In the order the credits are shown. */
export const DATA_SOURCES: readonly DataSource[] = [
  SOURCES.edrdg,
  SOURCES.wiktionary,
  SOURCES.tatoeba,
  SOURCES["jlpt-word-list"],
  SOURCES.wanakana,
  SOURCES.kuromoji,
  SOURCES.unidic,
  SOURCES.kanjium,
  SOURCES.kanjivg,
  SOURCES["og-fonts"],
];

/** The Tatoeba page of one sentence, which lists its author and translations. */
export function tatoebaSentenceUrl(id: number): string {
  return `${SOURCES.tatoeba.url}/sentences/show/${id}`;
}

/** The Wiktionary page an entry quotes (the text is from a dated dump, not the live page). */
export function wiktionaryPageUrl(term: string): string {
  return `${SOURCES.wiktionary.url}/wiki/${encodeURIComponent(term)}`;
}
