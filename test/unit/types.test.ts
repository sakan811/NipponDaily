import { describe, it, expect } from 'vitest'
import type { NewsItem, ApiResponse } from '~~/types/index'
import { NEWS_CATEGORIES, VALID_CATEGORIES, type CategoryName } from '~~/constants/categories'

describe('Type Definitions', () => {
  describe('NewsItem', () => {
    it('accepts valid NewsItem structure', () => {
      const newsItem: NewsItem = {
        title: 'Test News',
        summary: 'Test Summary',
        content: 'Test Content',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology' as CategoryName,
        url: 'https://example.com'
      }

      expect(newsItem.title).toBe('Test News')
      expect(newsItem.url).toBeDefined()
    })

    it('allows optional URL', () => {
      const newsItem: NewsItem = {
        title: 'Test News',
        summary: 'Test Summary',
        content: 'Test Content',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }

      expect(newsItem.url).toBeUndefined()
    })
  })

  
  describe('ApiResponse', () => {
    it('accepts valid ApiResponse structure', () => {
      const apiResponse: ApiResponse<NewsItem[]> = {
        success: true,
        data: [
          {
            title: 'Test News',
            summary: 'Test Summary',
            content: 'Test Content',
            source: 'Test Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology'
          }
        ],
        count: 1,
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(apiResponse.success).toBe(true)
      expect(apiResponse.data).toHaveLength(1)
      expect(apiResponse.count).toBe(1)
    })

    it('allows generic data type', () => {
      const stringResponse: ApiResponse<string> = {
        success: true,
        data: 'Test data',
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(typeof stringResponse.data).toBe('string')
    })
  })

  
  describe('Category Constants', () => {
    it('NEWS_CATEGORIES contains all expected categories', () => {
      expect(NEWS_CATEGORIES).toHaveLength(6)
      expect(NEWS_CATEGORIES[0]).toEqual({ id: 'all', name: 'All News' })
      expect(NEWS_CATEGORIES.find(cat => cat.id === 'technology')).toEqual({ id: 'technology', name: 'Technology' })
    })

    it('VALID_CATEGORIES contains all expected category names', () => {
      expect(VALID_CATEGORIES).toContain('Technology')
      expect(VALID_CATEGORIES).toContain('Other')
    })

    it('CategoryName type works correctly', () => {
      const categoryName: CategoryName = 'Technology'
      expect(categoryName).toBe('Technology')
    })
  })
})