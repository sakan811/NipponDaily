import { tavily } from '@tavily/core'

export interface TavilySearchResult {
  url: string
  title: string
  score: number
  publishedDate?: string
  content: string
  favicon?: string
  raw_content?: string
}

export interface TavilyResponse {
  query: string
  follow_up_questions: null
  answer: null
  images: any[]
  results: TavilySearchResult[]
  response_time: number
  request_id: string
}

class TavilyService {
  private client: any

  private initializeClient(apiKey?: string) {
    if (!apiKey) {
      console.warn('TAVILY_API_KEY not configured')
      return
    }

    this.client = tavily({ apiKey })
  }

  async searchJapanNews(options?: {
    query?: string
    maxResults?: number
    category?: string
    apiKey?: string
  }): Promise<TavilyResponse> {
    // Initialize client with API key if not already done
    if (!this.client && options?.apiKey) {
      this.initializeClient(options.apiKey)
    }

    if (!this.client) {
      throw new Error('Tavily client not initialized - API key required')
    }

    try {
      const {
        query = 'latest news Japan',
        maxResults = 10,
        category = ''
      } = options || {}

      // Build search query based on category
      let searchQuery = query
      if (category && category !== 'all') {
        searchQuery = `latest ${category} news Japan`
      }

      // Use the search method with topic: "news" for news-focused results and include raw content
      const response = await this.client.search(searchQuery, {
        topic: "news",
        max_results: maxResults,
        includeRawContent: true
      })

      return response

    } catch (error) {
      console.error('Error searching news with Tavily:', error)
      throw new Error('Failed to search news with Tavily API')
    }
  }

  async searchGeneral(query: string, maxResults: number = 5, apiKey?: string): Promise<TavilyResponse> {
    // Initialize client with API key if not already done
    if (!this.client && apiKey) {
      this.initializeClient(apiKey)
    }

    if (!this.client) {
      throw new Error('Tavily client not initialized - API key required')
    }

    try {
      const response = await this.client.search(query, {
        max_results: maxResults
      })

      return response

    } catch (error) {
      console.error('Error searching with Tavily:', error)
      throw new Error('Failed to search with Tavily API')
    }
  }

  formatTavilyResultsToNewsItems(response: TavilyResponse): any[] {
    return response.results.map((result: TavilySearchResult) => {
      return {
        title: result.title || 'Untitled',
        summary: result.content || '',
        content: result.content || '',
        rawContent: result.raw_content || '',
        source: this.extractSourceFromUrl(result.url),
        publishedAt: result.publishedDate || new Date().toISOString(),
        category: 'Other',
        url: result.url,
        score: result.score
      }
    })
  }

  private extractSourceFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname
      const sourceMap: { [key: string]: string } = {
        'nhk.or.jp': 'NHK',
        'japantimes.co.jp': 'Japan Times',
        'nikkei.com': 'Nikkei',
        'asahi.com': 'Asahi Shimbun',
        'mainichi.jp': 'Mainichi Shimbun',
        'yomiuri.co.jp': 'Yomiuri Shimbun',
        'reuters.com': 'Reuters',
        'nytimes.com': 'New York Times',
        'fortune.com': 'Fortune',
        'autonews.com': 'Automotive News'
      }
      return sourceMap[domain] || domain
    } catch {
      return 'Unknown'
    }
  }
}

export { TavilyService }
export const tavilyService = new TavilyService()