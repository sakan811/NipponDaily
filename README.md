# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**A daily Japanese-learning game.** NipponDaily turns a persisted N5 hiragana/katakana/kanji/vocabulary pool into one fresh 20-question multiple-choice round per day, built with Nuxt 4, Vue 3, and TypeScript. There are no user accounts and no auth on the play side. The site itself only reads a pre-computed `DailyGame` record out of Upstash Redis and serves it via `GET /api/daily-game` — it never generates a game synchronously on request (unless no agent-authored game exists yet for today, in which case it builds a deterministic fallback from the pool and persists that instead). Game generation happens externally: a Claude web agent samples the persisted pool on a **daily** schedule and writes one finished `DailyGame` straight into Redis through this project's remote MCP server. Gameplay itself (score, streak, current question) lives entirely in the browser's own component state and is never sent back to the server or saved anywhere.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

- **Daily 20-Question Round**: 5 multiple-choice questions each for hiragana, katakana, kanji, and vocabulary — every question has exactly 4 choices including the correct answer.
- **One Game, One Day**: No accounts, no server-side gameplay state — score, streak, longest streak, and per-kind accuracy live only in the browser for the current round. "Play Again" reshuffles and restarts from the already-fetched payload with no refetch.
- **Replay Any Past Day**: Daily games are never deleted, so `GET /api/daily-game?date=YYYY-MM-DD` can replay any past date.
- **MCP-Driven Game Pipeline**: A Claude web agent samples the static N5 pool on a daily schedule and calls tools on this project's remote MCP server (`get_n5_pool`, `get_recent_daily_games`, `save_daily_game`) to author and persist each day's game directly in Redis. The agent's full operating prompt lives at [`docs/daily-game-agent-prompt.md`](docs/daily-game-agent-prompt.md).
- **Never-Empty Fallback**: If no agent-authored game exists yet for today, `GET /api/daily-game` builds a deterministic fallback game from the pool (seeded PRNG) and persists it, so the site never shows "no game today."
- **Sakura-Inspired UI**: Built with Nuxt 4, Vue 3, and Tailwind CSS 4 using locally maintained custom UI components (no `@nuxt/ui` dependency). Two themes: a soft "Classic Sakura" day theme (deep rose against cream washi, grounded by sage and warm bark brown) and a midnight-inverted "Midnight Leaves & Evening Plum" dark theme (luminous teal and evening orchid against a midnight slate canvas).
- **Resilient Fallback UI**: A graceful UI fallback (`TrendingFallback`) when the `/api/daily-game` fetch fails.

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom design tokens defined in `app/assets/css/tailwind.css`
- **Storage**: [Upstash Redis](https://upstash.com/) — the only datastore; the N5 pool is seeded by `pnpm seed:n5`, and `DailyGame` records are written by the external agent (or the in-process fallback) and read by `GET /api/daily-game`
- **Agent Integration**: Remote [MCP](https://modelcontextprotocol.io/) server (`mcp-handler`) at `/api/mcp`, called by an external Claude web agent
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
   # Upstash Redis (the N5 pool + daily-game database GET /api/daily-game reads from,
   # and both `pnpm seed:n5` and the MCP server write to)
   UPSTASH_REDIS_REST_URL="your_upstash_redis_rest_url_here"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token_here"

   # Remote MCP server (server/api/mcp.ts) — bearer token required to call it.
   # Generate with: openssl rand -hex 32
   MCP_AUTH_TOKEN="your_long_random_mcp_secret_here"
   ```

   > [!TIP]
   > Developers are encouraged to sign up for Upstash directly for development — its free tier is more than enough for local setup and testing.

3. **Seed the N5 pool** (one-time, or whenever you want to refresh it):

   ```bash
   pnpm seed:n5
   ```

4. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

### 🔑 Environment Variables

See `.env.example` for reference. Configure these in your `.env` file:

| Variable                   | Required | Description                                                                                                                              |
| :------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | **Yes**  | Upstash Redis REST URL — the N5 pool + daily-game database `GET /api/daily-game` reads from, and `pnpm seed:n5`/the MCP server write to. |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes**  | Upstash Redis REST token.                                                                                                                |
| `MCP_AUTH_TOKEN`           | **Yes**  | Bearer token required to call the remote MCP server at `/api/mcp` (`Authorization: Bearer <token>` or `?token=`).                        |

Server-side config is resolved through `server/utils/config.ts`'s `getEnvOrConfig()`, which prefers Nuxt `runtimeConfig` and falls back to `process.env` (`scripts/seed-n5-data.mjs` is the one exception — it runs as a bare `node` process outside any Nuxt context, so it reads `process.env` directly). There is currently no request rate limiting and no integration-test suite — all tests run against mocks.

## 📜 Available Commands

| Command              | Description                                                     |
| :------------------- | :-------------------------------------------------------------- |
| `pnpm dev`           | Start development server on localhost:3000                      |
| `pnpm build`         | Create a production-ready build                                 |
| `pnpm start`         | Run the production server locally                               |
| `pnpm generate`      | Static site generation (SSG)                                    |
| `pnpm preview`       | Preview production build                                        |
| `pnpm seed:n5`       | Seed/refresh the N5 kanji/hiragana/katakana/vocab pool in Redis |
| `pnpm test`          | Run tests in watch mode                                         |
| `pnpm test:run`      | Run tests once                                                  |
| `pnpm test:coverage` | Run tests with coverage report                                  |
| `pnpm lint`          | Lint and auto-fix code                                          |
| `pnpm format`        | Format code with Prettier                                       |
| `pnpm type-check`    | Perform TypeScript type checking                                |
| `pnpm check-qa`      | Run all QA checks (lint, format, type-check, build, test)       |

## 🧪 Testing

NipponDaily uses two Vitest projects configured in `vitest.config.ts`:

- **Unit Tests**: Component/UI tests in a `happy-dom` environment (`test/unit`).
- **Server/API Tests**: API endpoint and service tests in a `node` environment (`test/server`), with `n5DataService` mocked directly since `GET /api/daily-game` only ever reads from Redis (with an in-process fallback generator).

```bash
pnpm test          # watch mode
pnpm test:run      # run once
pnpm test:coverage # coverage report
```

## 🤖 MCP Server

`server/api/mcp.ts` exposes a remote MCP server at `/api/mcp` (mounted via `mcp-handler`), protected by a constant-time bearer-token check against `MCP_AUTH_TOKEN` (`Authorization: Bearer <token>` header or `?token=` query param; a missing or wrong token gets a `401`). It's how an external Claude web agent — sampling the N5 pool and authoring each day's game entirely outside this repo — writes finished `DailyGame` records into the same Redis keys `GET /api/daily-game` reads from.

Registered tools:

| Tool                     | Purpose                                                                                                                                                          |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_n5_pool`            | Bounded random sample (default 20, max 50) of one pool kind (`hiragana`/`katakana`/`kanji`/`vocab`), with optional `excludeIds` to skip recently-featured items. |
| `get_recent_daily_games` | Item ids featured over the last N days (default 7), so the agent can avoid repeating them.                                                                       |
| `save_daily_game`        | Persist one day's 4–40 authored questions (each with exactly 4 choices including the correct answer); `date` defaults to today (UTC).                            |

See [app/pages/docs/architecture.vue](app/pages/docs/architecture.vue) for full tool schemas and diagrams, and [docs/daily-game-agent-prompt.md](docs/daily-game-agent-prompt.md) for the agent's operating prompt.

## 📚 Documentation

The running site ships in-app documentation at `/docs`:

- **System Architecture** (`/docs/architecture`) — a tour of the stack, the N5 data model, MCP server tool schemas, and data attribution, with diagrams
- **Core Features** (`/docs/features`) — the player-facing capabilities
- **Error & Fallback States** (`/docs/error-states`) — a live catalogue of every degraded, empty, or failure state the UI can render, shown with the real components and mock data

Repo-only docs:

- [`docs/daily-game-agent-prompt.md`](docs/daily-game-agent-prompt.md) — the operating prompt for the external daily game-authoring agent. Keep it in sync with the MCP tool set.

## 🔌 API Endpoint

`GET /api/daily-game` — the only endpoint the frontend calls directly. It reads (or, if missing, builds and persists a fallback for) one day's game; it never fetches dictionary data or runs generation synchronously beyond that fallback.

| Parameter | Type                  | Description                                                                               |
| :-------- | :-------------------- | :---------------------------------------------------------------------------------------- |
| `date`    | string (`YYYY-MM-DD`) | Defaults to today (UTC). Daily games are never deleted, so any past date can be replayed. |

**Response format:**

```json
{
  "success": true,
  "data": {
    "date": "2026-09-18",
    "questions": [
      /* 20 GameQuestion — id, kind, prompt, promptSub?, correctAnswer, choices (4) */
    ],
    "generatedAt": 1758182400000,
    "source": "agent"
  },
  "timestamp": "2026-09-18T00:00:00Z"
}
```

`ALL /api/mcp` is the only other in-repo endpoint — the MCP server described above; see [app/pages/docs/architecture.vue](app/pages/docs/architecture.vue) for its full tool schemas.

## 📖 Data & Attribution

Hiragana, katakana, N5 kanji, and N5 vocabulary are static reference data seeded once (or re-seeded occasionally, e.g. to pick up a newer JMdict release) by `pnpm seed:n5` (`scripts/seed-n5-data.mjs`) — never fetched or generated at request time.

| Data                | Source                                                                                                                                                                                                                     |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hiragana / Katakana | Hardcoded (fixed, unchanging syllabaries — not dictionary content); `romaji` derived via [wanakana](https://github.com/WaniKani/WanaKana)                                                                                  |
| N5 vocabulary       | [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (N5-tagged words), cross-referenced against [JMdict](https://github.com/scriptin/jmdict-simplified) for part of speech                                     |
| N5 kanji            | Derived from the unique kanji appearing in the N5 vocab list, enriched from KANJIDIC2 (on'yomi, kun'yomi, stroke count, meanings), via the same [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) release |
| Daily games         | Agent-authored via `save_daily_game`, or generated on the fly by `GET /api/daily-game`                                                                                                                                     |

**Attribution**: JMdict and KANJIDIC2 are property of the [Electronic Dictionary Research and Development Group](https://www.edrdg.org/), used in conformance with the Group's licence ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)). Accessed via the [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) project's pre-parsed English JSON releases. The N5-level word list is digitized from the community-standard list originally compiled at tanos.co.uk, via [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list) (MIT licence). `romaji` for the hiragana/katakana pool is derived via [wanakana](https://github.com/WaniKani/WanaKana) (MIT licence). See the "N5 Data & Attribution" section of [app/pages/docs/architecture.vue](app/pages/docs/architecture.vue) for the same information as rendered in-app.

Since the community word list occasionally carries a wrong English gloss (see [`scripts/seed-n5-data.mjs`](scripts/seed-n5-data.mjs)'s `VOCAB_MEANING_OVERRIDES` for confirmed corrections), the seed script cross-checks each entry's meaning against JMdict's own gloss for the same word+reading and warns at seed time if they look like a swapped antonym pair (e.g. "this way" vs. "that way"). It's a heuristic, not a guarantee — flagged entries still need a human to confirm before correcting.

## ⚠️ Limitations

- **Dependencies**: A persistent deployment needs an Upstash Redis instance and an `MCP_AUTH_TOKEN` for the agent-facing pipeline, plus a seeded N5 pool (`pnpm seed:n5`).
- **No rate limiting**: there is currently no request rate limiting on any endpoint.
- **No integration tests**: all tests run against mocks (`test/unit`, `test/server`); there is no SRH/Redis-proxy or `test:integration` setup.

## 📄 License

Released under the [Apache-2.0 License](LICENSE.txt).
