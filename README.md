# NipponDaily

![NipponDaily App Icon](./public/android-chrome-512x512.png)

**Your multilingual gateway to Japanese news.** Get AI-powered translations, smart categorization, and concise summaries of Japan-related news from across the web. Read stories that matter to you—in your language.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)
[![CodeQL](https://github.com/sakan811/NipponDaily/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/github-code-scanning/codeql)

## Features

- **Multilingual News**: Read Japanese news in your preferred language with AI-powered translation
- **Smart Categorization**: News automatically organized into Politics, Business, Technology, Culture, or Sports (with "Other" as fallback)
- **On-Demand Updates**: Click "Get News" to fetch the latest articles when you want them
- **Customizable Results**: Choose how many articles to see (1-20) and filter by category
- **Time Filters**: Browse news from All Time, Today, This Week, This Month, This Year, or a Custom Date Range
- **Clear Sources**: See exactly where each article comes from with direct links
- **Credibility Scores**: Multi-factor credibility assessment (source reputation, domain trust, content quality, AI confidence)
- **Smart Summaries**: Get concise AI-generated summaries translated to your language
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes via the color mode button

## Usage

1. **Set Language**: Type your preferred language for translated content (default: "English")
2. **Choose Amount**: Enter how many articles to fetch (1-20, default: 10)
3. **Select Time Range**: Choose from All Time, Today, This Week (default), This Month, This Year, or a Custom Date Range (affects search)
4. **Select Category**: Choose a category to filter results (affects both search and display)
5. **Get News**: Click "Get News" to fetch targeted articles
6. **Read & Explore**: Browse summaries with client-side pagination (3 items per page) and click "Read Original" for full stories

---

## Development

### Quick Start

1. **Install dependencies** (from `package.json:5-24`):

   ```bash
   pnpm install
   ```

2. **Set up environment** (see `.env.example`):

   ```bash
   cp .env.example .env
   ```

   Add API keys to `.env`:

   ```bash
   TAVILY_API_KEY=your_tavily_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   RATE_LIMIT_MAX_REQUESTS=3
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

### Tech Stack

- **Frontend**: Vue 3, Nuxt 4, TypeScript (from `package.json:25-34`)
- **APIs**: Tavily Search (`@tavily/core`), Google Gemini AI (`@google/genai`)
- **Styling**: Tailwind CSS v4, Nuxt UI v4 (from `package.json:27,32`)
- **Testing**: Vitest with happy-dom and node environments (from `vitest.config.ts:6-59`)
- **Code Quality**: ESLint, Prettier, TypeScript (from `package.json:43-44,54-55`)

### Development Commands

All scripts are defined in `package.json:5-24`:

```bash
# Development
pnpm dev              # Start development server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Run production server (localhost only, from package.json:8)

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:coverage    # Run tests with coverage report
pnpm test:integration # Run integration tests with SRH Docker (from package.json:15)
pnpm test:integration:coverage # Run integration tests with coverage (from package.json:16)
pnpm test:coverage:all    # Run all tests (unit + integration) with coverage (from package.json:17)

# Docker for integration tests
pnpm docker:up        # Start SRH services (from package.json:18)
pnpm docker:down      # Stop SRH services (from package.json:19)

# Code Quality
pnpm lint             # Lint and auto-fix
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking
pnpm check-qa         # Run all QA checks (lint, format, type-check, build, test, from package.json:23)
```

### Color Palette

The app uses Nuxt UI v4's semantic color system with Tailwind v4's native palette (from `app/app.config.ts:3-12`):

| Semantic Color | Tailwind Color | Usage                                          |
| -------------- | -------------- | ---------------------------------------------- |
| Primary        | `orange`       | Main CTAs, selected buttons                    |
| Secondary      | `sky`          | Secondary buttons, outline buttons, muted text |
| Success        | `amber`        | Success messages, sports category              |
| Info           | `sky`          | Info alerts, technology category               |
| Warning        | `amber`        | Warning messages, culture category             |
| Error          | `orange`       | Error messages, politics category              |
| Neutral        | `stone`        | Fallback category, disabled states             |

**Category Color Mappings** (from `app/components/NewsCard.vue:185-204`):

| Category   | Semantic Color | Tailwind Base |
| ---------- | -------------- | ------------- |
| Politics   | Error          | orange        |
| Business   | Primary        | orange        |
| Technology | Info           | sky           |
| Culture    | Warning        | amber         |
| Sports     | Success        | amber         |
| Other      | Neutral        | stone         |

> **Note**: Dark mode is supported via the UColorModeButton component (visible in the header and mobile menu at `app/components/JapanNewsReader.vue:14,61`), which leverages Nuxt UI's built-in color mode support. Color values are dynamically adjusted by Nuxt UI for dark mode.

**Credibility Score** (Multi-Factor Algorithm from `server/services/gemini.ts:171-175`):

The credibility score is computed as a weighted average of four metrics:

- Source Reputation: 30%
- Domain Trust: 30%
- Content Quality: 20%
- AI Confidence: 20%

**Credibility Score Badge Color Gradient** (from `app/components/NewsCard.vue:229-233`):

- 100%: `hsl(120, 70%, 45%)` - Green
- 75%: `hsl(90, 70%, 45%)` - Yellow-Green
- 50%: `hsl(60, 70%, 45%)` - Yellow
- 25%: `hsl(30, 70%, 45%)` - Orange-Red
- 0%: `hsl(0, 70%, 45%)` - Red

The credibility score uses a dynamic gradient computed as `hue = score × 120` (score 0-1).

### Architecture

- **Client**: Vue.js/Nuxt.js application handling UI and user interactions
- **Server**: Nuxt API routes managing Tavily search and Gemini AI integration
- **Services**: Modular services for external API communication

**Directory Structure**:

```text
app/                    # Nuxt app directory
├── app.config.ts      # Nuxt UI v4 color configuration (app/app.config.ts:3-12)
├── app.vue            # Root component
├── components/        # Vue components
│   ├── JapanNewsReader.vue  # Main news reader (state, filters, pagination)
│   └── NewsCard.vue         # Individual news item display
├── layouts/
│   └── default.vue    # Default layout
└── assets/css/
    └── tailwind.css   # Tailwind v4 CSS

server/                # Server-side code
├── api/
│   └── news.get.ts   # GET /api/news endpoint (rate limiting, Zod validation)
├── services/
│   ├── gemini.ts     # Gemini AI service (categorization, translation, credibility)
│   └── tavily.ts     # Tavily search service
└── utils/
    └── rate-limiter.ts  # Rate limiting (Upstash Redis sorted set sliding window)

types/                 # TypeScript definitions
└── index.ts          # NewsItem, CredibilityMetadata, ApiResponse (types/index.ts:1-29)

constants/             # Category constants
└── categories.ts     # NEWS_CATEGORIES, VALID_CATEGORIES (constants/categories.ts:1-21)

test/                  # Vitest tests
├── integration/       # Integration tests with SRH
│   └── rate-limiter.test.ts
├── server/            # Server/API tests
│   ├── api/          # API endpoint tests (by topic)
│   ├── gemini/       # Gemini service tests (by topic)
│   ├── tavily.test.ts # Tavily service tests
│   └── rate-limiter.test.ts # Rate limiter unit tests
└── unit/              # Component/unit tests
    ├── JapanNewsReader/  # Component tests (by topic)
    ├── NewsCard.test.ts
    ├── types.test.ts  # TypeScript type tests
    └── app.test.ts    # App component tests

vitest.config.ts              # Unit test config (happy-dom + node)
vitest.integration.config.ts  # Integration test config (SRH, from vitest.integration.config.ts:1-51)
nuxt.config.ts               # Nuxt configuration (nuxt.config.ts:1-36)
```

### Limitations

- **Article Count**: 10 articles default, 20 maximum per request (from `server/api/news.get.ts:62-71`)
- **Rate Limiting**: 3 requests per day per IP (configurable via `RATE_LIMIT_MAX_REQUESTS`, from `server/utils/rate-limiter.ts:32-37`)
- **Dependencies**: Requires both Tavily API and Google Gemini API keys (from `nuxt.config.ts:24-27`)
- **Redis Required**: Rate limiting requires Upstash Redis to be configured (returns HTTP 500 if unavailable, from `server/api/news.get.ts:174-184`)
- **Categorization**: AI-based with fallback to "Other" category on failures (from `constants/categories.ts:10-17`)
- **Date Range**: Custom date range limited to 365 days maximum, must be after 2000-01-01 (from `server/api/news.get.ts:86-135`)

### Environment Variables

See `.env.example` for reference. Runtime config is defined in `nuxt.config.ts:24-34`:

- `GEMINI_API_KEY`: Google Gemini API key (required)
- `TAVILY_API_KEY`: Tavily API key for news search (required)
- `GEMINI_MODEL`: Gemini model (optional, defaults to `gemini-2.5-flash`, from `server/services/gemini.ts:20-22`)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per day (optional, default: 3, from `server/utils/rate-limiter.ts:32-37`)
- `UPSTASH_REDIS_REST_URL`: Upstash Redis URL for rate limiting (required for production)
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis token for rate limiting (required for production)
- `SRH_URL`: Serverless Redis HTTP URL for integration tests (optional, from `.env.example:16-17`)
