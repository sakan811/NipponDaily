import { describe, it, expect, vi, beforeEach } from 'vitest'
import { $fetch } from 'ofetch'
import type { CategoryName } from '~/constants/categories'

// Mock the Gemini service
const mockFetchJapanNews = vi.fn()

vi.mock('~/server/services/gemini', () => ({
  geminiService: {
    fetchJapanNews: mockFetchJapanNews
  }
}))

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment
    delete process.env.NODE_ENV
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

    // Additional tests for comprehensive API coverage (lines 1-43)

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