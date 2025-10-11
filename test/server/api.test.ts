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
  })
})