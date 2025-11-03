# NipponDaily

A Japan news web application that fetches news using Tavily and categorizes it with Google Gemini AI.

## Features

- **Real-time News**: Fetch latest Japanese news from reputable sources (NHK, Japan Times, Nikkei, etc.)
- **AI-Powered Categorization**: Automatically categorize news into Politics, Business, Technology, Culture, Sports
- **Clean Interface**: Responsive, mobile-friendly design with Japanese-themed styling

## Tech Stack

- **Frontend**: Vue 3, Nuxt 4, TypeScript
- **News Search**: Tavily API
- **AI Categorization**: Google Gemini API
- **Styling**: Tailwind CSS
- **Testing**: Vitest

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

1. Click "Get News" to fetch latest Japanese news
2. Use category buttons to filter by topic
3. Click "Read Original" to visit full articles

## Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm test:run         # Run tests
```

## Environment Variables

- `TAVILY_API_KEY`: Tavily API key for news search (required)
- `GEMINI_API_KEY`: Google Gemini API key for categorization (required)
- `GEMINI_MODEL`: Gemini model (optional, defaults to gemini-2.5-flash)
