import { geminiService } from '../services/gemini'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message, newsContext } = body

    if (!message || typeof message !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message is required and must be a string'
      })
    }

    if (!Array.isArray(newsContext)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'News context must be an array'
      })
    }

    const response = await geminiService.chatAboutNews(message, newsContext)

    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Chat API error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process chat message',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    })
  }
})