# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**A Japanese word a day, taken apart.** Every day NipponDaily opens one Japanese word and shows how it is built: its morphemes, the layer of the vocabulary it belongs to, the processes that shaped it (compounding, rendaku, clipping, ateji, sound change, meaning shift…), and the evidence behind every claim — with a calendar to look back through every word so far. Built with Nuxt 4, Vue 3, and TypeScript. There are no user accounts, no auth, and nothing about a reader is stored. The entries are hand-written, in-repo data (`data/words/YYYY-MM.json`; October 2026 is the first month), drawn from the JLPT N5–N2 vocabulary and checked in CI against committed JMdict/KANJIDIC2 evidence plus pinned Wiktionary text; `GET /api/daily-word` serves a day's entry and refuses any day that hasn't arrived yet in Japan. What an external agent does control is design: a Claude web agent switches NipponDaily's active season (color palette and shape language) through this project's remote MCP server, and `GET /api/site-theme` serves whatever it last set (or a deterministic default).

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

- **A New Word Every Day**: One entry opens each day at midnight in Japan (JST) — the same word for every reader. October 2026 is the first month: thirty-one words chosen for having something real to say about how Japanese words are built.
- **A Calendar to Look Back Through**: `/words` is a month grid. A day that has arrived shows its word and links to the full entry at `/words/<date>`; a day that hasn't shows nothing. Future or impossible dates are rejected with a `400`, so an upcoming word can't be read early, even by asking for its exact date. The front page shows today's word, and once the catalogue runs out it falls back to the newest one instead of showing nothing.
- **Taken Apart**: Each word is split into morphemes with their readings and meanings. Where sound change hides the join (夢 was once いめ; 梅雨 can be read ばいう), the entry shows the reading the parts really spell. A word whose origin is unknown gets no breakdown — any split would be a guess.
- **Which Layer, Which Process**: Every entry names its layer — native 和語, Sino-Japanese 漢語, loanword 外来語 or hybrid 混種語 — and the processes at work, each defined on the page.
- **The Story, Honestly**: A short plain-English account of where the word comes from. When sources disagree or nobody knows, a "Not settled" note lists the competing theories instead of picking a winner.
- **Evidence for Every Claim**: Each entry quotes the exact Wiktionary lines behind its origin claims, pinned to one revision, with a permalink and its CC BY-SA 4.0 license.
- **Verified in CI**: Every entry is checked on every change — its reading, level and meaning must match the JMdict-checked pool; each morpheme's reading and gloss must be backed by KANJIDIC2 or the cited text; every quoted line must be verbatim in the pinned Wiktionary snapshot; and the prose may only mention Japanese that its evidence or the pool contains. (It cannot prove a quote is _true_, or that a sentence about a real word is correct — see [`docs/content-accuracy.md`](docs/content-accuracy.md).) See [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).
- **No Spoilers in the Bundle**: Future words never ship to the browser. Pages never import the entries, only the data-free labels in `shared/word-labels.ts`, and a unit test enforces it.
- **MCP-Driven Seasonal Theme**: A Claude web agent checks and, when it should change, switches NipponDaily's active season (color palette and shape language) through this project's remote MCP server (`get_active_theme`, `save_site_theme`), restricted to a closed set of implemented presets — one per Japanese season: `sakura` (spring, the default), `summer`, `autumn`, and `winter`. `get_active_theme` also returns the season matching today's date in Japan, so the agent never has to work out the month mapping itself. The agent's full operating prompt lives at [`docs/site-theme-agent-prompt.md`](docs/site-theme-agent-prompt.md).
- **Seasonal Shape Language**: A season changes the silhouette of the UI, not just its colours. Using CSS `corner-shape`, cards, panels, buttons and badges become petals with a scooped notch tip and pill buttons in spring, squircle pebbles and droplet buttons in summer, cut leaves and pointed tags (bevel-cut corners) in autumn, and frosted octagons with hexagonal buttons and badges in winter; borders, shadows and focus rings follow the outline. Dividers, bullets, card motifs and the page backdrop change too. Everything comes from `--shape-*` / `--corner-*` / `--motif-*` tokens keyed off `data-season` (plain boxes opt in with `.season-box` / `.season-chip`), so the one MCP call reshapes the whole UI. Browsers without `corner-shape` fall back to rounded corners.
- **Kana Reference**: A hiragana/katakana chart with romaji and shape mnemonics at `/kana`.
- **Education Charms**: Kana pairs hang as 学業守 omamori (academic-success charms) that swing when hovered, and explanations are written on ema, the wooden plaques students hang at Tenjin shrines. Brocade, weave and cord colours follow the active season through `--charm-*` / `--ema-*` tokens, and all motion is switched off under `prefers-reduced-motion`.
- **Ambient Seasonal Graphic**: Falling sakura petals, rising summer fireflies, autumn leaves, or winter snow drift across every page, matching whichever season is active — pure CSS animation driven by the same `data-season` attribute as the color palette, with no extra agent involvement and full `prefers-reduced-motion` support.
- **Seasonal UI**: Built with Nuxt 4, Vue 3, and Tailwind CSS 4 using locally maintained custom UI components (no `@nuxt/ui` dependency). Every color comes from one of four seasonal presets (sakura, summer, autumn, winter), each with a light and dark palette. The presets are defined once in `shared/seasons.ts` (used by the docs page and the MCP server) and in `app/assets/css/tailwind.css`, and a test keeps the two in sync.
- **Resilient Fallback UI**: A graceful UI fallback (`TrendingFallback`) when a word or calendar fetch fails, with a retry. Pages never render an empty frame: a skeleton shows while loading.

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom design tokens defined in `app/assets/css/tailwind.css`
- **Content**: the daily words are in-repo JSON (`data/words/`), served by `GET /api/daily-word` / `GET /api/word-calendar` with no database read
- **Storage**: [Upstash Redis](https://upstash.com/) — holds the seeded JLPT reference pool (N5-N2, written by `pnpm seed`) and the active `SiteTheme` record, which is written by the external agent (or an in-process default) and read by `GET /api/site-theme`
- **Agent Integration**: Remote [MCP](https://modelcontextprotocol.io/) server (`mcp-handler`) at `/api/mcp`, called by an external Claude web agent to control the site's seasonal design
- **Kana Romanization**: [wanakana](https://github.com/WaniKani/WanaKana) — derives `romaji` for the seeded pool
- **Testing**: [Vitest](https://vitest.dev/)

## 📋 Quick Setup

This project uses **pnpm** as its package manager.

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment**:

   ```bash
   cp .env.example .env
   ```

   Configure the following in `.env`:

   ```bash
   # Upstash Redis (the JLPT pool and site-theme data that GET /api/site-theme
   # and the pool endpoints read from, and both `pnpm seed` and the MCP
   # server write to)
   UPSTASH_REDIS_REST_URL="your_upstash_redis_rest_url_here"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token_here"

   # Remote MCP server (server/api/mcp.ts) — bearer token required to call it.
   # Generate with: openssl rand -hex 32
   MCP_AUTH_TOKEN="your_long_random_mcp_secret_here"
   ```

   > [!TIP]
   > Developers are encouraged to sign up for Upstash directly for development — its free tier is more than enough for local setup and testing.

3. **Seed the JLPT pool** (N5-N2, one-time, or whenever you want to refresh it — not needed to read the daily words, which are in-repo):

   ```bash
   pnpm seed
   ```

4. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

### 🔑 Environment Variables

See `.env.example` for reference. Configure these in your `.env` file:

| Variable                   | Required | Description                                                                                                                                                      |
| :------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | **Yes**  | Upstash Redis REST URL — the JLPT pool and site-theme data that `GET /api/site-theme` and the pool endpoints read from, and `pnpm seed`/the MCP server write to. |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes**  | Upstash Redis REST token.                                                                                                                                        |
| `MCP_AUTH_TOKEN`           | **Yes**  | Bearer token required to call the remote MCP server at `/api/mcp` (`Authorization: Bearer <token>` or `?token=`).                                                |

Server-side config is resolved through `server/utils/config.ts`'s `getEnvOrConfig()`, which prefers Nuxt `runtimeConfig` and falls back to `process.env` (`scripts/seed-pool-data.mjs` is the one exception — it runs as a bare `node` process outside any Nuxt context, so it reads `process.env` directly). There is currently no request rate limiting and no integration-test suite — all tests run against mocks.

## 📜 Available Commands

| Command                    | Description                                                                                                |
| :------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                 | Start development server on localhost:3000                                                                 |
| `pnpm build`               | Create a production-ready build                                                                            |
| `pnpm start`               | Run the production server locally                                                                          |
| `pnpm generate`            | Static site generation (SSG)                                                                               |
| `pnpm preview`             | Preview production build                                                                                   |
| `pnpm seed`                | Seed/refresh the JLPT (N5-N2) kanji/vocab pools + the shared hiragana/katakana pool in Redis               |
| `pnpm data:reference`      | Rebuild the committed N5 dictionary evidence the content tests check against                               |
| `pnpm data:reference:jlpt` | Rebuild N4/N3/N2's dictionary evidence snapshots (all four levels are gated by the content tests)          |
| `pnpm data:etymology`      | Rebuild the pinned Wiktionary etymology snapshot the daily-word entries quote (`--refresh <term>` re-pins) |
| `pnpm test`                | Run tests in watch mode                                                                                    |
| `pnpm test:run`            | Run tests once                                                                                             |
| `pnpm test:coverage`       | Run tests with coverage report                                                                             |
| `pnpm lint`                | Lint and auto-fix code                                                                                     |
| `pnpm format`              | Format code with Prettier                                                                                  |
| `pnpm type-check`          | Perform TypeScript type checking                                                                           |
| `pnpm check-qa`            | Run all QA checks (lint, format, type-check, build, test)                                                  |

## 🧪 Testing

NipponDaily uses three Vitest projects configured in `vitest.config.ts`:

- **Unit Tests**: Component/UI tests in a `happy-dom` environment (`test/unit`).
- **Server/API Tests**: API endpoint and service tests in a `node` environment (`test/server`). Endpoint tests mock `poolDataService` / `siteThemeService`; service tests mock the Upstash client.

- **Content-Truth Tests**: `test/content` checks every daily-word entry (`words.test.ts`) against the committed JMdict/KANJIDIC2 evidence and the pinned Wiktionary snapshot, and the pool itself — every word resolves in JMdict, no meaning is reversed, rōmaji matches speech, readings are attested — for N5 (`data/reference/n5-reference.json`) and, mirrored one-for-one, `test/content/{n4,n3,n2}`. See [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).

A few tests guard against drift rather than behaviour: `test/unit/seasons-css-sync.test.ts` checks `shared/seasons.ts` against the real CSS cascade in `tailwind.css`, `test/unit/icons.test.ts` fails if the app references an icon that `app/data/icons.ts` doesn't define, and `test/unit/no-future-leak.test.ts` fails if anything under `app/` imports the module that holds the (future) entries.

```bash
pnpm test          # watch mode
pnpm test:run      # run once
pnpm test:coverage # coverage report
```

## 🤖 MCP Server

`server/api/mcp.ts` exposes a remote MCP server at `/api/mcp` (mounted via `mcp-handler`), protected by a constant-time bearer-token check against `MCP_AUTH_TOKEN` (`Authorization: Bearer <token>` header or `?token=` query param; a missing or wrong token gets a `401`). It's how an external Claude web agent — controlling NipponDaily's seasonal design entirely outside this repo — writes the active `SiteTheme` record into the same Redis key `GET /api/site-theme` reads from. It has no tools for word content; the daily words are written and reviewed in-repo.

Registered tools:

| Tool               | Purpose                                                                                                                                                                                                     |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_active_theme` | Returns `{ active, suggestedSeason, needsUpdate, seasons }`: the stored `SiteTheme` (or `null`), the season matching today's date in Japan, whether they differ, and every accepted preset with its months. |
| `save_site_theme`  | Set the active season to one of the implemented presets (`sakura`, `summer`, `autumn`, `winter`); anything else is rejected by the schema. Saving the already-active season is a no-op (`changed: false`).  |

See [app/pages/docs/architecture.vue](app/pages/docs/architecture.vue) for full tool schemas and diagrams, and [docs/site-theme-agent-prompt.md](docs/site-theme-agent-prompt.md) for the agent's operating prompt.

## 📚 Documentation

The running site ships in-app documentation at `/docs`:

- **System Architecture** (`/docs/architecture`) — a tour of the stack and MCP server tool schemas, with diagrams
- **Color Palette & System** (`/docs/color-palette`) — every season's light/dark palette as named color badges, plus the seasonal shape language
- **Core Features** (`/docs/features`) — the reader-facing capabilities
- **Error & Fallback States** (`/docs/error-states`) — a live catalogue of every degraded, empty, or failure state the UI can render, shown with the real components and mock data
- **Data Integrity & Attribution** (`/docs/data-integrity`) — the N5-N2 data model and the Wiktionary evidence, their licensing, how every entry is kept true, what CI checks (and cannot prove), and what to do when a check fails

Repo-only docs:

- [`docs/site-theme-agent-prompt.md`](docs/site-theme-agent-prompt.md) — the operating prompt for the external theme agent. Keep it in sync with the MCP tool set.
- [`docs/authoring-checklist.md`](docs/authoring-checklist.md) — step-by-step checklists for adding a month of words, writing an entry, correcting a pool word, and refreshing the pinned sources.
- [`docs/content-accuracy.md`](docs/content-accuracy.md) — the ground-truth system in brief: committed JMdict and Wiktionary evidence, the `test/content/` gate, what it can and can't prove, and what to do when a check fails.

## 🔌 API Endpoints

`GET /api/daily-word` — one day's entry from the in-repo catalogue, with the previous day's word and (only once that day has itself arrived) the next. Never fetches dictionary data or calls any external provider.

| Parameter | Type                  | Description                                                                                                                                                                                                 |
| :-------- | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `date`    | string (`YYYY-MM-DD`) | Defaults to today in Japan (JST) — or, if the catalogue has run out, the newest word. Must be a real calendar date, today or earlier — otherwise `400`. A past date the catalogue doesn't cover is a `404`. |

**Response format:**

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
      "stratum": "kango",
      "processes": ["wasei", "compound"],
      "headline": "...",
      "morphemes": [/* { text, reading, base?, meaning, irregular? } */],
      "story": [/* paragraphs */],
      "sources": [/* { quote } — verbatim from the pinned Wiktionary text */],
      "wiktionaryRev": 92203082
    },
    "prev": null,
    "next": { "date": "2026-10-02", "term": "友達" }
  },
  "timestamp": "2026-10-01T00:00:00Z"
}
```

`GET /api/word-calendar` — one month as the calendar draws it: `{ month, months, today, days }`, via an optional `?month=YYYY-MM` (defaults to the current month in Japan if it has words, else the newest month that does; malformed is `400`, no words is `404`). An open day carries its `term`, `kana` and `stratum`; an upcoming day carries only `{ date, status: "upcoming" }` and reveals nothing.

`GET /api/site-theme` — no query params; reads (or, if missing, builds and persists a default for) the single active `SiteTheme`. The default is written with Redis `NX`, so it can never overwrite an agent's concurrent save, and responses are CDN-cached for 60 seconds (`s-maxage=60, stale-while-revalidate=600`), so a season change shows up within about a minute:

```json
{
  "success": true,
  "data": {
    "season": "sakura",
    "updatedAt": 1758182400000,
    "source": "fallback"
  },
  "timestamp": "2026-09-18T00:00:00Z"
}
```

`GET /api/pool-vocab` — one level's whole seeded vocabulary pool (`{ success, data: PoolVocab[], count, timestamp }`), via an optional `?level=` (defaults to `N5`). The seeded JLPT reference pool; no page in the app reads it today.

`GET /api/pool-kanji` — one level's whole seeded kanji pool (`{ success, data: PoolKanji[], count, timestamp }`), via an optional `?level=` (defaults to `N5`). Like the vocab pool, no page in the app reads it today.

Vocab meanings the source list under-glosses (e.g. 早い was only "early") are filled in at read time from `VOCAB_MEANING_ENRICHMENTS` in `shared/meanings.ts`, so every consumer shows the fuller meaning without a re-seed.

The old `/game`, `/learn/**` and `/vocab/**` URLs redirect (`302`) to the front page.

`ALL /api/mcp` — the MCP server described above; see [app/pages/docs/architecture.vue](app/pages/docs/architecture.vue) for its full tool schemas.

## 📖 Data & Attribution

Each JLPT level's kanji and vocabulary (N5-N2) are static reference data seeded once (or re-seeded occasionally, e.g. to pick up a newer JMdict release) by `pnpm seed` (`scripts/seed-pool-data.mjs`) — never fetched or generated at request time. The daily words are hand-written in-repo data that draw on that pool and quote a second, separately pinned source.

| Data               | Source                                                                                                                                                                                                                                                   |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vocabulary (N5-N2) | [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (one CSV per level), cross-referenced against [JMdict](https://github.com/scriptin/jmdict-simplified) for part of speech                                                                 |
| Kanji (N5-N2)      | Derived independently per level from the unique kanji appearing in that level's vocab list, enriched from KANJIDIC2 (on'yomi, kun'yomi, stroke count, meanings), via the same [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) release |
| Daily words        | Hand-written in `data/words/YYYY-MM.json`; origin claims quote [English Wiktionary](https://en.wiktionary.org) through a snapshot pinned per revision id (`data/reference/etymology-reference.json`, built by `pnpm data:etymology`)                     |

**Attribution**: JMdict and KANJIDIC2 are property of the [Electronic Dictionary Research and Development Group](https://www.edrdg.org/), used in conformance with the Group's licence ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)). Accessed via the [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) project's pre-parsed English JSON releases. Each JLPT level's word list is digitized from the community-standard lists originally compiled at tanos.co.uk, via [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (MIT licence). Etymology text is quoted from [English Wiktionary](https://en.wiktionary.org), available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); each entry links the exact revision it quotes, and the entries' own prose is a paraphrase of that evidence, shared under the same licence. `romaji` for the seeded pool is derived via [wanakana](https://github.com/WaniKani/WanaKana) (MIT licence). See the "Data Integrity & Attribution" page ([app/pages/docs/data-integrity.vue](app/pages/docs/data-integrity.vue), served at `/docs/data-integrity`) for the same information as rendered in-app, plus how every entry is checked in CI.

Since the community word list occasionally carries a wrong English gloss (see [`scripts/seed-pool-data.mjs`](scripts/seed-pool-data.mjs)'s `VOCAB_MEANING_OVERRIDES` for confirmed corrections), the seed script cross-checks each entry's meaning against JMdict's own gloss for the same word+reading and warns at seed time if they look like a swapped antonym pair (e.g. "this way" vs. "that way"). It's a heuristic, not a guarantee — flagged entries still need a human to confirm before correcting.

## ⚠️ Limitations

- **Dependencies**: Reading the daily words needs nothing beyond the app itself. A persistent deployment of the theme pipeline needs an Upstash Redis instance and an `MCP_AUTH_TOKEN`; the JLPT reference pool (`pnpm seed`) is only needed for `GET /api/pool-vocab` / `pool-kanji`.
- **One month so far**: only October 2026 has entries. After 2026-10-31 the front page keeps showing the newest word until the next month is written (see [`docs/authoring-checklist.md`](docs/authoring-checklist.md)).
- **Entries are hand-written**: the tests prove quotes, readings and Japanese forms against evidence, but not that an English sentence about a real word is true — that is reviewed in PRs.
- **No rate limiting**: there is currently no request rate limiting on any endpoint.
- **No integration tests**: all tests run against mocks (`test/unit`, `test/server`); there is no SRH/Redis-proxy or `test:integration` setup.

## 📄 License

Released under the [Apache-2.0 License](LICENSE.txt).
