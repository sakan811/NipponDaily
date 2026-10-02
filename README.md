# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**A Japanese word a day, taken apart.** Each day opens one word and shows how it is built: its morphemes, its layer of the vocabulary (和語 native, 漢語 Sino-Japanese, 外来語 loanword, 混種語 hybrid), the processes that shaped it, and the Wiktionary lines behind every claim. A calendar lets you look back through every word so far. No accounts, no tracking.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

## Features

- **One word a day** — opens at midnight in Japan (JST). Only each word's headline is hand-written (`data/word-plan/`); everything else in `data/words/` is generated from JMdict, KANJIDIC2 and pinned Wiktionary text (every day from January 2026 to October 2027, 669 words so far), drawn from the JLPT N5–N2 vocabulary.
- **Calendar** — `/words` is a month grid; each day that has arrived links to `/words/<date>`. A future word can't be read early, not even by asking the API for its date.
- **Explore** — `/explore` searches the words that have opened (by word, reading or meaning; katakana matches hiragana) and filters them by JLPT level, layer and process, with live counts. The filters live in the URL.
- **Patterns** — `/patterns` counts the same entries: layers, levels, processes, which processes travel together, and which sounds voice inside a word (rendaku). Every bar links into Explore.
- **Parts** — `/parts` indexes every morpheme the “Taken apart” rows have shown; `/parts/<text>` groups the words that show one by the reading it takes there. Under each entry, “More like this” offers other open words that share a part, a process or a layer.
- **Evidence** — every origin claim quotes a pinned revision of English Wiktionary. Tests check each entry against committed JMdict/KANJIDIC2 snapshots and that Wiktionary snapshot, and an entry says plainly when an origin is not settled.
- **Four seasons** — spring (`sakura`), `summer`, `autumn`, `winter` change the palette and the shape of the UI. A daily cron sets the site's season from the date in Japan, and the header's season button lets a reader pick their own.
- **Season music** — the header's music button plays a looping background track in a season that has one (autumn only, so far). It is off on every load; only the volume is remembered, in the browser.
- **Kana guide** — `/kana` is a hiragana/katakana chart with mnemonics.

## Tech Stack

[Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript), [Tailwind CSS 4](https://tailwindcss.com/), [Upstash Redis](https://upstash.com/), [Vitest](https://vitest.dev/), [wanakana](https://github.com/WaniKani/WanaKana) (kana conversion in the data scripts and checks), [kuromoji](https://github.com/takuyaa/kuromoji.js) (tokenizer used by the reference builders) and [zod](https://zod.dev/) (query validation in the API). pnpm is the package manager.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3000
```

The daily words need no configuration. Redis is only used for the site's season; fill in `.env` if you want that:

| Variable                   | Used for                                                                                                                                                               |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST URL. Without Redis the season is kept in process memory.                                                                                            |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token.                                                                                                                                              |
| `CRON_SECRET`              | Bearer token for `GET /api/cron/update-season` (Vercel sends it on cron requests). Generate with `openssl rand -hex 32`. Without it the endpoint always answers `401`. |
| `NUXT_PUBLIC_SITE_URL`     | Optional canonical origin for canonical/Open Graph URLs and the sitemap. Without it each request's own origin is used.                                                 |

## Commands

| Command                                       | Description                                                                                                                                                          |
| :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start` / `preview`    | Dev server, production build, run the build, preview it                                                                                                              |
| `pnpm generate`                               | Static site generation                                                                                                                                               |
| `pnpm test` / `test:run` / `test:coverage`    | Vitest in watch mode / once / with coverage                                                                                                                          |
| `pnpm lint` / `format` / `type-check`         | ESLint (auto-fix), Prettier, `tsc --noEmit`                                                                                                                          |
| `pnpm check-qa`                               | Lint, format, type-check, build and test                                                                                                                             |
| `pnpm data:reference` / `data:reference:jlpt` | Rebuild the JMdict/KANJIDIC2 snapshots for N5 / N4–N2 (Node ≥ 22, `tar`, `xz`, network)                                                                              |
| `pnpm data:etymology`                         | Pin Wiktionary pages (`--terms a,b` adds, `--refresh <term>` re-pins, `--prune` drops unused, `--skip-missing` skips pages that can't be fetched)                    |
| `pnpm data:words`                             | Generate `data/words/` from `data/word-plan/` and the committed sources (`--check` verifies, `--keep-going` writes every entry that built, leaving a failed day out) |

## Seasons

| Season            | Months             |
| :---------------- | :----------------- |
| `sakura` (spring) | March–May          |
| `summer`          | June–August        |
| `autumn`          | September–November |
| `winter`          | December–February  |

- `vercel.json` runs `GET /api/cron/update-season` daily at 15:00 UTC (midnight in Japan). It saves the season for that date to Redis, only if it changed.
- `GET /api/site-theme` serves the saved season. If none is saved yet it uses today's season and saves that.
- The season button in the header picks any season or "Follow the calendar". The pick lives in the browser's `localStorage` and is never sent anywhere.
- Palettes and months are defined once in `shared/seasons.ts`; `app/assets/css/tailwind.css` holds the CSS, and a test keeps the two in sync.

## API

| Endpoint                        | Returns                                                                                                                                                       |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /api/daily-word?date=`     | One entry plus its previous/next day. `date` is `YYYY-MM-DD` (default: today in Japan). A future or invalid date is `400`; a past date with no entry `404`.   |
| `GET /api/word-calendar?month=` | `{ month, months, today, days }` for `YYYY-MM` (default: current month). An upcoming day carries only its date.                                               |
| `GET /api/explore`              | Open words filtered by `q`, `level`, `stratum`, `process`, `part` (all optional; empty = no filter, anything invalid `400`), newest first, with facet counts. |
| `GET /api/patterns`             | Counts across the open words: layers, levels, processes, process pairs and the rendaku section.                                                               |
| `GET /api/parts`                | Every part (morpheme) shown by a word that has opened: `{ parts: [{ text, count, readings }] }`, most-used first.                                             |
| `GET /api/related?date=`        | Open words that resemble one entry (shared parts, processes, layer), closest first, each with what it shares. `400` for a future or malformed date.           |
| `GET /api/part?text=`           | One part and the open words that show it, grouped by the reading it has in each, plus words spelled with it that show no breakdown. `404` if none has.        |
| `GET /api/site-theme`           | The site's season: `{ season, updatedAt, source }`, cached by the CDN for 60 seconds.                                                                         |
| `GET /api/cron/update-season`   | Cron target. Requires `Authorization: Bearer <CRON_SECRET>`, else `401`.                                                                                      |

Pages are rendered on the server (a word, the calendar, explore, patterns and the parts pages arrive with their data, a real `404` for a missing day or an unknown route, plus title/description/canonical/Open Graph tags), and `/sitemap.xml` and `/robots.txt` are generated — the sitemap lists only days that have opened (and the parts seen in more than one of them). Set `NUXT_PUBLIC_SITE_URL` to pin the canonical origin; without it each request's own origin is used.

Parameters, status codes and an example response are in [`/docs/architecture`](app/pages/docs/architecture.vue).

## Tests

Three Vitest projects (`vitest.config.ts`):

- `test/unit` — components and pages (happy-dom).
- `test/server` — API handlers, the `shared/` modules, the data scripts and services (node, mocked Redis).
- `test/content` — every daily-word entry and every word in the JLPT lists checked against the committed evidence in `data/reference/`, fully offline. See [`docs/content-accuracy.md`](docs/content-accuracy.md).

There are no integration tests. Several tests guard against drift: `seasons-css-sync` (`shared/seasons.ts` vs the CSS), `icons` (every icon used exists in `app/data/icons.ts`) and `no-future-leak` (nothing under `app/` imports the entries).

CI (`.github/workflows/webpage-test.yml`) runs `pnpm run test` on pushes to `main` and on pull requests targeting it, on Node 25 with pnpm 10.

## Documentation

In the app: [`/docs/architecture`](app/pages/docs/architecture.vue), [`/docs/color-palette`](app/pages/docs/color-palette.vue), [`/docs/features`](app/pages/docs/features.vue), [`/docs/error-states`](app/pages/docs/error-states.vue) and [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).

In the repo: [`docs/core-theme.md`](docs/core-theme.md) (what the app is and its design principles), [`docs/authoring-checklist.md`](docs/authoring-checklist.md) (add a month, write an entry, refresh sources) and [`docs/content-accuracy.md`](docs/content-accuracy.md). [`TODO.md`](TODO.md) tracks the data-feature backlog.

## Data & Attribution

Entries quote [English Wiktionary](https://en.wiktionary.org) (CC BY-SA 4.0); each links its exact revision. Readings and meanings are checked against JMdict and KANJIDIC2, property of the [EDRDG](https://www.edrdg.org/) and used under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) via [jamdict-data](https://pypi.org/project/jamdict-data/). The JLPT word lists come from [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (MIT), digitized from the community list at tanos.co.uk. Details: [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).

## Limitations

- Entries cover every day from 2026-01-01 to 2027-10-31. After 2027-10-31 the home page keeps showing the newest word until the next month is written.
- The tests prove that quotes, readings, meanings and parts of speech match the committed evidence, not that Wiktionary is right. The headline is the one hand-written line; a test only checks the Japanese it mentions.
- No request rate limiting.

## License

[Apache-2.0](LICENSE.txt)
