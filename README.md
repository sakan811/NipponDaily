# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**Learn Japanese from real Japan news.** NipponDaily turns each week's Japanese-language news articles into self-contained Japanese lessons, built with Nuxt 4, Vue 3, and TypeScript. There are no user accounts and no auth on the reading side; lesson content is anonymous and rotates on a 30-day retention window. The site itself only reads pre-computed `Lesson` records out of Upstash Redis and serves them via `GET /api/news` — it never fetches news or runs any AI processing itself. All news discovery **and Japanese-lesson authoring** happens externally: a Claude web agent researches Japanese-language Japan news on a **weekly** schedule and writes finished `Lesson` records — one per article — straight into Redis through this project's remote MCP server.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

- **Japanese Lessons from Real News**: Each lesson is one Japanese-language article turned into teaching material authored from its own Japanese text — a representative passage with inline furigana (`<ruby>`) markup, its Hepburn rōmaji, an 8–15 term vocabulary list (readings, rōmaji, meanings, JLPT levels, example sentences), and 1–3 grammar notes.
- **One Article, One Lesson**: No clustering, no cross-article synthesis, no summary/analysis prose, and no topic taxonomy — every lesson stands on its own, so the reading view stays simple.
- **Browse by JLPT Difficulty**: Filter lessons by level (N5–N1); each lesson carries one overall difficulty estimate shown as a badge, and the list is always ordered newest article first.
- **Visual Trust Scoring**: A per-article credibility score (0.0–1.0) the Claude agent assigns on first sight of a publisher, cached per-domain in Redis and reused automatically afterwards, rendered with an HSL color gradient (red → green).
- **MCP-Driven Lesson Pipeline**: A Claude web agent researches a week of Japan news from Japanese-language publishers on a weekly schedule, authors a lesson per article, and calls tools on this project's remote MCP server (`get_recent_lessons`, `check_processed_urls`, `upsert_lesson`, `cleanup_old_data`, `mark_ingest_complete`) to read, write, and prune lessons directly in Redis. The agent's full operating prompt lives at [`docs/news-pipeline-agent-prompt.md`](docs/news-pipeline-agent-prompt.md).
- **Automated Data Retention**: The `cleanup_old_data` MCP tool permanently prunes lessons whose article is older than 30 days from Redis so the store doesn't grow unbounded — run as step 0 of every agent run, or ad hoc by asking the agent to run it manually. Supports `{ dryRun: true }` to preview deletions.
- **Editorial, Newspaper-Inspired UI**: A masthead-style header, kicker labels, double-rule dividers, and serif typography — built with Nuxt 4, Vue 3, and Tailwind CSS 4 using locally maintained custom UI components (no `@nuxt/ui` dependency). Two themes: a soft "Classic Sakura" day theme (deep rose against cream washi, grounded by sage and warm bark brown) and a midnight-inverted dark theme (luminous teal and evening orchid against a midnight slate canvas).
- **Resilient Fallbacks**: A graceful UI fallback (`TrendingFallback`) when the `/api/news` fetch fails, plus an in-process in-memory store the app falls back to when Redis env vars are absent, so it still runs locally.

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom design tokens defined in `app/assets/css/tailwind.css`
- **Storage**: [Upstash Redis](https://upstash.com/) — the only datastore; `Lesson` records are written by the external agent and read by `GET /api/news` (falls back to an in-memory store when unconfigured)
- **Agent Integration**: Remote [MCP](https://modelcontextprotocol.io/) server (`mcp-handler`) at `/api/mcp`, called by an external Claude web agent
- **Validation**: [Zod](https://zod.dev/) — schema validation for `GET /api/news` query parameters
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
   # Upstash Redis (the lesson database GET /api/news reads from and the MCP server writes to)
   UPSTASH_REDIS_REST_URL="your_upstash_redis_rest_url_here"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token_here"

   # Remote MCP server (server/api/mcp.ts) — bearer token required to call it.
   # Generate with: openssl rand -hex 32
   MCP_AUTH_TOKEN="your_long_random_mcp_secret_here"
   ```

   > [!TIP]
   > Developers are encouraged to sign up for Upstash directly for development — its free tier is more than enough for local setup and testing. If the Redis env vars are omitted, the app falls back to an in-process in-memory store so it still runs locally — data just won't persist across restarts.

3. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

### 🔑 Environment Variables

See `.env.example` for reference. Configure these in your `.env` file:

| Variable                   | Required | Description                                                                                                       |
| :------------------------- | :------- | :---------------------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | **Yes**  | Upstash Redis REST URL — the lesson database `GET /api/news` reads from and the MCP server writes to.             |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes**  | Upstash Redis REST token.                                                                                         |
| `MCP_AUTH_TOKEN`           | **Yes**  | Bearer token required to call the remote MCP server at `/api/mcp` (`Authorization: Bearer <token>` or `?token=`). |

Server-side config is resolved through `server/utils/config.ts`'s `getEnvOrConfig()`, which prefers Nuxt `runtimeConfig` and falls back to `process.env`. There is currently no request rate limiting and no integration-test suite — all tests run against mocks.

### 🐞 UI Debugging & Testing

Append `?debug_error_ui=true` to any browser URL (e.g. `http://localhost:3000/news?debug_error_ui=true`) to display an interactive toolbar for simulating a failed `/api/news` fetch, so `TrendingFallback` can be exercised without a live failure. The `/docs/error-states` page renders the same degraded, empty, and failure states as a static catalogue.

## 📜 Available Commands

| Command              | Description                                               |
| :------------------- | :-------------------------------------------------------- |
| `pnpm dev`           | Start development server on localhost:3000                |
| `pnpm build`         | Create a production-ready build                           |
| `pnpm start`         | Run the production server locally                         |
| `pnpm generate`      | Static site generation (SSG)                              |
| `pnpm preview`       | Preview production build                                  |
| `pnpm test`          | Run tests in watch mode                                   |
| `pnpm test:run`      | Run tests once                                            |
| `pnpm test:coverage` | Run tests with coverage report                            |
| `pnpm lint`          | Lint and auto-fix code                                    |
| `pnpm format`        | Format code with Prettier                                 |
| `pnpm type-check`    | Perform TypeScript type checking                          |
| `pnpm check-qa`      | Run all QA checks (lint, format, type-check, build, test) |

## 🧪 Testing

NipponDaily uses two Vitest projects configured in `vitest.config.ts`:

- **Unit Tests**: Component/UI tests in a `happy-dom` environment (`test/unit`).
- **Server/API Tests**: API endpoint and service tests in a `node` environment (`test/server`), with `lessonsService` mocked directly since `GET /api/news` only ever reads from Redis.

```bash
pnpm test          # watch mode
pnpm test:run      # run once
pnpm test:coverage # coverage report
```

## 🤖 MCP Server

`server/api/mcp.ts` exposes a remote MCP server at `/api/mcp` (mounted via `mcp-handler`), protected by a constant-time bearer-token check against `MCP_AUTH_TOKEN` (`Authorization: Bearer <token>` header or `?token=` query param; a missing or wrong token gets a `401`). It's how an external Claude web agent — researching Japan news and authoring each article's Japanese lesson entirely outside this repo — writes finished `Lesson` records into the same Redis keys `GET /api/news` reads from.

Registered tools:

| Tool                   | Purpose                                                                                                                                                                                                                                                                                                                                      |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_recent_lessons`   | List existing lessons, newest article first (`id`, `title`, `url`, `source`, `publishedAt`, `difficultyLevel`).                                                                                                                                                                                                                              |
| `check_processed_urls` | Given candidate article URLs, return which are already ingested.                                                                                                                                                                                                                                                                             |
| `upsert_lesson`        | Create/update one lesson. Required: `title`, `url`, `publishedAt`, `difficultyLevel`. `favicon`/`source` are derived server-side; `credibilityScore` is cached per-domain; omitted mergeable fields (`titleJa`, `originalText`, `furiganaText`, `romajiText`, `vocabList`, `grammarNotes`) keep their stored value. Marks the URL processed. |
| `cleanup_old_data`     | Delete lessons whose article is older than 30 days; `{ dryRun: true }` previews without committing.                                                                                                                                                                                                                                          |
| `mark_ingest_complete` | Record the current time as the last-ingest timestamp shown to readers as "Updated N ago".                                                                                                                                                                                                                                                    |

See [app/pages/docs/architecture.vue](app/pages/docs/architecture.vue) for full tool schemas and diagrams, and [docs/news-pipeline-agent-prompt.md](docs/news-pipeline-agent-prompt.md) for the agent's operating prompt.

## 📚 Documentation

The running site ships in-app documentation at `/docs`:

- **System Architecture** (`/docs/architecture`) — a tour of the stack plus the MCP server's full tool schemas, with diagrams
- **Core Features** (`/docs/features`) — the reader-facing capabilities
- **Error & Fallback States** (`/docs/error-states`) — a live catalogue of every degraded, empty, or failure state the UI can render, shown with the real components and mock data

Repo-only docs:

- [`docs/news-pipeline-agent-prompt.md`](docs/news-pipeline-agent-prompt.md) — the operating prompt for the external weekly pipeline agent (discovery and lesson authoring). Keep it in sync with the MCP tool set.

## 🔌 API Endpoint

`GET /api/news` — the only endpoint the frontend calls directly. It reads, filters, sorts, and paginates whatever is already in Redis; it never fetches or generates content.

| Parameter    | Type                      | Description                                                                                           |
| :----------- | :------------------------ | :---------------------------------------------------------------------------------------------------- |
| `difficulty` | enum (`N5`–`N1`)          | JLPT difficulty filter — matches `difficultyLevel` exactly, case-insensitive; invalid values ignored. |
| `query`      | string (max 100)          | Free-text search across `title`, `titleJa`, and `originalText`.                                       |
| `limit`      | number (1–20, default 20) | Max lessons to return.                                                                                |

Lessons are always returned newest-article-first (`publishedAt` desc). Malformed query parameters are rejected with a `400` (see the Zod schema in `server/api/news.get.ts`).

**Response format:**

```json
{
  "success": true,
  "data": {
    "lessons": [
      /* full Lesson[] — id, title, titleJa?, source, url, favicon, publishedAt,
         addedAt, credibilityScore, difficultyLevel, originalText, furiganaText,
         romajiText, vocabList, grammarNotes */
    ],
    "lastIngestTime": 1718000000000
  },
  "count": 10,
  "timestamp": "2026-05-28T15:20:41Z"
}
```

## ⚠️ Limitations

- **Result size**: `GET /api/news` returns at most 20 lessons per request.
- **Dependencies**: A persistent deployment needs an Upstash Redis instance and an `MCP_AUTH_TOKEN` for the agent-facing pipeline; without them the site falls back to an empty in-memory store.
- **No rate limiting**: there is currently no request rate limiting on any endpoint.
- **Input validation**: `GET /api/news` rejects malformed query parameters with a `400`.

## 📄 License

Released under the [Apache-2.0 License](LICENSE.txt).
