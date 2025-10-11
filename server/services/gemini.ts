import { GoogleGenAI } from '@google/genai'
import type { NewsItem } from '../../types/index'
import { VALID_CATEGORIES } from '../../constants/categories'


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
      2. Focus on these categories: ${VALID_CATEGORIES.filter(cat => cat !== 'Other').join(', ')}
      3. Summarize each news item concisely and accurately
      4. Always cite sources and provide publication dates
      5. CRITICAL: Preserve original headlines exactly as they appear
      6. CRITICAL: Verify and provide accurate, direct URLs to original news sources
      7. Format responses as structured JSON data

      Current date: ${new Date().toISOString().split('T')[0]}`

      const prompt = `Search for today's latest news from Japan using Google Search. Find recent articles from reputable Japanese news sources.

      CRITICAL REQUIREMENTS:
      1. **HEADLINES**: Keep the EXACT original headlines from the news sources. Do not modify, summarize, or rephrase headlines. If the original headline is in Japanese, provide an accurate English translation but mark it as "Translated: [English headline]".

      2. **URLS**: Provide URL to the original article. Ensure URLs are complete and valid (including https://).

      For each news item found, provide:
      1. title: EXACT original headline (see requirements above)
      2. summary: 2-3 sentences capturing key points
      3. content: important facts and context
      4. source: exact news outlet name (NHK, Japan Times, Nikkei, Asahi Shimbun, etc.)
      5. publishedAt: publication date in ISO format
      6. category: ${VALID_CATEGORIES.join(', ')}
      7. url: URL to the original article for citing

      FORMAT REQUIREMENTS:
      - Return a JSON array of news objects
      - Each object must have all 7 fields
      - URLs must be complete and valid (include https://)
      - Titles must be preserved exactly from sources

      Search priority: NHK, Japan Times, Nikkei, Asahi Shimbun, Mainichi Shimbun, Yomiuri Shimbun, and other established Japanese news organizations.

      Example format:
      [
        {
          "title": "Exact Headline from News Source",
          "summary": "Brief 2-3 sentence summary",
          "content": "Detailed content with important facts",
          "source": "NHK",
          "publishedAt": "2025-01-12T10:30:00Z",
          "category": "Politics",
          "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHrBuRB27XrPbiEbHcuisqVF0zopw-52DNGdWrJ6HFA12sDJQGKnzN4lSpskfoBjP-tImTrPlgr3ThThy2-O_n5j3jgLcfKXlRqN4NnbKVGnoQyEKX9zBUJcjjr_q-pjHjmbu0="
        }
      ]`

      const response = await this.client.models.generateContent({
        model: this.getModel(),
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0,
          thinkingConfig: {
            thinkingBudget: 24576
          },
          tools: [
            { urlContext: {} },
            {
              googleSearch: {
              }
            },
          ]
        }
      })

      const text = response.text || ''

      // Try to parse JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const newsData = JSON.parse(jsonMatch[0])
        return newsData.map((item: any) => {
          // Use URL as-is without validation
          const validUrl = item.url || ''

          return {
            title: item.title || 'Untitled',
            summary: item.summary || '',
            content: item.content || '',
            source: item.source || 'Unknown',
            publishedAt: item.publishedAt || new Date().toISOString(),
            category: item.category || 'General',
            url: validUrl
          }
        })
      }

      // Fallback: create structured response from text
      return this.parseNewsFromText(text)

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching news:', error)
      }
      throw new Error('Failed to fetch news from Gemini API')
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

export { GeminiService }
export const geminiService = new GeminiService()