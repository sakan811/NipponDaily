# Japan News Chatbot

A sophisticated Japan news chatbot powered by Google Gemini AI, built with Nuxt.js. This application fetches daily news from Japan using Google Search and provides an AI-powered chat interface for news Q&A.

## Features

- **Daily Japan News Fetching**: Automatically fetches latest news from Japan using Gemini's Google Search capabilities
- **AI-Powered Chat**: Interactive chat interface to ask questions about news articles
- **News Categorization**: Organizes news by Politics, Business, Technology, Culture, and Sports
- **AI Summaries**: Get AI-generated summaries of news articles
- **Real-time Updates**: Refresh news with a single click
- **Responsive Design**: Beautiful, mobile-friendly interface

## Technology Stack

- **Frontend**: Vue.js 3, Nuxt.js 4, TypeScript
- **Backend**: Nuxt Server API routes
- **AI**: Google Gemini API with Google Search tools
- **Styling**: Tailwind CSS (via UnoCSS)

## Setup

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

### Development Server

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## How It Works

### News Fetching
The application uses Gemini's Google Search capabilities to:
- Search for latest news from Japan
- Categorize articles by topic (Politics, Business, Technology, Culture, Sports)
- Generate summaries and extract key information
- Format the data for display

### Chat Interface
The chat system:
- Uses the fetched news as context for AI conversations
- Allows users to ask questions about specific articles or general topics
- Provides intelligent responses based on the news data
- Cites sources when referencing specific articles

### API Endpoints

- `GET /api/news` - Fetch news with optional category filtering
- `POST /api/chat` - Send chat messages for AI responses
- `POST /api/summarize` - Get AI summaries of specific articles

## Usage

1. **View News**: Browse the latest news from Japan organized by categories
2. **Read Articles**: Click "Read More" to expand full article content
3. **Ask Questions**: Use the chat interface to ask about news topics
4. **Get Summaries**: Click "AI Summary" for concise article summaries
5. **Chat with News**: Click "Ask about this" to discuss specific articles

## Project Structure

```
japan-news-chatbot/
├── app/
│   ├── components/
│   │   ├── JapanNewsChatbot.vue     # Main app component
│   │   ├── NewsCard.vue             # Individual news article card
│   │   └── ChatInterface.vue        # Chat interface component
│   └── app.vue                      # Root component
├── server/
│   ├── api/
│   │   ├── news.get.ts              # News fetching endpoint
│   │   ├── chat.post.ts             # Chat endpoint
│   │   └── summarize.post.ts        # Summary endpoint
│   └── services/
│       └── gemini.ts                # Gemini AI service
├── types/
│   └── index.ts                     # TypeScript type definitions
├── .env.example                     # Environment variables template
├── nuxt.config.ts                   # Nuxt configuration
└── package.json                     # Dependencies and scripts
```

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)

## Building for Production

Build the application for production:
```bash
pnpm build
```

Preview production build:
```bash
pnpm preview
```

## Contributing

1. Make your changes
2. Test thoroughly
3. Ensure the application builds without errors
4. Submit a pull request

## License

This project is for educational and demonstration purposes.

## Troubleshooting

- **API Key Issues**: Ensure your Gemini API key is valid and has the necessary permissions
- **News Not Loading**: Check your internet connection and API key configuration
- **Chat Not Working**: Ensure the backend API is running and responding correctly

## Support

For issues and questions, please check the Google Gemini API documentation and Nuxt.js documentation.