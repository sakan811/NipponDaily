# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**Your gateway to Japanese news.** NipponDaily is a Japan-focused news aggregator built with Nuxt 4, Vue 3, and TypeScript. The site itself only reads pre-computed story clusters out of Upstash Redis and serves them via `GET /api/news` — it doesn't fetch news or run any AI processing itself. All news discovery, clustering, and summarization is done by an external Claude web agent, which writes finished stories directly into Redis through this project's remote MCP server.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

- **Consolidated AI Briefing**: Synthesizes multiple news sources into a single, cohesive, high-level briefing with a primary headline and a structured executive summary.
- **Cross-Source Analysis**: Every story carries a thematic breakdown of how its sources cover the same event — shared framing and where the accounts diverge — rendered alongside the executive summary.
- **Story Timeline Navigation**: Drill down from a trending topic on the front page into a dedicated, oldest-first chronological timeline of every source article in that cluster.
- **Visual Trust Scoring**: Credibility assessments at both the overall and per-source level, assigned by the Claude agent and rendered with an HSL color gradient (red → green).
- **Trend Detection**: Stories are ranked and badged by how many of their sources landed in the last two weeks, surfacing what is actively developing.
- **Customizable Discovery & Span Filtering**: Filter by category channel and by date — preset windows (today, this week, all time) or a custom range — matched against each story's actual publish span rather than a single timestamp.
- **MCP-Driven Story Pipeline**: A Claude web agent researches Japan news on its own schedule and calls tools on this project's remote MCP server (`get_recent_stories`, `check_processed_urls`, `upsert_story`, `merge_stories`, `cleanup_old_data`, `mark_ingest_complete`) to read, write, merge, and prune story clusters directly in Redis.
- **Automated Data Retention**: The `cleanup_old_data` MCP tool permanently prunes stories older than 30 days from Redis so the store doesn't grow unbounded — run automatically as step 0 of every agent pipeline run, or ad hoc by asking the agent to run it manually.
- **Editorial, Newspaper-Inspired UI**: A masthead-style header (dateline + tagline), front-page layout with a lead story and column-grid secondary stories, kicker labels, double-rule dividers, and a drop-cap lede on the executive briefing — built with Nuxt 4, Vue 3, and Tailwind CSS 4 using locally maintained custom UI components. Complements a color system with two themes: a soft, romantic Sakura day theme (pale pink blossoms against cream washi white, grounded by sage and warm bark brown) and a midnight-inverted dark theme (vibrant teal leaves and warm evening orchid accents against a midnight slate sky canvas).

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom design tokens
- **Storage**: [Upstash Redis](https://upstash.com/) — the only datastore; stories are written by the external agent and read by `GET /api/news`
- **Agent Integration**: Remote [MCP](https://modelcontextprotocol.io/) server (`mcp-handler`) at `/api/mcp`, called by an external Claude web agent
- **Validation**: [Zod](https://zod.dev/) — schema validation for `GET /api/news` query parameters
- **Markdown**: [marked](https://marked.js.org/) — renders the agent-written summaries and analysis
- **Testing**: [Vitest](https://vitest.dev/)

## 📋 Quick Setup

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
    # Required: Upstash Redis (story database read by GET /api/news)
    UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
    UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"

    # Required: bearer token for the remote MCP server (server/api/mcp.ts)
    # Generate with: openssl rand -hex 32
    MCP_AUTH_TOKEN="your_long_random_mcp_secret_here"
   ```

   > [!TIP]
   > Developers are highly encouraged to sign up and use the Upstash service directly for development. Upstash offers a generous free tier for Redis, which is more than sufficient for local setup and testing. If Redis env vars are omitted, the app falls back to an in-process in-memory store so it still runs locally — data just won't persist across restarts.

3. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

### 🔑 Environment Variables

See `.env.example` for reference. Configure these in your `.env` file:

| Variable                   | Required | Description                                                                                                       | Default |
| :------------------------- | :------- | :---------------------------------------------------------------------------------------------------------------- | :------ |
| `UPSTASH_REDIS_REST_URL`   | **Yes**  | Upstash Redis REST URL — the story database `GET /api/news` reads from and the MCP server writes to.              | -       |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes**  | Upstash Redis REST token.                                                                                         | -       |
| `MCP_AUTH_TOKEN`           | **Yes**  | Bearer token required to call the remote MCP server at `/api/mcp` (`Authorization: Bearer <token>` or `?token=`). | -       |

There is currently no request rate limiting and no integration test suite — all tests run against mocks.

### 🐞 UI Debugging & Testing

Append `?debug_error_ui=true` to any browser URL (e.g., `http://localhost:3000/news?debug_error_ui=true`) to display the interactive toolbar for simulating failure states — failed trending fetch, failed summarization, and the AI-fallback briefing card — so `TrendingFallback` and `SummaryFallback` can be inspected without a live outage. The `/docs/error-states` page renders the same states as a static catalogue.

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

NipponDaily uses a clean testing setup with two Vitest projects:

- **Unit Tests**: Component/UI tests in a `happy-dom` environment (`test/unit`).
- **Server/API Tests**: API endpoint and service tests in a `node` environment (`test/server`), with `storiesService` mocked directly since `GET /api/news` only ever reads from Redis.

To run the test suite:

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run coverage report
pnpm test:coverage
```

## 🤖 MCP Server

`server/api/mcp.ts` exposes a remote MCP server at `/api/mcp`, protected by a constant-time bearer-token check against `MCP_AUTH_TOKEN`. It's how an external Claude web agent — researching Japan news entirely outside this repo — writes finished story clusters into the same Redis keys `GET /api/news` reads from. Registered tools: `get_recent_stories`, `check_processed_urls`, `upsert_story`, `merge_stories`, `cleanup_old_data`, and `mark_ingest_complete`. See [app/pages/docs/architecture.vue](app/pages/docs/architecture.vue) for full tool schemas and diagrams.

## 📚 Documentation

The running site ships in-app documentation at `/docs`:

- **System Architecture** (`/docs/architecture`) — a tour of the stack plus the MCP server's full tool schemas, with diagrams
- **Core Features** (`/docs/features`) — the reader-facing capabilities
- **Error & Fallback States** (`/docs/error-states`) — a live catalogue of every degraded, empty, or failure state the UI can render, shown with the real components and mock data

## ⚠️ Limitations

- **Date Range**: Custom date range search limited to 365 days, must be after 2000-01-01.
- **Result Size**: `GET /api/news` returns at most 20 stories per request.
- **Dependencies**: Requires an Upstash Redis instance and an `MCP_AUTH_TOKEN` for the agent-facing pipeline to function; without them the site falls back to an empty/in-memory store.
- **No rate limiting**: there is currently no request rate limiting on any endpoint.
- **Input validation**: `GET /api/news` rejects malformed query parameters with a `400` (see the Zod schema in `server/api/news.get.ts`).

## 📄 License

Released under the [Apache-2.0 License](LICENSE.txt).
