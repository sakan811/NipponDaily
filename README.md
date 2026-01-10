# NipponDaily

<p align="center">
  <img src="./public/android-chrome-512x512.png" alt="NipponDaily App Icon" width="256" height="256" style="max-width: 100%; height: auto;" />
</p>

**Your multilingual gateway to Japanese news.** Get AI-powered translations, smart categorization, and concise summaries of Japan-related news from across the web. Read stories that matter to you—in your language.

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)
[![CodeQL](https://github.com/sakan811/NipponDaily/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/github-code-scanning/codeql)

## Features

- **Multilingual News**: Read Japanese news in your preferred language with AI-powered translation
- **Smart Categorization**: News automatically organized into Politics, Business, Technology, Culture, Sports, and Other
- **On-Demand Updates**: Click "Get News" to fetch the latest articles when you want them
- **Customizable Results**: Choose how many articles to see (1-20) and filter by topic
- **Time Filters**: Browse news from today, this week, this month, this year, or all time
- **Clear Sources**: See exactly where each article comes from with direct links
- **Smart Summaries**: Get concise AI-generated summaries translated to your language
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

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

1. **Set Language**: Type your preferred language for translated content
2. **Choose Amount**: Select how many articles to fetch (1-20)
3. **Apply Filters**: Filter by time range and category
4. **Get News**: Click "Get News" to fetch targeted articles
5. **Read & Explore**: Browse summaries and click "Read Original" for full stories

---

## Development

### Tech Stack

- **Frontend**: Vue 3, Nuxt 4, TypeScript
- **APIs**: Tavily Search, Google Gemini AI
- **Styling**: Tailwind CSS v4, Nuxt UI
- **Testing**: Vitest
- **Code Quality**: ESLint, Prettier

### Color Palette

- Primary: `#d35944` (Dark Coral) - Main CTAs, active navigation
- Secondary: `#5d7275` (Cadet) - Secondary buttons
- Success: `#6b8f71` (Muted Green) - Success messages
- Info: `#5d7275` (Cadet) - Info alerts
- Warning: `#d9a574` (Warm Tan) - Warning messages
- Error: `#c44d56` (Muted Red) - Error messages
- Neutral: `#5d7275` (Cadet) - Text, borders, backgrounds
- Accent: `#fde6b0` (Peach) - Background highlights
- Text: `#1d2b36` (Yankees Blue) - Primary text

**Credibility Score Gradient** (Special Case):

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
