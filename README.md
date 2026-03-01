# NipponDaily

<p align="center">
  <img src="./public/android-chrome-512x512.png" width="256" height="256" alt="logo" />
</p>

**Your multilingual gateway to Japanese news.** Get AI-powered translations, smart categorization, and concise summaries of Japan-related news from across the web. Read stories that matter to you—in your language.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)
[![CodeQL](https://github.com/sakan811/NipponDaily/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/github-code-scanning/codeql)

## Quick Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment**:

   ```bash
   cp .env.example .env
   ```

   Configure environment variables in `.env`:

   ```bash
   # Required: Gemini AI for categorization/translation
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: Gemini model (default: gemini-2.5-flash)
   GEMINI_MODEL=gemini-2.5-flash

   # Required: Tavily Search API for news discovery
   TAVILY_API_KEY=your_tavily_api_key_here

   # Optional: Rate limit requests per day (default: 3)
   RATE_LIMIT_MAX_REQUESTS=3

   # Required for production: Upstash Redis for rate limiting
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

   # Optional: Serverless Redis HTTP URL for integration tests
   TEST_SRH_URL="http://nippondaily-serverless-redis-http-1:80"
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

## Limitations

- **Article Count**: 10 articles default, 20 maximum per request
- **Rate Limiting**: 3 requests per day per IP (configurable via `RATE_LIMIT_MAX_REQUESTS`)
- **Dependencies**: Requires both Tavily API and Google Gemini API keys
- **Redis Required**: Rate limiting requires Upstash Redis to be configured
- **Categorization**: AI-based with fallback to "Other" category on failures
- **Date Range**: Custom date range limited to 365 days maximum, must be after 2000-01-01

## Environment Variables

See `.env.example` for reference. Runtime config is defined in `nuxt.config.ts`:

- `GEMINI_API_KEY`: Google Gemini API key (required)
- `TAVILY_API_KEY`: Tavily API key for news search (required)
- `GEMINI_MODEL`: Gemini model (optional, defaults to `gemini-2.5-flash`)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per day (optional, default: 3)
- `UPSTASH_REDIS_REST_URL`: Upstash Redis URL for rate limiting (required for production)
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis token for rate limiting (required for production)
- `TEST_SRH_URL`: Serverless Redis HTTP URL for integration tests (optional)
