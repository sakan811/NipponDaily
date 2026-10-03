# Architecture

How NipponDaily is put together: the data, the server, the pages, the season
system and the API. For _why_ it is built this way see
[`core-theme.md`](core-theme.md); for how entries are produced and checked see
[`content.md`](content.md).

**Facts are written once, in code, and copied out.** Attribution lives in
`shared/sources.ts`, the route list in `shared/endpoints.ts`, and the word range
and count are computed from `data/words/`. The web app reads them (the footer,
each entry's citation, `/docs/data-integrity`, `/docs/architecture`,
`/docs/features`) and `pnpm docs:sync` fills the marked regions of the README and
these docs. Never edit between `<!-- docs:begin … -->` and `<!-- docs:end … -->`;
change the source and run `pnpm docs:sync`. See [Single sources of truth](#single-sources-of-truth).

## Overview

A Nuxt 4 / Vue 3 / TypeScript app (pnpm). There are no accounts and nothing
about a reader is stored or sent anywhere.

- **The entries are in-repo data**: `data/words/YYYY-MM.json`, one `WordEntry`
  per day, every day of a month. They run from
  **<!-- docs:begin range-months -->January 2026 to October 2027<!-- docs:end range-months -->**
  (<!-- docs:begin range -->2026-01-01 to 2027-10-31<!-- docs:end range -->), <!-- docs:begin total -->669<!-- docs:end total --> words. Only the headline is hand-written
  (`data/word-plan/`); every other field is generated from sources
  (`pnpm data:words`). See [`content.md`](content.md).
- **A day is open once midnight in Japan (JST) has passed.** The API, the
  sitemap and every derived page read only open days, so an upcoming word can't
  be read early.
- **Redis holds only the site's season.** Without Redis the season is kept in
  process memory; the words need no configuration.
- **The pages are server-rendered**, so the HTML a crawler gets already holds
  the word.

## Environment

See `.env.example`. All server-side config goes through
`server/utils/config.ts`'s `getEnvOrConfig(configKey, envKey)`, which prefers
Nuxt `runtimeConfig` and falls back to `process.env`, so it also works outside
a request (the cron handler, scripts).

| Variable                                              | Used for                                                                                                                    |
| :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis, storing the active site theme. Not needed for the words.                                                     |
| `CRON_SECRET`                                         | Bearer token `GET /api/cron/update-season` requires (Vercel sends it on cron requests). Unset → the endpoint answers `401`. |
| `NUXT_PUBLIC_SITE_URL`                                | Optional canonical origin for canonical/Open Graph URLs and the sitemap; otherwise each request's own origin.               |

The data scripts (`scripts/build-*.mjs`) run as bare `node` processes outside
Nuxt and need no Redis credentials.

## Layout

```text
app/          Nuxt app: pages/, components/, composables/, utils/, data/, assets/css/tailwind.css
shared/       Code imported by BOTH app/ and server/ (the `~~/shared/...` alias); not auto-imported
server/       api/ (handlers), routes/ (sitemap, robots), services/ (Redis), utils/
scripts/      Data builders run with node: reference snapshots, etymology pins, entry generator
data/         word-plan/ (hand-written), words/ (generated), reference/ (generated evidence)
types/        Shared TypeScript shapes (index.ts)
docs/         These documents
test/         unit/ (happy-dom), server/ (node), content/ (offline, against the snapshots)
```

### `shared/`

| Module           | Role                                                                                                                                         |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `words.ts`       | The catalogue (`WORD_ENTRIES`), JST date logic (`todayJst`, …), `entryForDate`, `payloadFor`, `calendarForMonth`. **Server and tests only.** |
| `parts.ts`       | `partsIndex(today)` / `partDetail(text, today)`: the morpheme index, derived from entries' `morphemes`. **Server and tests only.**           |
| `explore.ts`     | `exploreWords(filters, today)`: search + filters with facet counts. **Server and tests only.**                                               |
| `related.ts`     | `relatedWords(entry, today)`: the open words most like one entry. **Server and tests only.**                                                 |
| `patterns.ts`    | `patternsFor(today)`: counts across open words, incl. the rendaku section. **Server and tests only.**                                        |
| `sitemap.ts`     | `sitemapXml()` / `robotsTxt()`: open days only. **Server and tests only.**                                                                   |
| `word-labels.ts` | `WORD_STRATA` / `WORD_PROCESSES` labels and definitions. Data-free, safe for `app/`.                                                         |
| `jlpt.ts`        | `JLPT_LEVELS`.                                                                                                                               |
| `meanings.ts`    | `servedVocab()`: the only place to correct or enrich a word-list entry. See [`content.md`](content.md).                                      |
| `seasons.ts`     | Single source of truth for the seasonal presets (`SEASONS`, `SEASON_IDS`, `DEFAULT_SEASON`, `seasonForDate()`).                              |

**Nothing under `app/` may import `shared/words|parts|explore|patterns|related|sitemap`
or `data/words`.** Those carry every entry, future ones included, and would ship
them to the browser. The server fetches through `$fetch`, which calls the API
handler in-process, so the data never needs to be in the client bundle.
`test/unit/no-future-leak.test.ts` enforces it. Components that need labels
import the data-free `shared/word-labels.ts`.

### `app/`

- **Pages**: `/` (today's word), `/words` (month calendar), `/words/<date>`,
  `/explore`, `/patterns`, `/parts`, `/parts/<text>`, `/kana`, `/docs/*`
  (reader-facing documentation), and a catch-all 404 that answers a real `404`
  and is `noindex`. The removed `/game`, `/learn/**` and `/vocab/**` routes
  redirect to `/` (`routeRules` in `nuxt.config.ts`).
- **Composables** (`useAsyncData`-based, so the server renders with data):
  `useDailyWord` / `useWordCalendar`, `usePartsIndex` / `usePart` /
  `useRelatedWords`, `useExplore` / `usePatterns`, plus `usePageSeo` (title,
  description, canonical, Open Graph, `noindex` for error states),
  `useSiteTheme` and `useBgm`.
- **Components**: `WordEntryView` (one entry), `RelatedWords`, `AppHeader`
  (shared header and nav), `AppFooter` (attribution), `SeasonButton`,
  `BgmControl`, `SeasonalEffects`, `TrendingFallback` (generic fetch-error
  card), the education charms used by `/kana`, and small local UI primitives
  `U*.vue` that mimic the `@nuxt/ui` API (the project does not depend on it).
- **Tests that guard drift**: `no-future-leak`, `seasons-css-sync`, `icons`
  (every `i-heroicons-*` name used has a path in `app/data/icons.ts`) and
  `docs-sync` (in `test/server`).

## Daily words

A **`WordEntry`** (`types/index.ts`) has:

| Field                              | Meaning                                                                                                                                           |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `date`                             | `YYYY-MM-DD`, JST                                                                                                                                 |
| `term`, `kana`, `meaning`, `level` | From the JLPT word list (after `shared/meanings.ts` corrections)                                                                                  |
| `pos`                              | JMdict's own part-of-speech tags, verbatim, for the sense the meaning came from                                                                   |
| `stratum?`                         | `wago` / `kango` / `gairaigo` / `hybrid`, stated only when KANJIDIC2 or the evidence establishes it                                               |
| `processes`                        | Keyword tags found in the quoted text (`WORD_PROCESSES`)                                                                                          |
| `headline`                         | The only hand-written field                                                                                                                       |
| `morphemes[]`                      | `text`, surface `reading` (hiragana), `base?` when rendaku/sokuon changed it, `meaning`, `irregular?`. `[]` when the source gives no clean split. |
| `sources[]`                        | `{ quote }`: one verbatim line of Wiktionary's Etymology section for this reading                                                                 |
| `wiktionaryRev`                    | The pinned Wiktionary revision                                                                                                                    |

A hedge in a quoted line (“probably”, “unknown”, …) is detected at render time
(`isHedged` in `shared/word-labels.ts`) and shown as “Not settled”.

- **Dates are JST.** `todayJst()` shifts UTC by +9h, so a new word opens at
  15:00 UTC. With no `date`, `GET /api/daily-word` serves today's word, or the
  newest one if the catalogue has run out, so the page is never empty; before
  the first day it is a `404`.
- **No future leaks.** The API rejects a future `date` (`400`); `payloadFor()`
  reveals `next` only once that day has arrived; `calendarForMonth()` gives an
  upcoming day only its date.
- **SSR.** A server fetch that fails with `400`/`404` makes the HTTP response a
  `404`, and such pages are `noindex`. The skeleton shows only while a
  client-side fetch is pending; `TrendingFallback` shows on failure.
- **SEO.** Every page calls `usePageSeo`. Canonical/OG/sitemap URLs are
  absolute (`NUXT_PUBLIC_SITE_URL`, else the request origin).

### Reading across the words

All of these derive from fields entries already have, read **open days only**
(`today` is always a parameter), and add no new claim.

- **Parts** (`/parts`, `/parts/<text>`). The morpheme index. A part page groups
  its words by the reading the part has in each (日 → び/ひ/か/にち), with
  rendaku shown as “from ひ”. `alsoIn` lists open words whose _spelling_
  contains a kanji part but whose breakdown doesn't name it, flagged on the page
  as claiming nothing. Coverage is bounded by the parsers: single-kanji words,
  hedged loanwords and unclear native verbs/adjectives have no parts. The
  sitemap lists parts seen in more than one open word.
- **Explore** (`/explore`). Filters by `q` (term, kana, meaning; katakana folded
  to hiragana), `level`, `stratum`, `process` and `part`, newest first. Each
  facet's counts are taken over the words the _other_ filters leave, so an
  option never promises a count it can't deliver. A layer filter never matches
  words with no stated layer. Filters live in the URL; an unknown value in a
  hand-edited URL is dropped, while the API answers `400`.
- **Patterns** (`/patterns`). Counts by layer, level and process; level × layer;
  process × layer; process pairs with up to three example words; and a rendaku
  section: every part whose recorded `base` differs from its `reading`, classed
  from the two spellings as a voiced first kana (ひ → び; ち → じ and つ → ず
  count, being the merged voiced sounds), a reading ending in っ, or other. The
  page says the counts describe these entries (a JLPT N5–N2 sample,
  parser-derived tags), not the language.
- **Related words** (under an entry on `/words/<date>`). Up to six other open
  words, scored 3 per shared part plus `1 − (fraction of open words carrying
it)` for each shared process and for a shared layer; below 1.5 a word is not
  offered. Each card names what is shared and links to `/parts/<text>` or
  `/explore`. Hidden when the fetch fails or nothing clears the minimum.

## The JLPT word lists

The word “pool” is the community lists (`elzup/jlpt-word-list`, one CSV per
level), pinned in `scripts/word-list-source.mjs` and cross-referenced against
JMdict/KANJIDIC2. It exists only as the committed
`data/reference/n{5,4,3,2}-reference.json` snapshots; there is no Redis pool.
`scripts/lib/word-list.mjs` holds the parsing, the reading/meaning overrides and
the gloss cross-check. A handful of words appear at more than one level with the
same reading, and `dedupeAcrossLevels()` keeps each at the lowest; a shared
spelling with a _different_ reading (開く あく vs ひらく) is a different word.
An entry's `term`/`kana`/`level`/`meaning` must equal a word-list word. Details
and licences: [`content.md`](content.md) and `/docs/data-integrity`.

## Season system

`SeasonId` is a closed union: `sakura` (spring, the default), `summer`,
`autumn`, `winter`. A season may only be added once its CSS preset exists in
`app/assets/css/tailwind.css` **and** its id is in `shared/seasons.ts`.

| Season            | Months             |
| :---------------- | :----------------- |
| `sakura` (spring) | March–May          |
| `summer`          | June–August        |
| `autumn`          | September–November |
| `winter`          | December–February  |

- **Cron.** `vercel.json` runs `GET /api/cron/update-season` at `0 15 * * *` UTC
  (midnight JST). It checks `Authorization: Bearer <CRON_SECRET>` in constant
  time (missing/wrong token or no secret → `401`), computes `seasonForDate()` and
  saves a `SiteTheme` with `source: "cron"` only if it differs from the stored
  one. Returns `{ season, previousSeason, changed }`.
- **Site theme.** `GET /api/site-theme` reads the single record (`n5:site_theme`)
  from Redis, or builds one for today's season (`source: "fallback"`) and saves
  it with Redis `NX` so a concurrent cron write is never clobbered. Responses
  carry `cache-control: public, max-age=0, s-maxage=60, stale-while-revalidate=600`
  (a `routeRules` entry in `nuxt.config.ts`).
- **Applying it.** `useSiteTheme()` sets a `data-season` attribute on `<html>`;
  the reader's `season-choice` wins over the site's season. An inline script in
  `nuxt.config.ts` applies `season-choice`, else the cached `site-theme-season`,
  before paint, so a repeat visit never flashes the default.
- **Season button.** `SeasonButton.vue` lets a reader pick any season or “Follow
  the calendar”. The pick lives only in `localStorage` (`season-choice`).
- **Music.** `BgmControl.vue` / `useBgm.ts` play a looping track in a season that
  has one (autumn only). Off on every load; only the volume (`bgm-volume`) is
  remembered. Looping is gapless through a decoded audio buffer and a
  `GainNode` (iOS ignores `element.volume`); it pauses while the tab is hidden.

## Colour and shape

Tokens are defined directly in `app/assets/css/tailwind.css` (`app.config.ts` is
intentionally empty; there is no `@nuxt/ui`). A Tailwind v4 `@theme` block maps
`--color-primary-*`, `secondary`, `success`, `warning`, `error` and `neutral`
onto CSS variables defined under `:root` (light) and `.dark`.

- **Base palette** is also the `sakura` season: deep rose primary and sage
  secondary in light, teal and orchid in dark. `neutral` is identical in every
  season. The `/docs/color-palette` page shows the current values.
- **Dark mode** is a `.dark` class on `<html>`, toggled by `UColorModeButton`
  (persisted as `color-theme`) and applied before hydration by the inline script.
- **Seasonal palette**: `[data-season="…"]` blocks (each with a `.dark` variant)
  override the colours. `sakura` has no block. `autumn` overrides all five;
  `summer` and `winter` override only primary and secondary.
- **Seasonal shape**: the same blocks drive the UI's shape language through CSS
  `corner-shape` and `--shape-*` / `--corner-*` / `--motif-*` tokens: petals in
  spring, squircle pebbles in summer, bevel-cut leaves in autumn, frosted
  octagons in winter, plus borders, shadows, the backdrop and the ambient
  particles of `SeasonalEffects.vue`. Plain boxes opt in with `.season-box` /
  `.season-chip`. Browsers without `corner-shape` fall back to rounded corners.
- **Text on colour.** Solid `*-500` fills use `text-on-primary` etc.
  (`--on-*` tokens, chosen per scope against that scope's real `*-500`), never a
  hard-coded `text-white`. There is no `--on-warning`: warning is only used as a
  translucent tint. The target is WCAG AA, but nothing enforces it in a test and
  a few pairings fall short.
- **Education charms**: `/kana` uses 学業守 omamori (`OmamoriCharm.vue`) and ema
  plaques (`EmaPlaque.vue`), coloured through `--charm-*` / `--ema-*`; motion is
  off under `prefers-reduced-motion`.

`shared/seasons.ts` is the source of truth for each preset's swatches, months,
glyph and motif; `test/unit/seasons-css-sync.test.ts` fails if it drifts from
the real CSS.

## API

All `/api` responses are `{ success, data, timestamp }`. Handlers live in
`server/api/` and `server/routes/`. This table is generated from
`shared/endpoints.ts`.

<!-- docs:begin endpoints -->

| Endpoint                                             | Returns                                                                                                                                                                                                                                                                              |
| :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/daily-word?date=YYYY-MM-DD`                | One entry plus its `prev` and `next` days. With no date: today in Japan, or the newest word once the catalogue runs out. A future or invalid date is a `400`; a past date with no entry (or no word yet) is a `404`. `next` stays `null` until that day has arrived.                 |
| `GET /api/word-calendar?month=YYYY-MM`               | `{ month, months, today, days }`. An open day carries its `term`, `kana` and `stratum`; an upcoming day carries only its date and `"upcoming"`. The month defaults to the current one if it has words, else the newest. A malformed month is a `400`, a month with no words a `404`. |
| `GET /api/parts`                                     | The parts index, `{ parts: [{ text, count, readings }] }`: every morpheme an open word's “Taken apart” row shows, most-used first.                                                                                                                                                   |
| `GET /api/part?text=日`                              | One part with the open words that show it, grouped by the reading it has in each: `{ text, count, readings, alsoIn }`. Only days that have arrived count, so a part seen only in an upcoming word is a `404`. A missing or over-long `text` is a `400`.                              |
| `GET /api/explore?q=&level=&stratum=&process=&part=` | The open words matching every filter, newest first: `{ filters, total, count, words, facets }`. Every filter is optional and an empty value means “no filter”; anything else invalid is a `400`. Each facet counts the words the other filters leave.                                |
| `GET /api/patterns`                                  | Counts across the open words: `{ total, withParts, withBase, strata, levels, processes, pairs, rendaku }`.                                                                                                                                                                           |
| `GET /api/related?date=YYYY-MM-DD`                   | Up to six open words that resemble one entry (shared parts, processes or layer), closest first, each with what it shares: `{ date, words }`. `date` is required; a future or malformed one is a `400`, a day with no entry a `404`.                                                  |
| `GET /api/catalogue`                                 | `{ first, last, total, open }`: the first and last day of the written catalogue, how many words it holds and how many have opened. The word range quoted in the docs comes from this.                                                                                                |
| `GET /api/site-theme`                                | The site `SiteTheme`, `{ season, updatedAt, source }`, where `source` is `"cron"` or `"fallback"`. CDN-cached for 60 seconds (`s-maxage=60, stale-while-revalidate=600`).                                                                                                            |
| `GET /api/cron/update-season`                        | Called by the cron. Needs `Authorization: Bearer <CRON_SECRET>` (else `401`). Returns `{ season, previousSeason, changed }`.                                                                                                                                                         |
| `GET /sitemap.xml`                                   | Server route, not under `/api`. Lists the static pages, every open word and each part seen in more than one open word, never an upcoming day. URLs use `NUXT_PUBLIC_SITE_URL` when set, else the request's own origin.                                                               |
| `GET /robots.txt`                                    | Server route, not under `/api`. Disallows `/api/` and names the sitemap.                                                                                                                                                                                                             |

<!-- docs:end endpoints -->

There is no request rate limiting on any endpoint.

Example, `GET /api/daily-word?date=2026-10-01`:

```json
{
  "success": true,
  "data": {
    "entry": {
      "date": "2026-10-01",
      "term": "電話",
      "kana": "でんわ",
      "meaning": "a telephone",
      "level": "N5",
      "pos": ["noun (common) (futsuumeishi)"],
      "stratum": "kango",
      "processes": ["compound", "wasei"],
      "headline": "…",
      "morphemes": [{ "text": "電", "reading": "でん", "meaning": "electric" }],
      "sources": [{ "quote": "…" }],
      "wiktionaryRev": 92203082
    },
    "prev": null,
    "next": { "date": "2026-10-02", "term": "友達" }
  },
  "timestamp": "2026-10-01T00:00:00Z"
}
```

## Single sources of truth

| Fact                                                         | Written once in                                                    | Shown by                                                                                      |
| :----------------------------------------------------------- | :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| Data sources, licences, credit lines, the revision permalink | `shared/sources.ts`                                                | `AppFooter`, `WordEntryView`, `/docs/data-integrity`, the README and `content.md` (generated) |
| HTTP routes                                                  | `shared/endpoints.ts`                                              | `/docs/architecture`, this document (generated)                                               |
| Word range and count                                         | `data/words/` itself (`shared/catalogue.ts`, `GET /api/catalogue`) | `/docs/features` (live), the README and this document (generated)                             |
| Season palettes, months, motifs                              | `shared/seasons.ts`                                                | the CSS, `/docs/color-palette` (a test keeps the CSS in step)                                 |

Prose that explains something stays written by hand, once per audience, and
links to the above instead of restating it. `test/server/docs-sync.test.ts`
enforces the rest: generated regions are current, every route file is in
`shared/endpoints.ts` and vice versa, and no licence name or source URL is typed
outside `shared/sources.ts`. The agent notes (`CLAUDE.md`, not committed) import
these docs rather than copy them.

**To add a data source:** add it to `shared/sources.ts` and run
`pnpm docs:sync`. It then appears on `/docs/data-integrity`, in the README and in
`content.md`. The footer names only the two sources whose licence calls for a
visible credit (`SOURCES.wiktionary` and `SOURCES.edrdg`), so add a line there
by hand if a new one needs it.

**To add an endpoint:** add the handler under `server/api/` (or `server/routes/`)
and an entry in `shared/endpoints.ts`, then run `pnpm docs:sync`. The test
fails until both exist.

## Testing

Vitest, three projects (`vitest.config.ts`):

- **`test/unit`** (happy-dom): components and pages. The setup in
  `test/setup.ts` mocks `#app` (`useRoute`, `useRouter`, a working
  `useAsyncData`, no-op `useSeoMeta`/`useHead`); add to it and to
  `test/mocks/app.ts` when a page needs another composable.
- **`test/server`** (node; no project name, so scope by path:
  `pnpm exec vitest run test/server`): API handlers, the `shared/` modules, the
  data scripts and services. `test/server/api/setup.ts` mocks `siteThemeService`.
  The word endpoints need no mock because they read in-repo data; their tests
  freeze the clock with `vi.useFakeTimers()`.
- **`test/content`** (fully offline): every entry and every word-list word
  against the committed snapshots. See [`content.md`](content.md).

There are no integration tests. Passing `pnpm test:run` does not prove the app
builds: pages with no test are only exercised by `pnpm build`, so run it after
deleting or renaming a component. CI (`.github/workflows/webpage-test.yml`) runs
`pnpm run test` on pushes to `main` and on pull requests targeting it.

## Conventions

- **Service layer.** Storage and external calls live in `server/services/`; each
  exports the class and a singleton (`siteThemeService`). The daily words
  deliberately have no service: they are in-repo data.
- **Types** are defined in `types/index.ts`.
- **State** is local (`ref`, `computed`); there is no global store. Only
  `color-theme`, `season-choice`, `site-theme-season` and `bgm-volume` ever sit
  in a reader's own `localStorage`.
- **Package manager** is pnpm: use `pnpm install` / `add` / `remove` and the
  scripts in `package.json`.
