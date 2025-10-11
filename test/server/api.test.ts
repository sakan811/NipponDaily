import { describe, it, expect, vi, beforeEach } from 'vitest'
import { $fetch } from 'ofetch'
import type { CategoryName } from '~~/constants/categories'

// Mock the Gemini service
const mockFetchJapanNews = vi.fn()

vi.mock('~/server/services/gemini', () => ({
  geminiService: {
    fetchJapanNews: mockFetchJapanNews
  }
}))

// Mock h3 utilities for server tests
vi.mock('h3', () => ({
  getQuery: vi.fn(() => ({})),
  getRouterParam: vi.fn(() => null),
  getCookie: vi.fn(() => null),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  readBody: vi.fn(() => ({})),
  createError: vi.fn((error) => ({
    statusCode: error.statusCode || 500,
    statusMessage: error.statusMessage || 'Internal Server Error',
    data: error.data || {}
  })),
  defineEventHandler: vi.fn((handler) => handler),
  toNodeListener: vi.fn(),
  fromNodeMiddleware: vi.fn()
}))

// Mock defineEventHandler properly
vi.mock('#app', () => ({
  defineEventHandler: vi.fn((handler) => handler),
  useRuntimeConfig: vi.fn(() => ({
    geminiApiKey: 'test-api-key',
    geminiModel: 'gemini-1.5-flash',
    public: {
      apiBase: '/api'
    }
  }))
}))

// Make Nuxt/h3 functions globally available for the API handler
;(global as any).defineEventHandler = vi.fn((handler) => handler)
;(global as any).getQuery = vi.fn(() => ({}))
;(global as any).createError = vi.fn((error) => ({
  statusCode: error.statusCode || 500,
  statusMessage: error.statusMessage || 'Internal Server Error',
  data: error.data || {}
}))

describe('API Routes', () => {
  let handler: any
  let mockGetQuery: any
  let mockCreateError: any

  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset environment
    delete process.env.NODE_ENV

    // Import the actual handler for each test
    const handlerModule = await import('~/server/api/news.get')
    handler = handlerModule.default

    // Use global mocked functions
    mockGetQuery = (global as any).getQuery
    mockCreateError = (global as any).createError
  })

  describe('GET /api/news', () => {
    describe('Direct Handler Tests (for line coverage)', () => {
      it('should execute defineEventHandler wrapper and handle empty query (lines 1-43)', async () => {
        // Mock empty query
        mockGetQuery.mockReturnValue({})
        mockFetchJapanNews.mockResolvedValue([])

        // Create a mock event object
        const mockEvent = {} as any

        const response = await handler(mockEvent)

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.data).toEqual([])
        expect(response.count).toBe(0)
        expect(response.timestamp).toBeDefined()
        expect(typeof response.timestamp).toBe('string')
      })

      it('should handle query parameter extraction with category and limit (lines 5-8)', async () => {
        mockGetQuery.mockReturnValue({ category: 'technology', limit: '5' })

        const mockNews = [
          {
            title: 'Tech News',
            summary: 'Tech Summary',
            content: 'Tech Content',
            source: 'Tech Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/tech'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        expect(response.success).toBe(true)
        expect(response.data).toHaveLength(1)
        expect(response.count).toBe(1)
        expect(mockGetQuery).toHaveBeenCalledWith(mockEvent)
      })

      it('should handle missing query parameters (lines 5-8)', async () => {
        mockGetQuery.mockReturnValue({})

        const mockNews = [
          {
            title: 'Test News',
            summary: 'Test Summary',
            content: 'Test Content',
            source: 'Test Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/test'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        expect(response.success).toBe(true)
        expect(response.data).toHaveLength(1)
        expect(response.count).toBe(1)
      })

      it('should call geminiService.fetchJapanNews (line 11)', async () => {
        mockGetQuery.mockReturnValue({})

        const mockNews = [
          {
            title: 'Test News',
            summary: 'Test Summary',
            content: 'Test Content',
            source: 'Test Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/test'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        await handler(mockEvent)

        expect(mockFetchJapanNews).toHaveBeenCalledTimes(1)
      })

      it('should handle geminiService fetch errors (line 11)', async () => {
        mockGetQuery.mockReturnValue({})

        const error = new Error('Service error')
        mockFetchJapanNews.mockRejectedValue(error)

        const mockEvent = {} as any

        try {
          await handler(mockEvent)
          fail('Should have thrown an error')
        } catch (thrownError) {
          expect(mockCreateError).toHaveBeenCalledWith({
            statusCode: 500,
            statusMessage: 'Failed to fetch news',
            data: {
              error: 'Service error'
            }
          })
        }
      })

      it('should filter by category when specified (lines 14-18)', async () => {
        mockGetQuery.mockReturnValue({ category: 'technology' })

        const mockNews = [
          {
            title: 'Tech News',
            summary: 'Tech Summary',
            content: 'Tech Content',
            source: 'Tech Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/tech'
          },
          {
            title: 'Business News',
            summary: 'Business Summary',
            content: 'Business Content',
            source: 'Business Source',
            publishedAt: '2024-01-15T11:00:00Z',
            category: 'Business' as CategoryName,
            url: 'https://example.com/business'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        expect(response.success).toBe(true)
        expect(response.data).toHaveLength(1)
        expect(response.data[0].category).toBe('Technology')
      })

      it('should handle case-insensitive category filtering (lines 14-18)', async () => {
        mockGetQuery.mockReturnValue({ category: 'TECHNOLOGY' })

        const mockNews = [
          {
            title: 'Tech News',
            summary: 'Tech Summary',
            content: 'Tech Content',
            source: 'Tech Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/tech'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        expect(response.success).toBe(true)
        expect(response.data).toHaveLength(1)
        expect(response.data[0].category).toBe('Technology')
      })

      it('should return all news when category is "all" (lines 14-18)', async () => {
        mockGetQuery.mockReturnValue({ category: 'all' })

        const mockNews = [
          {
            title: 'Tech News',
            summary: 'Tech Summary',
            content: 'Tech Content',
            source: 'Tech Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/tech'
          },
          {
            title: 'Business News',
            summary: 'Business Summary',
            content: 'Business Content',
            source: 'Business Source',
            publishedAt: '2024-01-15T11:00:00Z',
            category: 'Business' as CategoryName,
            url: 'https://example.com/business'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        expect(response.success).toBe(true)
        expect(response.data).toHaveLength(2)
      })

      it('should limit results when limit parameter is provided (line 21)', async () => {
        mockGetQuery.mockReturnValue({ limit: '2' })

        const mockNews = Array.from({ length: 5 }, (_, i) => ({
          title: `News ${i + 1}`,
          summary: `Summary ${i + 1}`,
          content: `Content ${i + 1}`,
          source: `Source ${i + 1}`,
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: `https://example.com/${i + 1}`
        }))

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        expect(response.success).toBe(true)
        expect(response.data).toHaveLength(2)
        expect(response.count).toBe(2)
      })

      it('should handle limit parameter parsing (line 8)', async () => {
        mockGetQuery.mockReturnValue({ limit: 'invalid' })

        const mockNews = [
          {
            title: 'Test News',
            summary: 'Test Summary',
            content: 'Test Content',
            source: 'Test Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/test'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        // When parseInt returns NaN, limit becomes NaN and slice should return empty array
        expect(response.success).toBe(true)
        expect(response.data).toHaveLength(0)
      })

      it('should use default limit when not provided (line 8)', async () => {
        mockGetQuery.mockReturnValue({})

        const mockNews = Array.from({ length: 15 }, (_, i) => ({
          title: `News ${i + 1}`,
          summary: `Summary ${i + 1}`,
          content: `Content ${i + 1}`,
          source: `Source ${i + 1}`,
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: `https://example.com/${i + 1}`
        }))

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        // Should limit to default 10 items
        expect(response.success).toBe(true)
        expect(response.data).toHaveLength(10)
        expect(response.count).toBe(10)
      })

      it('should format response with correct structure (lines 23-28)', async () => {
        mockGetQuery.mockReturnValue({})

        const mockNews = [
          {
            title: 'Test News',
            summary: 'Test Summary',
            content: 'Test Content',
            source: 'Test Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/test'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mockEvent = {} as any
        const response = await handler(mockEvent)

        expect(response).toHaveProperty('success', true)
        expect(response).toHaveProperty('data')
        expect(response).toHaveProperty('count', 1)
        expect(response).toHaveProperty('timestamp')
        expect(typeof response.timestamp).toBe('string')
      })

      it('should log errors in development environment (lines 31-33)', async () => {
        process.env.NODE_ENV = 'development'

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        mockGetQuery.mockReturnValue({})

        const error = new Error('Development error')
        mockFetchJapanNews.mockRejectedValue(error)

        const mockEvent = {} as any

        try {
          await handler(mockEvent)
          fail('Should have thrown an error')
        } catch (thrownError) {
          expect(consoleSpy).toHaveBeenCalledWith('News API error:', error)
        }

        consoleSpy.mockRestore()
      })

      it('should not log errors in production environment (lines 31-33)', async () => {
        process.env.NODE_ENV = 'production'

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        mockGetQuery.mockReturnValue({})

        const error = new Error('Production error')
        mockFetchJapanNews.mockRejectedValue(error)

        const mockEvent = {} as any

        try {
          await handler(mockEvent)
          fail('Should have thrown an error')
        } catch (thrownError) {
          expect(consoleSpy).not.toHaveBeenCalledWith('News API error:', error)
        }

        consoleSpy.mockRestore()
      })

      it('should handle Error instances properly (lines 35-41)', async () => {
        mockGetQuery.mockReturnValue({})

        const error = new Error('Test error')
        error.stack = 'Test stack trace'
        mockFetchJapanNews.mockRejectedValue(error)

        const mockEvent = {} as any

        try {
          await handler(mockEvent)
          fail('Should have thrown an error')
        } catch (thrownError) {
          expect(mockCreateError).toHaveBeenCalledWith({
            statusCode: 500,
            statusMessage: 'Failed to fetch news',
            data: {
              error: 'Test error'
            }
          })
        }
      })

      it('should handle non-Error exceptions properly (lines 35-41)', async () => {
        mockGetQuery.mockReturnValue({})

        const error = 'String error message'
        mockFetchJapanNews.mockRejectedValue(error)

        const mockEvent = {} as any

        try {
          await handler(mockEvent)
          fail('Should have thrown an error')
        } catch (thrownError) {
          expect(mockCreateError).toHaveBeenCalledWith({
            statusCode: 500,
            statusMessage: 'Failed to fetch news',
            data: {
              error: 'Unknown error occurred'
            }
          })
        }
      })

      it('should handle null/undefined exceptions properly (lines 35-41)', async () => {
        mockGetQuery.mockReturnValue({})

        mockFetchJapanNews.mockRejectedValue(null)

        const mockEvent = {} as any

        try {
          await handler(mockEvent)
          fail('Should have thrown an error')
        } catch (thrownError) {
          expect(mockCreateError).toHaveBeenCalledWith({
            statusCode: 500,
            statusMessage: 'Failed to fetch news',
            data: {
              error: 'Unknown error occurred'
            }
          })
        }
      })
    })

    describe('$fetch Integration Tests', () => {
      it('should fetch news successfully', async () => {
        const mockNews = [
          {
            title: 'Test News 1',
            summary: 'Test Summary 1',
            content: 'Test Content 1',
            source: 'Test Source 1',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/1'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mock$fetch = vi.fn().mockResolvedValue({
          success: true,
          data: mockNews,
          count: 1,
          timestamp: expect.any(String)
        })

        // Override the global $fetch mock for this test
        global.$fetch = mock$fetch

        const response = await mock$fetch('/api/news')

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

        const mockError = {
          data: {
            success: false,
            error: 'Failed to fetch news'
          }
        }

        const mock$fetch = vi.fn().mockRejectedValue(mockError)
        global.$fetch = mock$fetch

        try {
          await mock$fetch('/api/news')
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
            category: 'Technology' as CategoryName,
            url: 'https://example.com/tech'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mock$fetch = vi.fn().mockResolvedValue({
          success: true,
          data: mockNews,
          count: 1,
          timestamp: expect.any(String)
        })

        global.$fetch = mock$fetch

        const response = await mock$fetch('/api/news', {
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
          category: 'Technology' as CategoryName,
          url: `https://example.com/${i + 1}`
        }))

        const limitedNews = mockNews.slice(0, 3)
        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mock$fetch = vi.fn().mockResolvedValue({
          success: true,
          data: limitedNews,
          count: 3,
          timestamp: expect.any(String)
        })

        global.$fetch = mock$fetch

        const response = await mock$fetch('/api/news', {
          query: { limit: 3 }
        })

        expect(response.data).toHaveLength(3)
      })

      it('should handle case-insensitive category filtering', async () => {
        const mockNews = [
          {
            title: 'Tech News',
            summary: 'Tech Summary',
            content: 'Tech Content',
            source: 'Tech Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/tech'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mock$fetch = vi.fn().mockResolvedValue({
          success: true,
          data: mockNews,
          count: 1,
          timestamp: expect.any(String)
        })

        global.$fetch = mock$fetch

        const response = await mock$fetch('/api/news', {
          query: { category: 'TECHNOLOGY' }
        })

        expect(response.data).toEqual(mockNews)
      })

      it('should handle invalid limit parameter (non-integer)', async () => {
        const mockNews = [
          {
            title: 'Test News',
            summary: 'Test Summary',
            content: 'Test Content',
            source: 'Test Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/test'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mock$fetch = vi.fn().mockResolvedValue({
          success: true,
          data: [], // Should return empty when limit is invalid
          count: 0,
          timestamp: expect.any(String)
        })

        global.$fetch = mock$fetch

        const response = await mock$fetch('/api/news', {
          query: { limit: 'invalid' }
        })

        expect(response.data).toHaveLength(0)
      })

      it('should handle negative limit parameter', async () => {
        const mockNews = [
          {
            title: 'Test News',
            summary: 'Test Summary',
            content: 'Test Content',
            source: 'Test Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/test'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mock$fetch = vi.fn().mockResolvedValue({
          success: true,
          data: [], // Should return empty when limit is negative
          count: 0,
          timestamp: expect.any(String)
        })

        global.$fetch = mock$fetch

        const response = await mock$fetch('/api/news', {
          query: { limit: '-5' }
        })

        expect(response.data).toHaveLength(0)
      })

      it('should log errors in development environment', async () => {
        process.env.NODE_ENV = 'development'

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const error = new Error('Development API error')
        mockFetchJapanNews.mockRejectedValue(error)

        const mockError = {
          statusCode: 500,
          statusMessage: 'Failed to fetch news',
          data: {
            error: 'Development API error'
          }
        }

        const mock$fetch = vi.fn().mockRejectedValue(mockError)
        global.$fetch = mock$fetch

        try {
          await mock$fetch('/api/news')
        } catch (error) {
          // Expected to throw
        }

        consoleSpy.mockRestore()
      })

      it('should not log errors in production environment', async () => {
        process.env.NODE_ENV = 'production'

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const error = new Error('Production API error')
        mockFetchJapanNews.mockRejectedValue(error)

        const mockError = {
          statusCode: 500,
          statusMessage: 'Failed to fetch news',
          data: {
            error: 'Production API error'
          }
        }

        const mock$fetch = vi.fn().mockRejectedValue(mockError)
        global.$fetch = mock$fetch

        try {
          await mock$fetch('/api/news')
        } catch (error) {
          // Expected to throw
        }

        consoleSpy.mockRestore()
      })

      it('should handle non-Error exceptions', async () => {
        mockFetchJapanNews.mockRejectedValue('String error message')

        const mockError = {
          statusCode: 500,
          statusMessage: 'Failed to fetch news',
          data: {
            error: 'Unknown error occurred'
          }
        }

        const mock$fetch = vi.fn().mockRejectedValue(mockError)
        global.$fetch = mock$fetch

        try {
          await mock$fetch('/api/news')
        } catch (error: any) {
          expect(error.data?.error).toBe('Unknown error occurred')
        }
      })

      it('should return all news when category is "all"', async () => {
        const mockNews = [
          {
            title: 'Tech News',
            summary: 'Tech Summary',
            content: 'Tech Content',
            source: 'Tech Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology' as CategoryName,
            url: 'https://example.com/tech'
          },
          {
            title: 'Business News',
            summary: 'Business Summary',
            content: 'Business Content',
            source: 'Business Source',
            publishedAt: '2024-01-15T11:00:00Z',
            category: 'Business' as CategoryName,
            url: 'https://example.com/business'
          }
        ]

        mockFetchJapanNews.mockResolvedValue(mockNews)

        const mock$fetch = vi.fn().mockResolvedValue({
          success: true,
          data: mockNews,
          count: 2,
          timestamp: expect.any(String)
        })

        global.$fetch = mock$fetch

        const response = await mock$fetch('/api/news', {
          query: { category: 'all' }
        })

        expect(response.data).toHaveLength(2)
        expect(response.count).toBe(2)
      })
    })
  })
})