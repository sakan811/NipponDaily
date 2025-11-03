import { geminiService } from '../services/gemini'
import { tavilyService } from '../services/tavily'

export default defineEventHandler(async (event) => {
  try {
    // Get runtime config
    const config = useRuntimeConfig()

    // Get query parameters
    const query = getQuery(event)
    const category = query.category as string
    const limitParam = parseInt(query.limit as string)
    const limit = !isNaN(limitParam) && limitParam > 0 ? limitParam : 10

    // Fetch news from Tavily
    const tavilyResponse = await tavilyService.searchJapanNews({
      maxResults: limit,
      apiKey: config.tavilyApiKey
    })

    // Format Tavily results to NewsItem format
    let news = tavilyService.formatTavilyResultsToNewsItems(tavilyResponse)

    // Use Gemini to categorize the news
    news = await geminiService.categorizeNewsItems(news, {
      apiKey: config.geminiApiKey,
      model: config.geminiModel
    })

    // Filter by category if specified
    if (category && category !== 'all') {
      news = news.filter(item =>
        item.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Limit results (in case categorization returned more than requested)
    news = news.slice(0, limit)

    return {
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('News API error:', error)
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch news',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    })
  }
})