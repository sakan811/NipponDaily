# NipponDaily

Japan news web application powered by Google Gemini AI. Fetches news from Japan on-demand and provides an AI-powered news summarization.

## Features

- **On-demand Japan News**: Fetches latest news from Japan using Gemini's Google Search when you click "Get News"
- **AI-Powered News Summarization**: Get AI-generated summaries of news articles instantly
- **News Categories**: Politics, Business, Technology, Culture, Sports
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Vue.js 3, Nuxt.js 4, TypeScript
- **Backend**: Nuxt Server API routes
- **AI**: Google Gemini API with Google Search
- **Styling**: Tailwind CSS

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
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`

## Usage

- Click "Get News" to fetch the latest Japan news organized by categories

## Build

```bash
pnpm build        # Production build
pnpm preview      # Preview production build
```

## Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key (required)