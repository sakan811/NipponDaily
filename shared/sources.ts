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
} as const satisfies Record<string, Licence>;

export interface DataSource {
  id: "edrdg" | "wiktionary" | "jlpt-word-list" | "wanakana";
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
const WORD_LIST_URL = "https://github.com/elzup/jlpt-word-list";
const TANOS = {
  name: "tanos.co.uk",
  url: "https://www.tanos.co.uk/jlpt/",
} as const;
const WANAKANA_URL = "https://github.com/WaniKani/WanaKana";
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
    use: "Etymology text, quoted verbatim at a pinned revision",
    credit: `Etymology text is quoted from ${link("English Wiktionary", WIKTIONARY_URL)} under ${link(LICENCES.ccBySa4.name, LICENCES.ccBySa4.url)}. Each entry links the exact revision it quotes and quotes it verbatim; the one-line headline is NipponDaily's own.`,
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
} as const satisfies Record<DataSource["id"], DataSource>;

/** In the order the credits are shown. */
export const DATA_SOURCES: readonly DataSource[] = [
  SOURCES.edrdg,
  SOURCES.wiktionary,
  SOURCES["jlpt-word-list"],
  SOURCES.wanakana,
];

/** The permalink to the exact Wiktionary revision an entry quotes. */
export function wiktionaryRevisionUrl(term: string, revision: number): string {
  return `${SOURCES.wiktionary.url}/w/index.php?title=${encodeURIComponent(term)}&oldid=${revision}`;
}
