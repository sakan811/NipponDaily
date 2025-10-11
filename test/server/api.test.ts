import { describe, it, expect, vi, beforeEach } from 'vitest'
import { $fetch } from 'ofetch'

// Mock the Gemini service
const mockFetchJapanNews = vi.fn()
const mockChatAboutNews = vi.fn()
const mockSummarizeNews = vi.fn()

vi.mock('~/server/services/gemini', () => ({
  geminiService: {
    fetchJapanNews: mockFetchJapanNews,
    chatAboutNews: mockChatAboutNews,
    summarizeNews: mockSummarizeNews
  }
}))

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/news', () => {
    it('should fetch news successfully', async () => {
      const mockNews = [
        {
          title: 'Test News 1',
          summary: 'Test Summary 1',
          content: 'Test Content 1',
          source: 'Test Source 1',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology',
          url: 'https://example.com/1'
        }
      ]

      mockFetchJapanNews.mockResolvedValue(mockNews)

      const response = await $fetch('/api/news')

      expect(response).toEqual({
        success: true,
        data: mockNews,
        count: 1,
        timestamp: expect.any(String)
      })
    })

    it('should handle news fetching errors', async () => {
      const error = new Error('Failed to fetch news')
      mockFetchJapanNews.mockRejectedValue(error)

      try {
        await $fetch('/api/news')
      } catch (error: any) {
        expect(error.data?.success).toBe(false)
        expect(error.data?.error).toBe('Failed to fetch news')
      }
    })

    it('should filter by category when provided', async () => {
      const mockNews = [
        {
          title: 'Tech News',
          summary: 'Tech Summary',
          content: 'Tech Content',
          source: 'Tech Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology',
          url: 'https://example.com/tech'
        }
      ]

      mockFetchJapanNews.mockResolvedValue(mockNews)

      const response = await $fetch('/api/news', {
        query: { category: 'technology' }
      })

      expect(response.data).toEqual(mockNews)
    })

    it('should limit results when limit parameter is provided', async () => {
      const mockNews = Array.from({ length: 5 }, (_, i) => ({
        title: `News ${i + 1}`,
        summary: `Summary ${i + 1}`,
        content: `Content ${i + 1}`,
        source: `Source ${i + 1}`,
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology',
        url: `https://example.com/${i + 1}`
      }))

      mockFetchJapanNews.mockResolvedValue(mockNews)

      const response = await $fetch('/api/news', {
        query: { limit: 3 }
      })

      expect(response.data).toHaveLength(3)
    })
  })

  describe('POST /api/chat', () => {
    it('should process chat message successfully', async () => {
      const mockChatResponse = {
        message: 'This is a response about the news',
        sources: ['Test Source 1']
      }

      const mockNewsContext = [
        {
          title: 'Test News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source 1',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology'
        }
      ]

      mockChatAboutNews.mockResolvedValue(mockChatResponse)

      const response = await $fetch('/api/chat', {
        method: 'POST',
        body: {
          message: 'What is this news about?',
          newsContext: mockNewsContext
        }
      })

      expect(response).toEqual({
        success: true,
        data: mockChatResponse,
        timestamp: expect.any(String)
      })

      expect(mockChatAboutNews).toHaveBeenCalledWith('What is this news about?', mockNewsContext)
    })

    it('should handle missing message parameter', async () => {
      try {
        await $fetch('/api/chat', {
          method: 'POST',
          body: {}
        })
      } catch (error: any) {
        expect(error.data?.success).toBe(false)
        expect(error.data?.error).toBe('Message is required')
      }
    })

    it('should handle missing news context parameter', async () => {
      try {
        await $fetch('/api/chat', {
          method: 'POST',
          body: { message: 'Test message' }
        })
      } catch (error: any) {
        expect(error.data?.success).toBe(false)
        expect(error.data?.error).toBe('News context is required')
      }
    })

    it('should handle chat processing errors', async () => {
      const error = new Error('Chat processing failed')
      mockChatAboutNews.mockRejectedValue(error)

      try {
        await $fetch('/api/chat', {
          method: 'POST',
          body: {
            message: 'Test message',
            newsContext: []
          }
        })
      } catch (error: any) {
        expect(error.data?.success).toBe(false)
        expect(error.data?.error).toBe('Failed to process chat message')
      }
    })

    it('should handle empty news context gracefully', async () => {
      const mockChatResponse = {
        message: 'No news available to discuss',
        sources: []
      }

      mockChatAboutNews.mockResolvedValue(mockChatResponse)

      const response = await $fetch('/api/chat', {
        method: 'POST',
        body: {
          message: 'What news do you have?',
          newsContext: []
        }
      })

      expect(response.success).toBe(true)
      expect(response.data.sources).toEqual([])
    })
  })

  describe('POST /api/summarize', () => {
    it('should summarize news article successfully', async () => {
      const mockNewsItem = {
        title: 'Test News Article',
        summary: 'Original Summary',
        content: 'This is the full content of the news article',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology',
        url: 'https://example.com/test-article'
      }

      const mockSummary = 'Generated summary of the news article'
      mockSummarizeNews.mockResolvedValue(mockSummary)

      const response = await $fetch('/api/summarize', {
        method: 'POST',
        body: { newsItem: mockNewsItem }
      })

      expect(response).toEqual({
        success: true,
        data: { summary: mockSummary },
        timestamp: expect.any(String)
      })

      expect(mockSummarizeNews).toHaveBeenCalledWith(mockNewsItem)
    })

    it('should handle missing news item parameter', async () => {
      try {
        await $fetch('/api/summarize', {
          method: 'POST',
          body: {}
        })
      } catch (error: any) {
        expect(error.data?.success).toBe(false)
        expect(error.data?.error).toBe('News item is required')
      }
    })

    it('should handle summarization errors', async () => {
      const error = new Error('Summarization failed')
      mockSummarizeNews.mockRejectedValue(error)

      const mockNewsItem = {
        title: 'Test News',
        summary: 'Test Summary',
        content: 'Test Content',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }

      try {
        await $fetch('/api/summarize', {
          method: 'POST',
          body: { newsItem: mockNewsItem }
        })
      } catch (error: any) {
        expect(error.data?.success).toBe(false)
        expect(error.data?.error).toBe('Failed to summarize news')
      }
    })

    it('should handle malformed news item', async () => {
      try {
        await $fetch('/api/summarize', {
          method: 'POST',
          body: { newsItem: { invalid: 'data' } }
        })
      } catch (error: any) {
        expect(error.data?.success).toBe(false)
        expect(error.data?.error).toBe('Invalid news item format')
      }
    })
  })
})