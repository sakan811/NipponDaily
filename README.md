# NipponDaily

<p align="center">
  <img src="./public/android-chrome-512x512.png" alt="NipponDaily App Icon" width="256" height="256" style="max-width: 100%; height: auto;" />
</p>

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

## Quick Start

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment**:

   ```bash
   cp .env.example .env
   ```

   Add API keys to `.env`:

   ```bash
   TAVILY_API_KEY=your_tavily_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   ```

   Visit <http://localhost:3000>

## Usage

1. **Set Language**: Type your preferred language for translated content (default: "English")
2. **Choose Amount**: Enter how many articles to fetch (1-20, default: 10)
3. **Select Time Range**: Choose from All Time, Today, This Week (default), This Month, This Year, or a Custom Date Range (affects search)
4. **Select Category**: Choose a category to filter results (affects both search and display)
5. **Get News**: Click "Get News" to fetch targeted articles
6. **Read & Explore**: Browse summaries with client-side pagination (3 items per page) and click "Read Original" for full stories

---

## Development

### Tech Stack

- **Frontend**: Vue 3, Nuxt 4, TypeScript
- **APIs**: Tavily Search, Google Gemini AI
- **Styling**: Tailwind CSS v4, Nuxt UI
- **Testing**: Vitest
- **Code Quality**: ESLint, Prettier

### Color Palette

The app uses Nuxt UI v4's semantic color system with Tailwind v4's native palette:

| Semantic Color | Tailwind Color | Usage                                          |
| -------------- | -------------- | ---------------------------------------------- |
| Primary        | `orange`       | Main CTAs, selected buttons                    |
| Secondary      | `sky`          | Secondary buttons, outline buttons, muted text |
| Success        | `amber`        | Success messages, sports category              |
| Info           | `sky`          | Info alerts, technology category               |
| Warning        | `amber`        | Warning messages, culture category             |
| Error          | `orange`       | Error messages, politics category              |
| Neutral        | `stone`        | Fallback category, disabled states             |

Color configuration is defined in `app/app.config.ts`:

```typescript
ui: {
  colors: {
    primary: "orange",
    secondary: "sky",
    success: "amber",
    info: "sky",
    warning: "amber",
    error: "orange",
    neutral: "stone",
  },
}
```

**Category Color Mappings**:

| Category   | Semantic Color | Tailwind Base |
| ---------- | -------------- | ------------- |
| Business   | Primary        | orange        |
| Technology | Info           | sky           |
| Sports     | Success        | amber         |
| Culture    | Warning        | amber         |
| Politics   | Error          | orange        |
| Other      | Neutral        | stone         |

> **Note**: Dark mode is supported via the UColorModeButton component (visible in the header and mobile menu), which leverages Nuxt UI's integration with `@nuxtjs/color-mode`. Color values are dynamically adjusted by Nuxt UI for dark mode.

**Credibility Score** (Multi-Factor Algorithm):

The credibility score is computed as a weighted average of four metrics:

- Source Reputation: 30%
- Domain Trust: 30%
- Content Quality: 20%
- AI Confidence: 20%

**Credibility Score Badge Color Gradient**:

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

### Limitations

- **Article Count**: 10 articles default, 20 maximum per request
- **Dependencies**: Requires both Tavily API and Google Gemini API keys
- **Categorization**: AI-based with fallback to "Other" category on failures

### Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm test:run         # Run tests once
pnpm test:coverage    # Run tests with coverage
pnpm check-qa         # Run all quality checks
```

### Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key (required)
- `TAVILY_API_KEY`: Tavily API key for news search (required)
- `GEMINI_MODEL`: Gemini model (defaults to gemini-2.5-flash)
