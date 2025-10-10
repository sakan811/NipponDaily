import { GoogleGenAI } from '@google/genai'

export interface NewsItem {
  title: string
  summary: string
  content: string
  source: string
  publishedAt: string
  category: string
  url?: string
}

export interface ChatResponse {
  message: string
  sources?: string[]
}

class GeminiService {
  private client: GoogleGenAI | null = null

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured')
      return
    }

    this.client = new GoogleGenAI({ apiKey })
  }

  private getModel(): string {
    const config = useRuntimeConfig()
    return config.geminiModel || 'gemini-1.5-flash'
  }

  async fetchJapanNews(): Promise<NewsItem[]> {
    if (!this.client) {
      throw new Error('Gemini client not initialized')
    }

    try {
      const systemInstruction = `You are a specialized AI assistant for fetching and summarizing Japanese news. Your primary functions are:
      1. Use Google Search to find the latest, most reliable news from Japan
      2. Focus on these categories: Politics, Business, Technology, Culture, and Sports
      3. Summarize each news item concisely and accurately
      4. Always cite sources and provide publication dates
      5. Format responses as structured JSON data

      Current date: ${new Date().toISOString().split('T')[0]}`

      const prompt = `Search for today's latest news from Japan using Google Search. Find recent articles from reputable Japanese news sources.

      For each news item found, provide:
      1. Title (exact headline)
      2. Brief summary (2-3 sentences capturing key points)
      3. Main content/details (important facts and context)
      4. Source/news outlet name
      5. Publication date
      6. Category (Politics, Business, Technology, Culture, Sports, or Other)
      7. URL if available

      Please format your response as a JSON array of news objects.
      Search for news from: NHK, Japan Times, Nikkei, Asahi Shimbun, Mainichi Shimbun, Yomiuri Shimbun, and other reliable Japanese news sources.`

      const response = await this.client.models.generateContent({
        model: this.getModel(),
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: 'Understood. I will fetch Japanese news using Google Search and format it as requested.' }] },
          { role: 'user', parts: [{ text: prompt }] }
        ]
      })

      const text = response.text || ''

      // Try to parse JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const newsData = JSON.parse(jsonMatch[0])
        return newsData.map((item: any) => ({
          title: item.title || 'Untitled',
          summary: item.summary || '',
          content: item.content || '',
          source: item.source || 'Unknown',
          publishedAt: item.publishedAt || new Date().toISOString(),
          category: item.category || 'General',
          url: item.url || ''
        }))
      }

      // Fallback: create structured response from text
      return this.parseNewsFromText(text)

    } catch (error) {
      console.error('Error fetching news:', error)
      throw new Error('Failed to fetch news from Gemini API')
    }
  }

  async chatAboutNews(message: string, newsContext: NewsItem[]): Promise<ChatResponse> {
    if (!this.client) {
      throw new Error('Gemini client not initialized')
    }

    try {
      const newsContextStr = newsContext
        .slice(0, 5) // Limit to top 5 news items for context
        .map(news => `Title: ${news.title}\nSummary: ${news.summary}\nSource: ${news.source}`)
        .join('\n\n')

      const prompt = `You are a helpful AI assistant specialized in Japanese news.
      Based on the following recent news from Japan, answer the user's question.

      Recent News Context:
      ${newsContextStr}

      User Question: ${message}

      Provide a helpful, informative response. If the information isn't available in the provided news context, let the user know and suggest they can ask about the available news topics.
      Be conversational and engaging.`

      const response = await this.client.models.generateContent({
        model: this.getModel(),
        contents: prompt
      })

      return {
        message: response.text || 'I apologize, but I couldn\'t generate a response.',
        sources: newsContext.slice(0, 3).map(news => news.source)
      }

    } catch (error) {
      console.error('Error in chat:', error)
      throw new Error('Failed to process chat message')
    }
  }

  async summarizeNews(newsItem: NewsItem): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini client not initialized')
    }

    try {
      const prompt = `Summarize this Japanese news article in a clear, concise way:

      Title: ${newsItem.title}
      Content: ${newsItem.content}
      Source: ${newsItem.source}

      Provide a 2-3 sentence summary that captures the key points and significance.`

      const response = await this.client.models.generateContent({
        model: this.getModel(),
        contents: prompt
      })

      return response.text || newsItem.summary

    } catch (error) {
      console.error('Error summarizing news:', error)
      return newsItem.summary
    }
  }

  private parseNewsFromText(text: string): NewsItem[] {
    // Simple fallback parsing if JSON parsing fails
    const lines = text.split('\n').filter(line => line.trim())
    const newsItems: NewsItem[] = []

    // Basic parsing logic - this is a simplified fallback
    let currentNews: Partial<NewsItem> = {}

    for (const line of lines) {
      if (line.includes('Title:')) {
        if (currentNews.title) {
          newsItems.push(currentNews as NewsItem)
          currentNews = {}
        }
        currentNews.title = line.replace('Title:', '').trim()
      } else if (line.includes('Summary:')) {
        currentNews.summary = line.replace('Summary:', '').trim()
      } else if (line.includes('Source:')) {
        currentNews.source = line.replace('Source:', '').trim()
      }
    }

    if (currentNews.title) {
      newsItems.push(currentNews as NewsItem)
    }

    return newsItems.length > 0 ? newsItems : [{
      title: 'Latest Japan News',
      summary: 'Unable to fetch detailed news. Please try again later.',
      content: text,
      source: 'Gemini API',
      publishedAt: new Date().toISOString(),
      category: 'General'
    }]
  }
}

export const geminiService = new GeminiService()