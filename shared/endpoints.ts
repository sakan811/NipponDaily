/**
 * What every HTTP route the server answers returns, and the limits it answers
 * them under, written once (the paths themselves are in `shared/routes.ts`).
 * The API chapter of the docs (`/docs/api`) reads this list, and
 * `test/server/docs-sync.test.ts` fails if it and the files under `server/api`
 * and `server/routes` disagree.
 *
 * Data-free, plain erasable TypeScript, importing only the other number
 * modules. `returns` is "markdown-light": `code` spans only.
 */
import { RELATED_LIMIT, STROKE_SQUARE } from "./limits";
import { ROUTES } from "./routes";
import { countWord } from "./count";

/** What the rate limiter allows one address, per window (`server/utils/rate-limit.ts`). */
export const RATE_LIMIT = { limit: 120, windowMs: 60_000 } as const;

/** A day's share image never changes once the day has opened. */
export const OG_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";

export interface ApiEndpoint {
  /** Always GET today. */
  method: "GET";
  path: string;
  /** The query string, as written in a URL. */
  query?: string;
  returns: string;
}

export const API_ENDPOINTS: readonly ApiEndpoint[] = [
  {
    method: "GET",
    path: ROUTES.dailyWord,
    query: "?date=YYYY-MM-DD",
    returns:
      "One entry plus its `prev` and `next` days. With no date: today in Japan; once the catalogue runs out the words start again from the first, and `lap` says which pass it is (1 until then, always 1 for an explicit date). A future or invalid date is a `400`; a past date with no entry (or no word yet) is a `404`. `next` stays `null` until that day has arrived.",
  },
  {
    method: "GET",
    path: ROUTES.wordCalendar,
    query:
      "?month=YYYY-MM&q=&level=&stratum=&process=&pos=&frequency=&part=&match=",
    returns:
      "`{ month, months, today, days, filters, total, count, monthCounts, facets }`. An open day carries its `term`, `kana`, `stratum` and `match` (whether it passes the filters, always true with none); an upcoming day carries only its date and `\"upcoming\"`, and is never matched. The filters are the `/api/explore` ones, with the same counts: `count` of `total` open words match across every month, `monthCounts` gives each month's matches and `facets` the options' counts. The month defaults to the current one if it has words, else the newest. A malformed month or an invalid filter is a `400`, a month with no words a `404`.",
  },
  {
    method: "GET",
    path: ROUTES.parts,
    returns:
      "The parts index, `{ parts: [{ text, count, readings }] }`: every morpheme an open word's “Taken apart” row shows, most-used first.",
  },
  {
    method: "GET",
    path: ROUTES.part,
    query: "?text=日",
    returns:
      "One part with the open words that show it, grouped by the reading it has in each: `{ text, count, readings, alsoIn }`. Only days that have arrived count, so a part seen only in an upcoming word is a `404`. A missing or over-long `text` is a `400`.",
  },
  {
    method: "GET",
    path: ROUTES.kanji,
    returns:
      "The kanji index, `{ kanji: [{ char, count, grade? }] }`: every kanji an open word is written with, most-used first, with KANJIDIC2's school grade.",
  },
  {
    method: "GET",
    path: ROUTES.kanjiDetail,
    query: "?char=日",
    returns:
      "KANJIDIC2's record of one kanji with the open words written with it: `{ char, strokeCount, grade?, freq?, on, kun, meanings, count, words, isPart, strokes? }`, where `strokes` is KanjiVG's stroke paths in drawing order on a " +
      STROKE_SQUARE +
      " by " +
      STROKE_SQUARE +
      " square, left out when KanjiVG and KANJIDIC2 count the strokes differently. Only days that have arrived count, so a kanji used only by an upcoming word is a `404`. A missing value or more than one character is a `400`.",
  },
  {
    method: "GET",
    path: ROUTES.explore,
    query: "?q=&level=&stratum=&process=&pos=&frequency=&part=&match=",
    returns:
      "The open words matching every filter, newest first: `{ filters, total, count, words, facets }`. Every filter is optional and an empty value means “no filter”; anything else invalid is a `400`. `level`, `stratum` (which also takes `unstated`), `process`, `pos` (a group such as `verb`) and `frequency` (`common`, `less` or `unlisted`, from JMdict's priority codes) take several comma-joined choices; `match=all` makes a word carry every process and part of speech chosen instead of any. Each facet counts the words the other filters leave.",
  },
  {
    method: "GET",
    path: ROUTES.patterns,
    returns:
      "Counts across the open words: `{ total, withParts, withBase, strata, levels, processes, pairs, combinations, rendaku }`.",
  },
  {
    method: "GET",
    path: ROUTES.related,
    query: "?date=YYYY-MM-DD",
    returns:
      "Up to " +
      countWord(RELATED_LIMIT) +
      " open words that resemble one entry (shared parts, processes or layer), closest first, each with what it shares: `{ date, words }`. `date` is required; a future or malformed one is a `400`, a day with no entry a `404`.",
  },
  {
    method: "GET",
    path: ROUTES.catalogue,
    returns:
      "`{ first, last, total, open }`: the first and last day of the written catalogue, how many words it holds and how many have opened. The word range quoted in the docs comes from this.",
  },
  {
    method: "GET",
    path: ROUTES.sitemap,
    returns:
      "Server route, not under `/api`. Lists the static pages, every open word and each part or kanji seen in more than one open word, never an upcoming day. URLs use `NUXT_PUBLIC_SITE_URL` when set, else the request's own origin.",
  },
  {
    method: "GET",
    path: ROUTES.shareImage,
    query: "?date=YYYY-MM-DD",
    returns:
      "Server route, not under `/api` (so `robots.txt` does not block link previews). The share image of one open word as a 1200 by 630 PNG: the word, its reading, meaning, level, layer and headline, in the palette of its day's season. A future, malformed or unknown date is a `404`, so the image cannot reveal a word early. The page's Open Graph tags point here.",
  },
  {
    method: "GET",
    path: ROUTES.robots,
    returns:
      "Server route, not under `/api`. Disallows `/api/` and names the sitemap.",
  },
];
