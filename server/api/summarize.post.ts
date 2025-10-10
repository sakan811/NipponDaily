import { geminiService } from '../services/gemini'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { newsItem } = body

    if (!newsItem || typeof newsItem !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'News item is required'
      })
    }

    const summary = await geminiService.summarizeNews(newsItem)

    return {
      success: true,
      data: {
        originalSummary: newsItem.summary,
        aiSummary: summary
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Summarize API error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to summarize news',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    })
  }
})