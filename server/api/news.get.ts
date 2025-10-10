import { geminiService } from '../services/gemini'

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const category = query.category as string
    const limit = query.limit ? parseInt(query.limit as string) : 10

    // Fetch news from Gemini
    let news = await geminiService.fetchJapanNews()

    // Filter by category if specified
    if (category && category !== 'all') {
      news = news.filter(item =>
        item.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Limit results
    news = news.slice(0, limit)

    return {
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('News API error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch news',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    })
  }
})