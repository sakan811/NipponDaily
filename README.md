# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**A Japanese word a day, taken apart.** Each day opens one word and shows how it is built: its morphemes, its layer of the vocabulary (和語 native, 漢語 Sino-Japanese, 外来語 loanword, 混種語 hybrid), the processes that shaped it, and the Wiktionary lines behind every claim. A calendar lets you look back through every word so far. No accounts, no tracking.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

## Features

- **One word a day** — opens at midnight in Japan (JST). Only each word's headline is hand-written (`data/word-plan/`); everything else in `data/words/` is generated from JMdict, KANJIDIC2 and pinned Wiktionary text (January through December 2026 so far), drawn from the JLPT N5–N2 vocabulary.
- **Calendar** — `/words` is a month grid; each day that has arrived links to `/words/<date>`. A future word can't be read early, not even by asking the API for its date.
- **Evidence** — every origin claim quotes a pinned revision of English Wiktionary. Tests check each entry against committed JMdict/KANJIDIC2 snapshots and that Wiktionary snapshot, and an entry says plainly when an origin is not settled.
- **Four seasons** — spring (`sakura`), `summer`, `autumn`, `winter` change the palette and the shape of the UI. A daily cron sets the site's season from the date in Japan, and the header's season button lets a reader pick their own.
- **Kana guide** — `/kana` is a hiragana/katakana chart with mnemonics.

## Tech Stack

[Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript), [Tailwind CSS 4](https://tailwindcss.com/), [Upstash Redis](https://upstash.com/), [Vitest](https://vitest.dev/), [wanakana](https://github.com/WaniKani/WanaKana) (kana conversion in the data scripts and checks). pnpm is the package manager.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3000
```

The daily words need no configuration. Redis is only used for the site's season; fill in `.env` if you want that:

| Variable                   | Used for                                                                                                                 |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST URL. Without Redis the season is kept in process memory.                                              |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token.                                                                                                |
| `CRON_SECRET`              | Bearer token for `GET /api/cron/update-season` (Vercel sends it on cron requests). Generate with `openssl rand -hex 32`. |

## Commands

| Command                                       | Description                                                                                   |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start` / `preview`    | Dev server, production build, run the build, preview it                                       |
| `pnpm generate`                               | Static site generation                                                                        |
| `pnpm test` / `test:run` / `test:coverage`    | Vitest in watch mode / once / with coverage                                                   |
| `pnpm lint` / `format` / `type-check`         | ESLint (auto-fix), Prettier, `tsc --noEmit`                                                   |
| `pnpm check-qa`                               | Lint, format, type-check, build and test                                                      |
| `pnpm data:reference` / `data:reference:jlpt` | Rebuild the JMdict/KANJIDIC2 snapshots for N5 / N4–N2 (Node ≥ 22, `tar`, `xz`, network)       |
| `pnpm data:etymology`                         | Pin Wiktionary pages (`--terms a,b` adds, `--refresh <term>` re-pins, `--prune` drops unused) |
| `pnpm data:words`                             | Generate `data/words/` from `data/word-plan/` and the committed sources (`--check` verifies)  |

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

| Endpoint                        | Returns                                                                                                                                                     |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/daily-word?date=`     | One entry plus its previous/next day. `date` is `YYYY-MM-DD` (default: today in Japan). A future or invalid date is `400`; a past date with no entry `404`. |
| `GET /api/word-calendar?month=` | `{ month, months, today, days }` for `YYYY-MM` (default: current month). An upcoming day carries only its date.                                             |
| `GET /api/site-theme`           | The site's season: `{ season, updatedAt, source }`, cached by the CDN for 60 seconds.                                                                       |
| `GET /api/cron/update-season`   | Cron target. Requires `Authorization: Bearer <CRON_SECRET>`, else `401`.                                                                                    |

Parameters, status codes and an example response are in [`/docs/architecture`](app/pages/docs/architecture.vue).

## Tests

Three Vitest projects (`vitest.config.ts`):

- `test/unit` — components and pages (happy-dom).
- `test/server` — API handlers and services (node, mocked Redis).
- `test/content` — every daily-word entry and every word in the JLPT lists checked against the committed evidence in `data/reference/`, fully offline. See [`docs/content-accuracy.md`](docs/content-accuracy.md).

There are no integration tests. Several tests guard against drift: `seasons-css-sync` (`shared/seasons.ts` vs the CSS), `icons` (every icon used exists in `app/data/icons.ts`) and `no-future-leak` (nothing under `app/` imports the entries).

## Documentation

In the app: [`/docs/architecture`](app/pages/docs/architecture.vue), [`/docs/color-palette`](app/pages/docs/color-palette.vue), [`/docs/features`](app/pages/docs/features.vue), [`/docs/error-states`](app/pages/docs/error-states.vue) and [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).

In the repo: [`docs/authoring-checklist.md`](docs/authoring-checklist.md) (add a month, write an entry, refresh sources) and [`docs/content-accuracy.md`](docs/content-accuracy.md).

## Data & Attribution

Entries quote [English Wiktionary](https://en.wiktionary.org) (CC BY-SA 4.0); each links its exact revision. Readings and meanings are checked against JMdict and KANJIDIC2, property of the [EDRDG](https://www.edrdg.org/) and used under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) via [jamdict-data](https://pypi.org/project/jamdict-data/). The JLPT word lists come from [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (MIT), digitized from the community list at tanos.co.uk. Details: [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).

## Limitations

- Entries cover January through December 2026. After 2026-12-31 the home page keeps showing the newest word until the next month is written.
- The tests prove that quotes, readings, meanings and parts of speech match the committed evidence, not that Wiktionary is right. The headline is the one hand-written line; a test only checks the Japanese it mentions.
- No request rate limiting.

## License

[Apache-2.0](LICENSE.txt)
