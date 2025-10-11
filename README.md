# NipponDaily

A clean, simple Japan news web application powered by Google Gemini AI. Fetches news from Japan on-demand using Google Search and displays it in an organized, reader-friendly interface.

## Features

- **On-demand News Fetching**: Click "Get News" to fetch the latest Japanese news using Gemini's Google Search
- **Category Filtering**: Browse news by Politics, Business, Technology, Culture, and Sports
- **Reputable Sources**: News from established Japanese outlets like NHK, Japan Times, Nikkei, and others
- **Clean Interface**: Simple, focused news reading experience without distractions
- **Responsive Design**: Mobile-friendly interface with Japanese-themed styling

## Tech Stack

- **Frontend**: Vue.js 3, Nuxt.js 4, TypeScript
- **Backend**: Nuxt Server API routes
- **AI Integration**: Google Gemini API with Google Search capabilities
- **Styling**: Tailwind CSS with custom Japanese-themed design system
- **Testing**: Vitest with Vue Test Utils
- **Package Manager**: pnpm

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key to `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`

## Usage

1. Open the application in your browser
2. Click the "Get News" button to fetch the latest Japanese news
3. Use category buttons to filter news by topic (All News, Politics, Business, Technology, Culture, Sports)
4. Click "Read Original" to visit the full article on the source website

## Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm generate         # Generate static site
pnpm test             # Run tests in watch mode
pnpm test:run         # Run all tests once
pnpm test:coverage    # Run tests with coverage report
```

## Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key (required)
- `GEMINI_MODEL`: Gemini model to use (optional, defaults to gemini-1.5-flash)