import { describe, it, expect } from 'vitest'
import type { NewsItem, ApiResponse } from '~~/types/index'
import type { CategoryName } from '~~/constants/categories'

describe('Type Definitions Validation', () => {
  describe('NewsItem interface', () => {
    it('should accept valid NewsItem structure', () => {
      const validNewsItem: NewsItem = {
        title: 'Test News Title',
        summary: 'This is a test summary',
        content: 'This is the full content of the news article',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology' as CategoryName,
        url: 'https://example.com/news'
      }

      expect(validNewsItem.title).toBe('Test News Title')
      expect(validNewsItem.summary).toBe('This is a test summary')
      expect(validNewsItem.content).toBe('This is the full content of the news article')
      expect(validNewsItem.source).toBe('Test Source')
      expect(validNewsItem.publishedAt).toBe('2024-01-15T10:00:00Z')
      expect(validNewsItem.category).toBe('Technology')
      expect(validNewsItem.url).toBe('https://example.com/news')
    })

    it('should accept NewsItem without optional url', () => {
      const newsItemWithoutUrl: NewsItem = {
        title: 'Test News Title',
        summary: 'This is a test summary',
        content: 'This is the full content of the news article',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Business' as CategoryName
      }

      expect(newsItemWithoutUrl.title).toBe('Test News Title')
      expect(newsItemWithoutUrl.url).toBeUndefined()
    })

    it('should handle all category types', () => {
      const categories: CategoryName[] = ['Politics', 'Business', 'Technology', 'Culture', 'Sports', 'Other']

      categories.forEach((category) => {
        const newsItem: NewsItem = {
          title: `Test News for ${category}`,
          summary: 'Test summary',
          content: 'Test content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category
        }

        expect(newsItem.category).toBe(category)
      })
    })

    it('should accept various timestamp formats', () => {
      const timestampFormats = [
        '2024-01-15T10:00:00Z',
        '2024-01-15T10:00:00.000Z',
        '2024-01-15T10:00:00+09:00'
      ]

      timestampFormats.forEach((timestamp) => {
        const newsItem: NewsItem = {
          title: 'Test News',
          summary: 'Test summary',
          content: 'Test content',
          source: 'Test Source',
          publishedAt: timestamp,
          category: 'Technology' as CategoryName
        }

        expect(newsItem.publishedAt).toBe(timestamp)
      })
    })

    it('should accept empty strings for required string fields', () => {
      const newsItemWithEmptyStrings: NewsItem = {
        title: '',
        summary: '',
        content: '',
        source: '',
        publishedAt: '',
        category: 'Other' as CategoryName,
        url: ''
      }

      expect(newsItemWithEmptyStrings.title).toBe('')
      expect(newsItemWithEmptyStrings.summary).toBe('')
      expect(newsItemWithEmptyStrings.content).toBe('')
      expect(newsItemWithEmptyStrings.source).toBe('')
      expect(newsItemWithEmptyStrings.publishedAt).toBe('')
      expect(newsItemWithEmptyStrings.category).toBe('Other')
      expect(newsItemWithEmptyStrings.url).toBe('')
    })
  })

  describe('ApiResponse interface', () => {
    it('should accept valid ApiResponse structure with all fields', () => {
      const newsItems: NewsItem[] = [
        {
          title: 'Test News',
          summary: 'Test summary',
          content: 'Test content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: 'https://example.com/news'
        }
      ]

      const validApiResponse: ApiResponse<NewsItem[]> = {
        success: true,
        data: newsItems,
        count: 1,
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(validApiResponse.success).toBe(true)
      expect(validApiResponse.data).toEqual(newsItems)
      expect(validApiResponse.count).toBe(1)
      expect(validApiResponse.timestamp).toBe('2024-01-15T10:00:00Z')
    })

    it('should accept ApiResponse without optional count field', () => {
      const apiResponseWithoutCount: ApiResponse<string> = {
        success: true,
        data: 'Test data',
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(apiResponseWithoutCount.success).toBe(true)
      expect(apiResponseWithoutCount.data).toBe('Test data')
      expect(apiResponseWithoutCount.count).toBeUndefined()
      expect(apiResponseWithoutCount.timestamp).toBe('2024-01-15T10:00:00Z')
    })

    it('should accept ApiResponse with different data types', () => {
      // Test with string data
      const stringResponse: ApiResponse<string> = {
        success: true,
        data: 'Success message',
        timestamp: '2024-01-15T10:00:00Z'
      }

      // Test with number data
      const numberResponse: ApiResponse<number> = {
        success: true,
        data: 42,
        count: 1,
        timestamp: '2024-01-15T10:00:00Z'
      }

      // Test with boolean data
      const booleanResponse: ApiResponse<boolean> = {
        success: true,
        data: false,
        timestamp: '2024-01-15T10:00:00Z'
      }

      // Test with object data
      const objectResponse: ApiResponse<{ key: string }> = {
        success: true,
        data: { key: 'value' },
        count: 1,
        timestamp: '2024-01-15T10:00:00Z'
      }

      // Test with array data
      const arrayResponse: ApiResponse<string[]> = {
        success: true,
        data: ['item1', 'item2', 'item3'],
        count: 3,
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(stringResponse.data).toBe('Success message')
      expect(numberResponse.data).toBe(42)
      expect(booleanResponse.data).toBe(false)
      expect(objectResponse.data).toEqual({ key: 'value' })
      expect(arrayResponse.data).toEqual(['item1', 'item2', 'item3'])
    })

    it('should accept ApiResponse with success: false', () => {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(errorResponse.success).toBe(false)
      expect(errorResponse.data).toBe(null)
      expect(errorResponse.timestamp).toBe('2024-01-15T10:00:00Z')
    })

    it('should accept ApiResponse with default generic type (any)', () => {
      const defaultResponse: ApiResponse = {
        success: true,
        data: { any: 'data' },
        count: 1,
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(defaultResponse.success).toBe(true)
      expect(defaultResponse.data).toEqual({ any: 'data' })
      expect(defaultResponse.count).toBe(1)
      expect(defaultResponse.timestamp).toBe('2024-01-15T10:00:00Z')
    })
  })

  describe('Type compatibility tests', () => {
    it('should maintain type safety in function signatures', () => {
      // Function that processes NewsItem array
      const processNewsItems = (items: NewsItem[]): string => {
        return items.map(item => item.title).join(', ')
      }

      const newsItems: NewsItem[] = [
        {
          title: 'News 1',
          summary: 'Summary 1',
          content: 'Content 1',
          source: 'Source 1',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName
        },
        {
          title: 'News 2',
          summary: 'Summary 2',
          content: 'Content 2',
          source: 'Source 2',
          publishedAt: '2024-01-15T11:00:00Z',
          category: 'Business' as CategoryName
        }
      ]

      const result = processNewsItems(newsItems)
      expect(result).toBe('News 1, News 2')
    })

    it('should work with generic ApiResponse in functions', () => {
      // Generic function that creates ApiResponse
      const createApiResponse = <T>(data: T, success = true): ApiResponse<T> => {
        return {
          success,
          data,
          timestamp: new Date().toISOString()
        }
      }

      const stringResponse = createApiResponse('Test message')
      const arrayResponse = createApiResponse([1, 2, 3], true, 3)
      const objectResponse = createApiResponse({ test: 'data' })

      expect(stringResponse.success).toBe(true)
      expect(stringResponse.data).toBe('Test message')
      expect(arrayResponse.data).toEqual([1, 2, 3])
      expect(objectResponse.data).toEqual({ test: 'data' })
    })
  })
})