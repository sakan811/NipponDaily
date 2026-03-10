# NipponDaily

<p align="center">
  <img src="./public/android-chrome-512x512.png" width="256" height="256" alt="logo" />
</p>

**Your multilingual gateway to Japanese news.** NipponDaily is a news aggregator that fetches Japan-related news, then processes articles with Google Gemini AI for categorization, translation, and credibility assessment. Read stories that matter to you—in your language.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

## 🚀 Features

- **Multilingual Search**: Fetch Japan-related news from the web via Tavily Search API.
- **AI Processing**: Use Google Gemini for:
  - **Categorization**: Group articles into relevant topics (Politics, Tech, Culture, etc.).
  - **Translation**: High-quality translations of article summaries and metadata.
  - **Credibility Assessment**: AI-driven evaluation of article reliability and domain trust.
- **Customizable Discovery**: Filter by date range, category, and preferred language.
- **Smart UI**: Built with Nuxt 4, Vue 3, and Tailwind CSS 4 for a fast, responsive experience.
- **Robust Security**: Rate limiting with Upstash Redis to manage API usage effectively.

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- **Search API**: [Tavily Search API](https://tavily.com/)
- **Data/Cache**: [Upstash Redis](https://upstash.com/) (for rate limiting)
- **Testing**: [Vitest](https://vitest.dev/), [Docker](https://www.docker.com/) (for integration tests)

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
   # Required: APIs
   GEMINI_API_KEY=your_gemini_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here

   # Required for production (Rate Limiting)
   UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

### 🔑 Environment Variables

See `.env.example` for reference. Configure these in your `.env` file:

| Variable                   | Required | Description                                             | Default            |
| :------------------------- | :------- | :------------------------------------------------------ | :----------------- |
| `GEMINI_API_KEY`           | **Yes**  | Google Gemini API key for AI processing.                | -                  |
| `TAVILY_API_KEY`           | **Yes**  | Tavily Search API key for news discovery.               | -                  |
| `GEMINI_MODEL`             | No       | Google Gemini model to use for processing.              | `gemini-2.5-flash` |
| `UPSTASH_REDIS_REST_URL`   | Yes\*    | Upstash Redis URL for rate limiting.                    | -                  |
| `UPSTASH_REDIS_REST_TOKEN` | Yes\*    | Upstash Redis token for rate limiting.                  | -                  |
| `RATE_LIMIT_MAX_REQUESTS`  | No       | Maximum API requests allowed per IP per day.            | `3`                |
| `DEBUG_ERROR_UI`           | No       | Set to `true` to force error UI components for testing. | `false`            |
| `TEST_SRH_URL`             | No       | URL for Serverless Redis HTTP in integration tests.     | See `.env.example` |

_\* Required for production and to enable rate limiting features._

## 📜 Available Commands

| Command                  | Description                                               |
| :----------------------- | :-------------------------------------------------------- |
| `pnpm dev`               | Start development server on localhost:3000                |
| `pnpm build`             | Create a production-ready build                           |
| `pnpm start`             | Run the production server locally                         |
| `pnpm generate`          | Static site generation (SSG)                              |
| `pnpm preview`           | Preview production build                                  |
| `pnpm test`              | Run tests in watch mode                                   |
| `pnpm test:run`          | Run tests once                                            |
| `pnpm test:coverage`     | Run tests with coverage report                            |
| `pnpm test:integration`  | Run integration tests (requires Docker)                   |
| `pnpm test:coverage:all` | Run all tests (unit + integration) with coverage          |
| `pnpm docker:up`         | Start SRH (Serverless Redis HTTP) services                |
| `pnpm docker:down`       | Stop SRH services                                         |
| `pnpm lint`              | Lint and auto-fix code                                    |
| `pnpm format`            | Format code with Prettier                                 |
| `pnpm type-check`        | Perform TypeScript type checking                          |
| `pnpm check-qa`          | Run all QA checks (lint, format, type-check, build, test) |

## 🧪 Testing

NipponDaily uses a tiered testing strategy:

- **Unit Tests**: Test individual components and utilities (`test/unit`).
- **Server Tests**: Verify API endpoints and server-side logic (`test/server`).
- **Integration Tests**: Test against a real Redis instance using [Serverless Redis HTTP (SRH)](https://github.com/hiett/serverless-redis-http) via Docker (`test/integration`).

To run integration tests locally:

```bash
# Start Docker services
pnpm docker:up

# Run integration tests
pnpm test:integration
```

## ⚠️ Limitations

- **Article Count**: 10 articles default, 20 maximum per request.
- **Rate Limiting**: Configurable via `RATE_LIMIT_MAX_REQUESTS` (default: 3 requests per day per IP).
- **Date Range**: Search results limited to 365 days, must be after 2000-01-01.
- **Dependencies**: Requires both Tavily API and Google Gemini API keys.
