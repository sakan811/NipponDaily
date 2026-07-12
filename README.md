# NipponDaily

<p align="center">
  <img src="./public/android-chrome-512x512.png" width="256" height="256" alt="logo" />
</p>

**Your gateway to Japanese news.** NipponDaily is an AI-powered news aggregator that fetches Japan-related news in English, then clusters articles and processes them with Google Gemini AI for executive briefings, cross-source synthesis, and credibility assessment.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)

- **Consolidated AI Briefing**: Synthesizes multiple news sources into a single, cohesive, high-level briefing with a primary headline and structured executive summary.
- **Cross-Source Thematic Analysis**: Dynamic analysis identifying relationships, consensus, or discrepancies between different publications.
- **Story Timeline Navigation**: Drill down from a trending topic summary card into a dedicated, oldest-first chronological timeline detailing the progression of articles within that topic.
- **Visual Trust Scoring**: Multi-level credibility assessments (overall and per-source) directly evaluated by Google Gemini AI with HSL-color-gradient visuals.
- **Customizable Discovery & Span Filtering**: Fine-grained filtering by traditional category channels and precise date ranges (preset or custom), analyzing the actual publish timeline span of each story.
- **Automated Background Ingestion**: Seamless news discovery and Gemini updates scheduled in the background to ensure instantaneous loading of curated topics.
- **Smart & Editorial UI**: Built with Nuxt 4, Vue 3, and Tailwind CSS 4 for an immersive, fast, responsive editorial layout with dark mode native.

## 🛠 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- **Search API**: [Tavily Search API](https://tavily.com/)
- **Storage/Cache**: [Upstash Redis](https://upstash.com/) & [Upstash Vector](https://upstash.com/) (for background ingestion cache and story vector databases)
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
   # Required: APIs & Database Cache
   GEMINI_API_KEY=your_gemini_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
   UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"
   UPSTASH_VECTOR_REST_URL="your_upstash_vector_url"
   UPSTASH_VECTOR_REST_TOKEN="your_upstash_vector_token"
   ```

   > [!TIP]
   > Developers are highly encouraged to sign up and use the Upstash service directly for development. Upstash offers a generous free tier for both Redis and Vector databases, which is more than sufficient for local setup and testing.

3. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

### 🔑 Environment Variables

See `.env.example` for reference. Configure these in your `.env` file:

| Variable                    | Required | Description                                             | Default              |
| :-------------------------- | :------- | :------------------------------------------------------ | :------------------- |
| `GEMINI_API_KEY`            | **Yes**  | Google Gemini API key for AI processing.                | -                    |
| `TAVILY_API_KEY`            | **Yes**  | Tavily Search API key for news discovery.               | -                    |
| `GEMINI_MODEL`              | No       | Google Gemini model for text briefing generation.       | `gemini-2.5-flash`   |
| `GEMINI_EMBEDDING_MODEL`    | No       | Google Gemini model for vector embeddings generation.   | `gemini-embedding-2` |
| `UPSTASH_REDIS_REST_URL`    | **Yes**  | Upstash Redis REST URL for story database cache.        | -                    |
| `UPSTASH_REDIS_REST_TOKEN`  | **Yes**  | Upstash Redis REST token for story database cache.      | -                    |
| `UPSTASH_VECTOR_REST_URL`   | **Yes**  | Upstash Vector REST URL for story clustering.           | -                    |
| `UPSTASH_VECTOR_REST_TOKEN` | **Yes**  | Upstash Vector REST token for story clustering.         | -                    |
| `DEBUG_ERROR_UI`            | No       | Set to `true` to force error UI components for testing. | `false`              |

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

NipponDaily uses a clean testing setup:

- **Unit Tests**: Test individual components and utilities (`test/unit`).
- **Server/API Tests**: Verify API endpoints and server-side logic (`test/server`).

To run the test suite:

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run coverage report
pnpm test:coverage
```

## ⚠️ Limitations

- **Article Count**: 20 maximum per ingestion task.
- **Date Range**: Search results limited to 365 days, must be after 2000-01-01.
- **Dependencies**: Requires Tavily API, Google Gemini API, Upstash Redis, and Upstash Vector keys.
