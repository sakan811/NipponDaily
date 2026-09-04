# NipponDaily

<p align="center">
  <img src="./public/light/android-chrome-512x512.png" width="256" height="256" alt="logo light" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/dark/android-chrome-512x512.png" width="256" height="256" alt="logo dark" />
</p>

**Your gateway to Japanese news.** NipponDaily is a Japan-focused news aggregator built with Nuxt 4, Vue 3, and TypeScript. The site itself only reads pre-computed story clusters out of Upstash Redis and serves them via `GET /api/news` — it doesn't fetch news or run any AI processing itself. All news discovery, clustering, and summarization is done by an external Claude web agent, which writes finished stories directly into Redis through this project's remote MCP server.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

- **Consolidated AI Briefing**: Synthesizes multiple news sources into a single, cohesive, high-level briefing with a primary headline and structured executive summary.
- **Connections & Root-Cause Analysis**: Each story mapped as a node in a web — the structural driver behind the event, the trend line it sits on, links to other tracked stories, and where domestic Japanese and international coverage diverge in emphasis.
- **Story Timeline Navigation**: Drill down from a trending topic summary card into a dedicated, oldest-first chronological timeline detailing the progression of articles within that topic.
- **Visual Trust Scoring**: Multi-level credibility assessments (overall and per-source), assigned by the Claude agent and rendered with HSL-color-gradient visuals.
- **Customizable Discovery & Span Filtering**: Fine-grained filtering by traditional category channels and precise date ranges (preset or custom), evaluating the actual publish timeline span of each story.
- **MCP-Driven Story Pipeline**: A Claude web agent researches Japan news on its own schedule and calls tools on this project's remote MCP server (`get_recent_stories`, `check_processed_urls`, `upsert_story`, `merge_stories`, `cleanup_old_data`, `mark_ingest_complete`) to read, write, merge, and prune story clusters directly in Redis.
- **Automated Data Retention**: The `cleanup_old_data` MCP tool permanently prunes stories older than 30 days from Redis so the store doesn't grow unbounded — run automatically as step 0 of every agent pipeline run, or ad hoc by asking the agent to run it manually.
- **Smart & Editorial UI**: Built with Nuxt 4, Vue 3, and Tailwind CSS 4, utilizing locally maintained custom UI components for a fast, responsive, and immersive editorial layout. Features a complementary color system: a soft, romantic Sakura day theme (pale pink blossoms against cream washi white, grounded by sage and warm bark brown) and a midnight-inverted dark theme (vibrant teal leaves and warm evening orchid accents against a midnight slate sky canvas).

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom design tokens
- **Storage**: [Upstash Redis](https://upstash.com/) — the only datastore; stories are written by the external agent and read by `GET /api/news`
- **Agent Integration**: Remote [MCP](https://modelcontextprotocol.io/) server (`mcp-handler`) at `/api/mcp`, called by an external Claude web agent
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

`.env.example` also lists `RATE_LIMIT_MAX_REQUESTS` and `TEST_SRH_URL`, but neither is currently read anywhere in the codebase — there is no rate limiter and no integration test suite at present.

### 🐞 UI Debugging & Testing

Append `?debug_error_ui=true` to any browser URL (e.g., `http://localhost:3000/news?debug_error_ui=true`) to display the interactive error testing and design toolbar for inspecting fallback components (`TrendingFallback` and `SummaryFallback`).

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

## ⚠️ Limitations

- **Date Range**: Custom date range search limited to 365 days, must be after 2000-01-01.
- **Result Size**: `GET /api/news` returns at most 20 stories per request.
- **Dependencies**: Requires an Upstash Redis instance and an `MCP_AUTH_TOKEN` for the agent-facing pipeline to function; without them the site falls back to an empty/in-memory store.
- **No rate limiting**: there is currently no request rate limiting on any endpoint.
