/**
 * Every HTTP route the server answers, written once. The API chapter of the
 * docs (`/docs/api`) reads this list, and `test/server/docs-sync.test.ts`
 * fails if it and the files under `server/api` and `server/routes` disagree.
 *
 * Data-free, import-free, plain erasable TypeScript. `returns` is
 * "markdown-light": `code` spans only.
 */

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
    path: "/api/daily-word",
    query: "?date=YYYY-MM-DD",
    returns:
      "One entry plus its `prev` and `next` days. With no date: today in Japan; once the catalogue runs out the words start again from the first, and `lap` says which pass it is (1 until then, always 1 for an explicit date). A future or invalid date is a `400`; a past date with no entry (or no word yet) is a `404`. `next` stays `null` until that day has arrived.",
  },
  {
    method: "GET",
    path: "/api/word-calendar",
    query: "?month=YYYY-MM",
    returns:
      '`{ month, months, today, days }`. An open day carries its `term`, `kana` and `stratum`; an upcoming day carries only its date and `"upcoming"`. The month defaults to the current one if it has words, else the newest. A malformed month is a `400`, a month with no words a `404`.',
  },
  {
    method: "GET",
    path: "/api/parts",
    returns:
      "The parts index, `{ parts: [{ text, count, readings }] }`: every morpheme an open word's “Taken apart” row shows, most-used first.",
  },
  {
    method: "GET",
    path: "/api/part",
    query: "?text=日",
    returns:
      "One part with the open words that show it, grouped by the reading it has in each: `{ text, count, readings, alsoIn }`. Only days that have arrived count, so a part seen only in an upcoming word is a `404`. A missing or over-long `text` is a `400`.",
  },
  {
    method: "GET",
    path: "/api/explore",
    query: "?q=&level=&stratum=&process=&pos=&part=&match=",
    returns:
      "The open words matching every filter, newest first: `{ filters, total, count, words, facets }`. Every filter is optional and an empty value means “no filter”; anything else invalid is a `400`. `level`, `stratum` (which also takes `unstated`), `process` and `pos` (a group such as `verb`) take several comma-joined choices; `match=all` makes a word carry every process and part of speech chosen instead of any. Each facet counts the words the other filters leave.",
  },
  {
    method: "GET",
    path: "/api/patterns",
    returns:
      "Counts across the open words: `{ total, withParts, withBase, strata, levels, processes, pairs, combinations, rendaku }`.",
  },
  {
    method: "GET",
    path: "/api/related",
    query: "?date=YYYY-MM-DD",
    returns:
      "Up to six open words that resemble one entry (shared parts, processes or layer), closest first, each with what it shares: `{ date, words }`. `date` is required; a future or malformed one is a `400`, a day with no entry a `404`.",
  },
  {
    method: "GET",
    path: "/api/catalogue",
    returns:
      "`{ first, last, total, open }`: the first and last day of the written catalogue, how many words it holds and how many have opened. The word range quoted in the docs comes from this.",
  },
  {
    method: "GET",
    path: "/api/site-theme",
    returns:
      'The site `SiteTheme`, `{ season, updatedAt, source }`, where `source` is `"cron"` or `"fallback"`. CDN-cached for 60 seconds (`s-maxage=60, stale-while-revalidate=600`).',
  },
  {
    method: "GET",
    path: "/api/cron/update-season",
    returns:
      "Called by the cron. Needs `Authorization: Bearer <CRON_SECRET>` (else `401`). Returns `{ season, previousSeason, changed }`.",
  },
  {
    method: "GET",
    path: "/sitemap.xml",
    returns:
      "Server route, not under `/api`. Lists the static pages, every open word and each part seen in more than one open word, never an upcoming day. URLs use `NUXT_PUBLIC_SITE_URL` when set, else the request's own origin.",
  },
  {
    method: "GET",
    path: "/robots.txt",
    returns:
      "Server route, not under `/api`. Disallows `/api/` and names the sitemap.",
  },
];
