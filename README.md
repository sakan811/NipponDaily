# NipponDaily

<p align="center">
  <img src="./public/android-chrome-512x512.png" alt="NipponDaily App Icon" width="256" height="256" style="max-width: 100%; height: auto;" />
</p>

**What**: A multilingual Japan news web application that provides web-based access to Japan-related news articles with AI-powered categorization, intelligent summaries, and real-time translation. The app searches the web for recent news mentioning Japan and processes it through AI for better organization, readability, and language accessibility.

**Why**: Traditional news consumption can be overwhelming with endless scrolling, irrelevant content, and language barriers. NipponDaily solves this by using AI to intelligently organize news into clear categories, generate summaries, and translate content into users' preferred languages, helping diverse audiences quickly find and understand the stories that matter most to them across Politics, Business, Technology, Culture, and Sports.

**How**: The app fetches news using the Tavily API with basic search depth, categorizes articles with Google Gemini AI using structured output, translates titles and generates summaries in the user's target language, and presents them in a clean, responsive interface. Users can specify their preferred language, load news on-demand, filter by category and time range, read translated summaries, and click through to original articles when they want more detail.

## Status

[![Web App Test](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/webpage-test.yml)
[![CodeQL](https://github.com/sakan811/NipponDaily/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/sakan811/NipponDaily/actions/workflows/github-code-scanning/codeql)

## Features

- **Multilingual Support**: Specify your preferred language and get AI-translated news titles and summaries in your target language
- **Web-based News Search**: Basic web search for recent Japan-related news from across the web with intelligent source recognition
- **AI-Powered Categorization**: Automatically categorize news into Politics, Business, Technology, Culture, Sports, and Other using structured AI output
- **AI Translation & Summaries**: Get concise, AI-generated and translated summaries of news articles in your preferred language using Google Gemini
- **Structured Output Processing**: Leverages Google Gemini's structured output for reliable, consistent categorization and translation results
- **On-Demand Loading**: Click "Get News" to fetch the latest articles when you want them, no auto-refresh interruptions
- **Category Filtering**: Filter news by topic with interactive category buttons (All News, Politics, Business, Technology, Culture, Sports)
- **Time Range Selection**: Filter news by recency with options for All Time, Today, This Week, This Month, This Year
- **Domain Extraction**: Clean source attribution with automatic domain extraction from URLs (e.g., https://www.bbc.com from full article URLs)
- **Source Attribution**: See the original source domain for each article with direct URL links
- **Publication Times**: View when articles were published with smart date formatting
- **Sorted by Recency**: News automatically sorted to show latest articles first
- **Error Handling**: Built-in error handling with manual retry option if news fetching fails
- **Loading States**: Smooth loading animations and skeleton UI while fetching content
- **Responsive Design**: Clean interface with Japanese-themed styling and Tailwind CSS
- **Accessibility**: Full keyboard navigation, focus indicators, and reduced motion support
- **Comprehensive Testing**: Full test suite with unit tests, server tests, and coverage reporting (99.44% coverage)

## Design System

**Color Palette**:

- **Dark Coral** (`#D35944`): Primary accent color for interactive elements, buttons, borders, and active states
- **Peach** (`#FDE6B0`): Primary background color for surfaces, headers, and card components
- **Cadet** (`#5D7275`): Secondary color for muted text, supporting content, and subtle accents
- **Yankees Blue** (`#1D2B36`): Primary text color and main application background

## Tech Stack

- **Frontend**: Vue 3, Nuxt 4, TypeScript
- **News Search**: Tavily API (basic search depth)
- **AI Categorization & Translation**: Google Gemini API with structured output (gemini-2.5-flash)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Testing**: Vitest with happy-dom and v8 coverage (99.44% coverage)
- **Code Quality**: ESLint, Prettier, TypeScript

## Limitations & Dependencies

### Article Limits

- **Default**: 20 articles per request
- **Maximum**: No hard limit (configurable via limit parameter)
- **No pagination**: Articles are displayed on a single page

### Dependencies

- **Required**: Both Tavily API and Google Gemini API must be configured
- **Tavily API**: For basic web search and content extraction (markdown format)
- **Gemini API**: For AI categorization, title translation, and summary generation with structured JSON responses
- **Language Support**: User-specified target language for AI translation and summarization
- **Degradation**: If Gemini fails, articles are categorized as "Other" with basic summaries from raw content

### Categorization

- **AI-based**: Categories are generated by Google Gemini AI
- **Fallback**: Articles may be categorized as "Other" if AI classification fails
- **Sources**: Searches across the web, not limited to specific news outlets

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

   Visit `http://localhost:3000`

## Usage

1. **Set Language**: Type your preferred language in the language input field (default: "English") for translated titles and summaries
2. **Fetch News**: Select your preferred time range and category, then click "Get News" to fetch targeted Japanese news with AI-translated summaries
3. **Time Filtering**: Use time range buttons to control search recency (All Time, Today, This Week, etc.)
4. **Category Filtering**: Use category buttons to search specific topics (Politics, Business, Technology, Culture, Sports)
   - _Note: Time range and category filters affect the actual news search, not just display_
5. **Read Translated Content**: View AI-translated titles and summaries in your specified language for quick understanding
6. **Source Attribution**: See clean domain names (e.g., https://www.bbc.com) for each article with direct links
7. **Chronological Display**: News is automatically displayed with the most recent articles first
8. **Read Full Articles**: Click "Read Original" to visit complete articles on their source websites

## Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server (localhost)
pnpm generate         # Generate static site
pnpm preview          # Preview production build
pnpm test             # Run tests in watch mode
pnpm test:run         # Run all tests once
pnpm test:coverage    # Run tests with coverage report
pnpm lint             # Run ESLint with auto-fix
pnpm format           # Format code with Prettier
pnpm type-check       # Run TypeScript type checking
pnpm check-qa         # Run all QA checks (lint, format, type-check, build)
```

## Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key for categorization (required)
- `TAVILY_API_KEY`: Tavily API key for news search (required)
- `GEMINI_MODEL`: Gemini model (optional, defaults to gemini-2.5-flash)
