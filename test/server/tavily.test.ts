import { describe, it, expect, vi, beforeEach } from 'vitest'

let mockTavilyClient: any

vi.mock('@tavily/core', () => ({
  tavily: vi.fn(() => mockTavilyClient)
}))

vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    tavilyApiKey: 'test-key'
  }))
}))

describe('TavilyService', () => {
  let service: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockTavilyClient = {
      search: vi.fn()
    }
    const module = await import('~/server/services/tavily')
    service = module.tavilyService
  })

  const createMockTavilyResponse = () => ({
    query: 'latest news Japan',
    follow_up_questions: null,
    answer: null,
    images: [],
    results: [
      {
        url: 'https://example.com/news1',
        title: 'News 1',
        score: 0.9,
        published_date: '2024-01-15T10:00:00Z',
        content: 'News content 1'
      },
      {
        url: 'https://nhk.or.jp/news2',
        title: 'News 2',
        score: 0.8,
        content: 'News content 2'
      }
    ],
    response_time: 1.5,
    request_id: 'test-id'
  })

  describe('searchJapanNews', () => {
    it('searches for Japan news successfully', async () => {
      const mockResponse = createMockTavilyResponse()
      mockTavilyClient.search.mockResolvedValue(mockResponse)

      const result = await service.searchJapanNews({ maxResults: 5 })

      expect(mockTavilyClient.search).toHaveBeenCalledWith('latest news Japan', {
        topic: 'news',
        max_results: 5
      })
      expect(result).toEqual(mockResponse)
    })

    it('includes category in search query when provided', async () => {
      const mockResponse = createMockTavilyResponse()
      mockTavilyClient.search.mockResolvedValue(mockResponse)

      await service.searchJapanNews({ category: 'technology' })

      expect(mockTavilyClient.search).toHaveBeenCalledWith('latest technology news Japan', {
        topic: 'news',
        max_results: 10
      })
    })

    it('throws error when client is not initialized', async () => {
      const module = await import('~/server/services/tavily')
      const serviceWithoutClient = new module.TavilyService()

      await expect(serviceWithoutClient.searchJapanNews()).rejects.toThrow(
        'Tavily client not initialized'
      )
    })

    it('handles API errors', async () => {
      mockTavilyClient.search.mockRejectedValue(new Error('API Error'))

      await expect(service.searchJapanNews()).rejects.toThrow(
        'Failed to search news with Tavily API'
      )
    })
  })

  describe('formatTavilyResultsToNewsItems', () => {
    it('formats Tavily results to NewsItem format', () => {
      const mockResponse = createMockTavilyResponse()

      const result = service.formatTavilyResultsToNewsItems(mockResponse)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        title: 'News 1',
        summary: 'News content 1...',
        content: 'News content 1',
        source: 'example.com',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Other',
        url: 'https://example.com/news1',
        score: 0.9
      })
    })

    it('maps known Japanese news domains', () => {
      const mockResponse = {
        results: [
          {
            url: 'https://nhk.or.jp/news',
            title: 'NHK News',
            score: 0.9,
            content: 'NHK content'
          }
        ]
      }

      const result = service.formatTavilyResultsToNewsItems(mockResponse)

      expect(result[0].source).toBe('NHK')
    })

    it('handles malformed URLs gracefully', () => {
      const mockResponse = {
        results: [
          {
            url: 'invalid-url',
            title: 'Invalid URL News',
            score: 0.9,
            content: 'Content'
          }
        ]
      }

      const result = service.formatTavilyResultsToNewsItems(mockResponse)

      expect(result[0].source).toBe('Unknown')
    })

    it('provides default values for missing fields', () => {
      const mockResponse = {
        results: [
          {
            url: 'https://example.com',
            title: '',
            score: 0.9,
            content: ''
          }
        ]
      }

      const result = service.formatTavilyResultsToNewsItems(mockResponse)

      expect(result[0].title).toBe('Untitled')
      expect(result[0].summary).toBe('...')
    })
  })
})