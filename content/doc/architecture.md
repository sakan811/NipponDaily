# Architecture

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
│   │   └── setup.ts  # API test shared setup
│   ├── gemini/       # Gemini service tests (by topic)
│   ├── tavily.test.ts # Tavily service tests
│   └── rate-limiter.test.ts # Rate limiter unit tests
├── unit/              # Component/unit tests
│   ├── JapanNewsReader/  # Component tests (by topic)
│   │   └── setup.ts  # JapanNewsReader test shared setup
│   ├── NewsCard.test.ts
│   ├── types.test.ts  # TypeScript type tests
│   └── app.test.ts    # App component tests
└── setup.ts           # Test setup (custom matchers, mocks)

vitest.config.ts              # Unit test config (happy-dom + node)
vitest.integration.config.ts  # Integration test config (SRH, from vitest.integration.config.ts:1-51)
nuxt.config.ts               # Nuxt configuration (nuxt.config.ts:1-36)
```
