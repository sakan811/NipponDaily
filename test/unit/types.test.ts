import { describe, it, expect } from 'vitest'
import type { NewsItem, ApiResponse } from '~~/types/index'
import { NEWS_CATEGORIES, VALID_CATEGORIES } from '~~/constants/categories'

describe('Types & Constants', () => {
  it('validates NewsItem interface', () => {
    const newsItem: NewsItem = {
      title: 'Test News',
      summary: 'Test Summary',
      content: 'Test Content',
      source: 'Test Source',
      publishedAt: '2024-01-15T10:00:00Z',
      category: 'Technology',
      url: 'https://example.com'
    }

    expect(newsItem.title).toBe('Test News')
    expect(newsItem.category).toBe('Technology')
  })

  it('validates ApiResponse generic type', () => {
    const response: ApiResponse<NewsItem[]> = {
      success: true,
      data: [],
      count: 0,
      timestamp: '2024-01-15T10:00:00Z'
    }

    expect(response.success).toBe(true)
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('validates category constants', () => {
    expect(NEWS_CATEGORIES).toHaveLength(6)
    expect(VALID_CATEGORIES).toHaveLength(6)
    expect(VALID_CATEGORIES).toContain('Technology')
    expect(VALID_CATEGORIES).toContain('Other')
  })
})