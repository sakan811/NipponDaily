# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**A daily Japanese-learning game.** NipponDaily turns a persisted hiragana/katakana/kanji/vocabulary pool — across JLPT levels N5 through N2 — into one fresh 20-question multiple-choice round per day, built with Nuxt 4, Vue 3, and TypeScript. There are no user accounts and no auth on the play side. `GET /api/daily-game` serves each day's `DailyGame` for the requested level (N5 by default; a level selector on `/game` can switch it) from Upstash Redis, generating it deterministically from that level's pool the first time a date is requested and then persisting it; no agent or AI provider is involved in game content. What an external agent does control is design: a Claude web agent switches NipponDaily's active season (color palette and shape language) through this project's remote MCP server, and `GET /api/site-theme` serves whatever it last set (or a deterministic default). Gameplay itself (current question, score, per-kind accuracy) lives entirely in the browser's own component state and is never sent back to the server or saved anywhere.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

- **Daily 20-Question Round**: 5 multiple-choice questions each for hiragana, katakana, kanji, and vocabulary — every question has exactly 4 choices including the correct answer. Kanji answers list a character's main meanings (日 → "day, sun, Japan"), not just the first, and wrong choices are never ones that could also pass as correct (e.g. 暑い "hot (weather)" never sits beside 熱い "hot (objects)").
- **Choose Your JLPT Level**: A level selector on `/game` switches which pool the round is drawn from — N5 by default, N4 through N2, or `ALL` (every level's kanji/vocab merged into one round) — passed to `GET /api/daily-game?level=` under the hood. Each level (including `ALL`) has its own repeat-avoidance history and persisted daily record, so switching levels never mixes one level's recently-used items into another's.
- **One Game, One Day**: No accounts, no server-side gameplay state — score and per-kind accuracy live only in the browser for the current round. "Play Again" reshuffles and restarts from the already-fetched payload with no refetch.
- **Replay Any Past Day**: Daily games are never deleted, so `GET /api/daily-game?date=YYYY-MM-DD` can replay any past date. Future or impossible dates are rejected with a `400`, so nobody can pre-generate games or write arbitrary keys.
- **Deterministic Daily Generation**: `GET /api/daily-game` builds each day's game itself from that level's pool (seeded PRNG) the first time it's requested and persists it, so the site never shows "no game today" — no agent or AI provider is involved in game content. A Vercel Cron job also pre-generates each day's game for every JLPT level plus the merged `ALL` round at `00:00 UTC`, and generation avoids repeating any item used in the past 7 days.
- **MCP-Driven Seasonal Theme**: A Claude web agent checks and, when it should change, switches NipponDaily's active season (color palette and shape language) through this project's remote MCP server (`get_active_theme`, `save_site_theme`), restricted to a closed set of implemented presets — one per Japanese season: `sakura` (spring, the default), `summer`, `autumn`, and `winter`. `get_active_theme` also returns the season matching today's date in Japan, so the agent never has to work out the month mapping itself. The agent's full operating prompt lives at [`docs/site-theme-agent-prompt.md`](docs/site-theme-agent-prompt.md).
- **Seasonal Shape Language**: A season changes the silhouette of the UI, not just its colours. Using CSS `corner-shape`, cards, panels, buttons and badges become petals with a scooped notch tip and pill buttons in spring, squircle pebbles and droplet buttons in summer, cut leaves and pointed tags (bevel-cut corners) in autumn, and frosted octagons with hexagonal buttons and badges in winter; borders, shadows and focus rings follow the outline. Dividers, bullets, card motifs and the page backdrop change too. Everything comes from `--shape-*` / `--corner-*` / `--motif-*` tokens keyed off `data-season` (plain boxes opt in with `.season-box` / `.season-chip`), so the one MCP call reshapes the whole UI. Browsers without `corner-shape` fall back to rounded corners.
- **N5 & N4 Lesson Paths**: `/learn` walks through all 718 N5 words in 82 short lessons, or all 666 N4 words in 78 short lessons (at most 12 words each), across six stages each — a level selector switches between them. Each lesson explains the pattern tying its words together, breaks every word into its kanji with their meanings, and has a Kanji Spotlight showing where else each character turns up. A topic's example sentences and common mistake appear once, on its last lesson. Each lesson ends with flip-card review ("Got it" / "Again"), which is deliberately not scored: the daily game is the test. Like the game, lessons store nothing, since there are no user accounts; nothing about the learner is saved on the server or in the browser. The lessons are built from curated word clusters (`app/data/vocab-guide.ts` for N5, `app/data/vocab-guide-n4.ts` for N4) via shared lesson-building logic (`app/data/lessons.ts`), and a test checks every word id against that level's committed dictionary reference, so no word is left out. N3/N2 are seeded pools without a lesson path yet. The old `/vocab/families/<key>` topic pages now permanently redirect to N5's matching lesson.
- **Verified Lesson Content**: Every hand-written fact — for N5 and N4 — is checked in CI against committed dictionary evidence (`data/reference/n5-reference.json` and `data/reference/n4-reference.json`, built from pinned JMdict/KANJIDIC2 data by `pnpm data:reference` and `pnpm data:reference:jlpt`). Every example sentence's rōmaji must be a valid reading of its Japanese, and every word must be a real JMdict word with that reading. Every hand-written meaning must be backed by JMdict, and lesson prose may only mention real words. A wrong lesson fails CI before it can merge. Word-list errors are corrected in `shared/meanings.ts` at read time, with ids unchanged. See [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).
- **Kana & Vocabulary Guides**: Study references alongside the game — a hiragana/katakana chart with romaji at `/kana`, and the vocabulary pool at `/vocab` (its own level selector, N5-N2) to search, filter and read a grammar guide for each word type (served by `GET /api/pool-vocab`). N5 and N4 words link to the lesson that teaches them, and the game's end screen links missed kanji and vocab to their lessons.
- **Education Charms**: Learning surfaces are dressed as the charms Japanese students keep for their studies. Kana pairs, vocabulary words and score tiles hang as 学業守 omamori (academic-success charms) that swing when hovered. Explanations and the daily game's prompt are written on ema, the wooden plaques students hang at Tenjin shrines. A correct answer stamps a vermilion 合格 ("passed") hanko onto the ema, and a wrong one rattles it on its cord. Brocade, weave and cord colours follow the active season through `--charm-*` / `--ema-*` tokens, and all motion is switched off under `prefers-reduced-motion`.
- **Ambient Seasonal Graphic**: Falling sakura petals, rising summer fireflies, autumn leaves, or winter snow drift across every page, matching whichever season is active — pure CSS animation driven by the same `data-season` attribute as the color palette, with no extra agent involvement and full `prefers-reduced-motion` support.
- **Seasonal UI**: Built with Nuxt 4, Vue 3, and Tailwind CSS 4 using locally maintained custom UI components (no `@nuxt/ui` dependency). Every color comes from one of four seasonal presets (sakura, summer, autumn, winter), each with a light and dark palette. The presets are defined once in `shared/seasons.ts` (used by the docs page and the MCP server) and in `app/assets/css/tailwind.css`, and a test keeps the two in sync.
- **Resilient Fallback UI**: A graceful UI fallback (`TrendingFallback`) when the `/api/daily-game` fetch fails. Server errors are logged server-side; clients get a generic message (the real error is echoed only in development).

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom design tokens defined in `app/assets/css/tailwind.css`
- **Storage**: [Upstash Redis](https://upstash.com/) — the only datastore; the JLPT pool (N5-N2) is seeded by `pnpm seed`, `DailyGame` records are generated and persisted per level in-process by `GET /api/daily-game`, and the active `SiteTheme` record is written by the external agent (or an in-process default) and read by `GET /api/site-theme`
- **Agent Integration**: Remote [MCP](https://modelcontextprotocol.io/) server (`mcp-handler`) at `/api/mcp`, called by an external Claude web agent to control the site's seasonal design
- **Kana Romanization**: [wanakana](https://github.com/WaniKani/WanaKana) — derives `romaji` for the hiragana/katakana pool at seed time
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
   # Upstash Redis (the JLPT pool, daily-game, and site-theme data that GET
   # /api/daily-game and GET /api/site-theme read from, and both `pnpm seed`
   # and the MCP server write to)
   UPSTASH_REDIS_REST_URL="your_upstash_redis_rest_url_here"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token_here"

   # Remote MCP server (server/api/mcp.ts) — bearer token required to call it.
   # Generate with: openssl rand -hex 32
   MCP_AUTH_TOKEN="your_long_random_mcp_secret_here"

   # Vercel Cron target (server/api/cron/generate-daily-game.get.ts) —
   # bearer token required to call it. Only needed for a Vercel deployment;
   # Vercel sends it automatically as `Authorization: Bearer $CRON_SECRET`.
   # Generate with: openssl rand -hex 32
   CRON_SECRET="your_long_random_cron_secret_here"
   ```

   > [!TIP]
   > Developers are encouraged to sign up for Upstash directly for development — its free tier is more than enough for local setup and testing.

3. **Seed the JLPT pool** (N5-N2, one-time, or whenever you want to refresh it):

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

| Variable                   | Required | Description                                                                                                                                                                  |
| :------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | **Yes**  | Upstash Redis REST URL — the JLPT pool, daily-game, and site-theme data that `GET /api/daily-game`/`GET /api/site-theme` read from, and `pnpm seed`/the MCP server write to. |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes**  | Upstash Redis REST token.                                                                                                                                                    |
| `MCP_AUTH_TOKEN`           | **Yes**  | Bearer token required to call the remote MCP server at `/api/mcp` (`Authorization: Bearer <token>` or `?token=`).                                                            |
| `CRON_SECRET`              | No       | Bearer token required to call the Vercel Cron target at `/api/cron/generate-daily-game`; only needed for a Vercel deployment — Vercel sends it automatically.                |

Server-side config is resolved through `server/utils/config.ts`'s `getEnvOrConfig()`, which prefers Nuxt `runtimeConfig` and falls back to `process.env` (`scripts/seed-pool-data.mjs` is the one exception — it runs as a bare `node` process outside any Nuxt context, so it reads `process.env` directly). There is currently no request rate limiting and no integration-test suite — all tests run against mocks.

## 📜 Available Commands

| Command                    | Description                                                                                                  |
| :------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                 | Start development server on localhost:3000                                                                   |
| `pnpm build`               | Create a production-ready build                                                                              |
| `pnpm start`               | Run the production server locally                                                                            |
| `pnpm generate`            | Static site generation (SSG)                                                                                 |
| `pnpm preview`             | Preview production build                                                                                     |
| `pnpm seed`                | Seed/refresh the JLPT (N5-N2) kanji/vocab pools + the shared hiragana/katakana pool in Redis                 |
| `pnpm data:reference`      | Rebuild the committed N5 dictionary evidence the content tests check against                                 |
| `pnpm data:reference:jlpt` | Rebuild N4/N3/N2's dictionary evidence snapshots (N4's is gated by the content tests too; N3/N2 are not yet) |
| `pnpm test`                | Run tests in watch mode                                                                                      |
| `pnpm test:run`            | Run tests once                                                                                               |
| `pnpm test:coverage`       | Run tests with coverage report                                                                               |
| `pnpm lint`                | Lint and auto-fix code                                                                                       |
| `pnpm format`              | Format code with Prettier                                                                                    |
| `pnpm type-check`          | Perform TypeScript type checking                                                                             |
| `pnpm check-qa`            | Run all QA checks (lint, format, type-check, build, test)                                                    |

## 🧪 Testing

NipponDaily uses three Vitest projects configured in `vitest.config.ts`:

- **Unit Tests**: Component/UI tests in a `happy-dom` environment (`test/unit`).
- **Server/API Tests**: API endpoint and service tests in a `node` environment (`test/server`). Endpoint tests mock `poolDataService` / `siteThemeService`; service tests mock the Upstash client.

- **Content-Truth Tests**: `test/content` checks N5 lesson content (example rōmaji, word forms and readings, hand-written meanings, prose, the kana guide) against `data/reference/n5-reference.json`, mirrored one-for-one by `test/content/n4` against N4's own lesson content and `data/reference/n4-reference.json`. N3/N2 have their own committed evidence snapshots too (`data/reference/{n3,n2}-reference.json`, built by `pnpm data:reference:jlpt`) but no hand-written content yet to gate them against. See [`/docs/data-integrity`](app/pages/docs/data-integrity.vue).

A few tests guard against drift rather than behaviour: `test/unit/seasons-css-sync.test.ts` checks `shared/seasons.ts` against the real CSS cascade in `tailwind.css`, and `test/unit/icons.test.ts` fails if the app references an icon that `app/data/icons.ts` doesn't define.

```bash
pnpm test          # watch mode
pnpm test:run      # run once
pnpm test:coverage # coverage report
```

## 🤖 MCP Server

`server/api/mcp.ts` exposes a remote MCP server at `/api/mcp` (mounted via `mcp-handler`), protected by a constant-time bearer-token check against `MCP_AUTH_TOKEN` (`Authorization: Bearer <token>` header or `?token=` query param; a missing or wrong token gets a `401`). It's how an external Claude web agent — controlling NipponDaily's seasonal design entirely outside this repo — writes the active `SiteTheme` record into the same Redis key `GET /api/site-theme` reads from. It has no tools for game content; daily games are generated entirely in-repo.

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
- **Core Features** (`/docs/features`) — the player-facing capabilities
- **Error & Fallback States** (`/docs/error-states`) — a live catalogue of every degraded, empty, or failure state the UI can render, shown with the real components and mock data
- **Data Integrity & Attribution** (`/docs/data-integrity`) — the N5-N2 data model and its licensing, how N5's and N4's lesson content is kept true, what CI checks, and what to do when a check fails

Repo-only docs:

- [`docs/site-theme-agent-prompt.md`](docs/site-theme-agent-prompt.md) — the operating prompt for the external theme agent. Keep it in sync with the MCP tool set.

## 🔌 API Endpoints

`GET /api/daily-game` — reads (or, if missing, builds and persists) one day's game for one JLPT level; it never fetches dictionary data or calls any external provider.

| Parameter | Type                         | Description                                                                                                                                                 |
| :-------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `date`    | string (`YYYY-MM-DD`)        | Defaults to today (UTC). Daily games are never deleted, so any past date can be replayed. Must be a real calendar date, today or earlier — otherwise `400`. |
| `level`   | `N5` \| `N4` \| `N3` \| `N2` \| `ALL` | Defaults to `N5`. `/game`'s level selector passes this once a player switches levels. `ALL` merges every level's kanji/vocab pool into one round. An unrecognized value is rejected with `400`.                         |

**Response format:**

```json
{
  "success": true,
  "data": {
    "date": "2026-09-18",
    "level": "N5",
    "questions": [
      /* 20 GameQuestion — id, kind, prompt, promptSub?, correctAnswer, choices (4) */
    ],
    "generatedAt": 1758182400000,
    "source": "fallback"
  },
  "timestamp": "2026-09-18T00:00:00Z"
}
```

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

`GET /api/cron/generate-daily-game` — the Vercel Cron target (`vercel.json`, scheduled for `00:00 UTC` daily) that pre-generates the day's game for every JLPT level plus the merged `ALL` round via the same build path as `GET /api/daily-game`; each level is generated independently, so one level failing never blocks the others, and idempotent per level (games are written with Redis `NX`, so a retry never overwrites one), bearer-token protected via `CRON_SECRET`.

`GET /api/pool-vocab` — one level's whole seeded vocabulary pool (`{ success, data: PoolVocab[], count, timestamp }`), via an optional `?level=` (defaults to `N5`); `/vocab` and its per-type sub-pages have their own level selector spanning N5-N2.

`GET /api/pool-kanji` — one level's whole seeded kanji pool (`{ success, data: PoolKanji[], count, timestamp }`), via an optional `?level=` (defaults to `N5`); `/learn`'s lesson pages request whichever of N5/N4 the page's own level selector has active.

Vocab meanings the source list under-glosses (e.g. 早い was only "early") are filled in at read time from `VOCAB_MEANING_ENRICHMENTS` in `shared/meanings.ts`, so the game, lessons and guide all show the fuller meaning without a re-seed.

`ALL /api/mcp` — the MCP server described above; see [app/pages/docs/architecture.vue](app/pages/docs/architecture.vue) for its full tool schemas.

## 📖 Data & Attribution

Hiragana, katakana, and every JLPT level's own kanji and vocabulary (N5-N2) are static reference data seeded once (or re-seeded occasionally, e.g. to pick up a newer JMdict release) by `pnpm seed` (`scripts/seed-pool-data.mjs`) — never fetched or generated at request time.

| Data                | Source                                                                                                                                                                                                                                                   |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hiragana / Katakana | Hardcoded (fixed, unchanging syllabaries — not dictionary content, not JLPT-leveled); `romaji` derived via [wanakana](https://github.com/WaniKani/WanaKana)                                                                                              |
| Vocabulary (N5-N2)  | [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (one CSV per level), cross-referenced against [JMdict](https://github.com/scriptin/jmdict-simplified) for part of speech                                                                 |
| Kanji (N5-N2)       | Derived independently per level from the unique kanji appearing in that level's vocab list, enriched from KANJIDIC2 (on'yomi, kun'yomi, stroke count, meanings), via the same [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) release |
| Daily games         | Generated deterministically from the requested level's pool by `GET /api/daily-game` the first time each date+level is requested                                                                                                                         |

**Attribution**: JMdict and KANJIDIC2 are property of the [Electronic Dictionary Research and Development Group](https://www.edrdg.org/), used in conformance with the Group's licence ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)). Accessed via the [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) project's pre-parsed English JSON releases. Each JLPT level's word list is digitized from the community-standard lists originally compiled at tanos.co.uk, via [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (MIT licence). `romaji` for the hiragana/katakana pool is derived via [wanakana](https://github.com/WaniKani/WanaKana) (MIT licence). See the "Data Integrity & Attribution" page ([app/pages/docs/data-integrity.vue](app/pages/docs/data-integrity.vue), served at `/docs/data-integrity`) for the same information as rendered in-app, plus how N5's and N4's content is checked in CI.

Since the community word list occasionally carries a wrong English gloss (see [`scripts/seed-pool-data.mjs`](scripts/seed-pool-data.mjs)'s `VOCAB_MEANING_OVERRIDES` for confirmed corrections), the seed script cross-checks each entry's meaning against JMdict's own gloss for the same word+reading and warns at seed time if they look like a swapped antonym pair (e.g. "this way" vs. "that way"). It's a heuristic, not a guarantee — flagged entries still need a human to confirm before correcting.

## ⚠️ Limitations

- **Dependencies**: A persistent deployment needs an Upstash Redis instance and an `MCP_AUTH_TOKEN` for the agent-facing theme pipeline, plus a seeded JLPT pool (`pnpm seed`). A Vercel deployment should also set `CRON_SECRET` so the daily pre-generation cron job is authenticated.
- **No rate limiting**: there is currently no request rate limiting on any endpoint.
- **No integration tests**: all tests run against mocks (`test/unit`, `test/server`); there is no SRH/Redis-proxy or `test:integration` setup.

## 📄 License

Released under the [Apache-2.0 License](LICENSE.txt).
