This file provides guidance to Agents when working with code in this repository.

## Project Overview

**NipponDaily** is a Japanese news aggregator built with Nuxt 4, Vue 3, and TypeScript. It fetches Japan-related news in English using the Tavily Search API, then processes articles with Google Gemini AI for executive briefings, cross-source synthesis, and credibility assessment.

## Common Commands

All scripts are defined in `package.json`:

```bash
# Development
pnpm dev              # Start dev server on http://localhost:3000
pnpm build            # Production build
pnpm start            # Run production server (localhost only)
pnpm generate         # Static site generation
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:coverage    # Run tests with coverage report

# Code Quality
pnpm lint             # Lint and auto-fix
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking
pnpm check-qa         # Run all QA checks (lint, format, type-check, build, test)
```

## Environment Setup

This project uses **Doppler** to manage and inject environment variables. Ensure you have the Doppler CLI installed and are logged in.

Run commands with Doppler:
```bash
doppler run -- pnpm dev
```

Required environment variables:
- `TAVILY_API_KEY` - Tavily Search API key for news discovery
- `GEMINI_API_KEY` - Google Gemini API key for AI processing
- `GEMINI_MODEL` - Gemini model to use (e.g. `gemini-2.5-flash`)
- `GEMINI_EMBEDDING_MODEL` - Gemini model for vector embeddings generation (e.g. `gemini-embedding-2`)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL for story database cache
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token for story database cache
- `UPSTASH_VECTOR_REST_URL` - Upstash Vector REST URL for story clustering
- `UPSTASH_VECTOR_REST_TOKEN` - Upstash Vector REST token for story clustering

Optional environment variables:
- `DEBUG_ERROR_UI` - Set to "true" to force display error components for UI testing

> [!TIP]
> Developers are highly encouraged to sign up and use the Upstash service directly for development. Upstash offers a generous free tier for both Redis and Vector databases, which is more than sufficient for local setup and testing.

## Architecture

### Directory Structure

```
app/                    # Nuxt app directory
├── app.config.ts      # Nuxt application config
├── app.vue            # Root component with NuxtLayout
├── assets/            # CSS and assets
│   └── css/
│       └── tailwind.css
├── components/        # Local custom Vue components (styled with Tailwind CSS v4)
│   ├── BriefingCard.vue     # Daily briefing summary card
│   ├── JapanNewsReader.vue  # Main news reader (state, fetching, filters)
│   ├── MermaidDiagram.vue   # Component for rendering diagrams
│   ├── JapanMap.vue         # Interactive map component (unused)
│   └── U*.vue               # Custom semantic UI components (UButton, UCard, UBadge, etc.)
├── pages/             # App pages
│   ├── index.vue      # Home page
│   ├── news.vue       # News reading page
│   └── docs/          # Documentation pages
│       ├── architecture.vue
│       ├── features.vue
│       └── index.vue
└── utils/             # Frontend utilities

server/                # Server-side code
├── api/
│   ├── cron/
│   │   └── fetch-news.get.ts # Cron endpoint to trigger background news ingest
│   └── news.get.ts   # GET /api/news endpoint (retrieves cache)
├── services/
│   ├── gemini.ts     # Gemini AI (briefing, synthesis, credibility)
│   ├── ingest.ts     # Ingest service (coordinates search & LLM processing)
│   ├── stories.ts    # Stories management service (Redis access wrapper)
│   ├── tavily.ts     # Tavily search service
│   └── vector.ts     # Vector database clustering management
└── utils/
    └── rate-limiter.ts  # Rate limiting utility (legacy/inactive)

types/                 # TypeScript definitions
├── index.ts           # NewsItem, NewsBriefing, ApiResponse types

constants/             # Project constants
├── categories.ts      # Category definitions

test/                  # Vitest tests
├── setup.ts           # Vitest global setup
├── server/            # Server/API tests
│   ├── api/          # API endpoint tests (organized by feature)
│   ├── gemini/       # Gemini service tests
│   └── tavily.test.ts
└── unit/              # Unit tests for components and utils
    ├── app.test.ts
    ├── BriefingCard.test.ts
    ├── JapanNewsReader/ # JapanNewsReader specific tests
    ├── pages/         # Page component tests
    └── types.test.ts
```
