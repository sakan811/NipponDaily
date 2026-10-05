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
  // tanos.co.uk states "Creative Commons BY" with no version, so none is named.
  ccBy: { name: "CC BY" },
  mit: { name: "MIT licence" },
  ofl11: {
    name: "SIL Open Font License 1.1",
    url: "https://openfontlicense.org/",
  },
} as const satisfies Record<string, Licence>;

export interface DataSource {
  id: "edrdg" | "wiktionary" | "jlpt-word-list" | "wanakana" | "og-fonts";
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
const JAMDICT = {
  name: "jamdict-data",
  url: "https://pypi.org/project/jamdict-data/",
} as const;
const WIKTIONARY_URL = "https://en.wiktionary.org";
const KAIKKI = { name: "Kaikki.org", url: "https://kaikki.org/" } as const;
// Kaikki.org asks that work using its data cite this paper and link the site.
const WIKTEXTRACT_PAPER = {
  title: "Wiktextract: Wiktionary as Machine-Readable Structured Data",
  url: "https://aclanthology.org/2022.lrec-1.140/",
} as const;
const WORD_LIST_URL = "https://github.com/elzup/jlpt-word-list";
const TANOS = {
  name: "tanos.co.uk",
  url: "https://www.tanos.co.uk/jlpt/",
} as const;
const WANAKANA_URL = "https://github.com/WaniKani/WanaKana";
const ZEN_OLD_MINCHO_URL = "https://github.com/google/fonts/tree/main/ofl/zenoldmincho";
const OUTFIT_URL = "https://github.com/google/fonts/tree/main/ofl/outfit";
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
    via: JAMDICT,
    use: "Readings, meanings, parts of speech and kanji readings",
    credit: `JMdict and KANJIDIC2 are property of the ${link(EDRDG_NAME, EDRDG_URL)}, used under ${link(LICENCES.ccBySa4.name, LICENCES.ccBySa4.url)} via the ${link(JAMDICT.name, JAMDICT.url)} release.`,
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
  "jlpt-word-list": {
    id: "jlpt-word-list",
    name: "elzup/jlpt-word-list",
    short: "JLPT word lists",
    url: WORD_LIST_URL,
    licence: LICENCES.mit,
    origin: { ...TANOS, licence: LICENCES.ccBy },
    use: "The JLPT N5–N2 vocabulary the daily words are drawn from",
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
  "og-fonts": {
    id: "og-fonts",
    name: "Zen Old Mincho and Outfit",
    short: "Zen Old Mincho & Outfit",
    url: ZEN_OLD_MINCHO_URL,
    licence: LICENCES.ofl11,
    use: "The faces the share images are drawn in",
    credit: `The share images are drawn in ${link("Zen Old Mincho", ZEN_OLD_MINCHO_URL)} and ${link("Outfit", OUTFIT_URL)}, both under the ${link(LICENCES.ofl11.name, LICENCES.ofl11.url)}; each licence ships beside the font files in \`server/assets/og/\`.`,
  },
} as const satisfies Record<DataSource["id"], DataSource>;

/** In the order the credits are shown. */
export const DATA_SOURCES: readonly DataSource[] = [
  SOURCES.edrdg,
  SOURCES.wiktionary,
  SOURCES["jlpt-word-list"],
  SOURCES.wanakana,
  SOURCES["og-fonts"],
];

/** The Wiktionary page an entry quotes (the text is from a dated dump, not the live page). */
export function wiktionaryPageUrl(term: string): string {
  return `${SOURCES.wiktionary.url}/wiki/${encodeURIComponent(term)}`;
}
