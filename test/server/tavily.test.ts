import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockTavilyClient } from '../setup'

describe('TavilyService', () => {
  let service: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockTavilyClient.search = vi.fn()
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

      const result = await service.searchJapanNews({ maxResults: 5, apiKey: 'test-tavily-key' })

      expect(mockTavilyClient.search).toHaveBeenCalledWith('latest news Japan', {
        topic: 'news',
        max_results: 5,
        includeRawContent: true
      })
      expect(result).toEqual(mockResponse)
    })

    it('includes category in search query when provided', async () => {
      const mockResponse = createMockTavilyResponse()
      mockTavilyClient.search.mockResolvedValue(mockResponse)

      await service.searchJapanNews({ category: 'technology', apiKey: 'test-tavily-key' })

      expect(mockTavilyClient.search).toHaveBeenCalledWith('latest technology news Japan', {
        topic: 'news',
        max_results: 10,
        includeRawContent: true
      })
    })

    it('uses default query when category is all', async () => {
      const mockResponse = createMockTavilyResponse()
      mockTavilyClient.search.mockResolvedValue(mockResponse)

      await service.searchJapanNews({ category: 'all', apiKey: 'test-tavily-key' })

      expect(mockTavilyClient.search).toHaveBeenCalledWith('latest news Japan', {
        topic: 'news',
        max_results: 10,
        includeRawContent: true
      })
    })

    it('uses default query when category is not provided', async () => {
      const mockResponse = createMockTavilyResponse()
      mockTavilyClient.search.mockResolvedValue(mockResponse)

      await service.searchJapanNews({ apiKey: 'test-tavily-key' })

      expect(mockTavilyClient.search).toHaveBeenCalledWith('latest news Japan', {
        topic: 'news',
        max_results: 10,
        includeRawContent: true
      })
    })

    it('throws error when client is not initialized', async () => {
      const module = await import('~/server/services/tavily')
      const serviceWithoutClient = new module.TavilyService()

      await expect(serviceWithoutClient.searchJapanNews()).rejects.toThrow(
        'Tavily client not initialized - API key required'
      )
    })

    it('handles API errors', async () => {
      mockTavilyClient.search.mockRejectedValue(new Error('API Error'))

      await expect(service.searchJapanNews({ apiKey: 'test-tavily-key' })).rejects.toThrow(
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
        summary: 'News content 1',
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
      expect(result[0].summary).toBe('')
    })
  })

  describe('searchGeneral', () => {
    it('searches general queries successfully', async () => {
      const mockResponse = createMockTavilyResponse()
      mockTavilyClient.search.mockResolvedValue(mockResponse)

      const result = await service.searchGeneral('test query', 5, 'test-tavily-key')

      expect(mockTavilyClient.search).toHaveBeenCalledWith('test query', {
        max_results: 5
      })
      expect(result).toEqual(mockResponse)
    })

    it('initializes client when called on fresh service instance', async () => {
      const module = await import('~/server/services/tavily')
      const freshService = new module.TavilyService()
      const mockResponse = createMockTavilyResponse()
      mockTavilyClient.search.mockResolvedValue(mockResponse)

      const result = await freshService.searchGeneral('test query', 5, 'test-tavily-key')

      expect(mockTavilyClient.search).toHaveBeenCalledWith('test query', {
        max_results: 5
      })
      expect(result).toEqual(mockResponse)
    })

    it('uses default maxResults when not provided', async () => {
      const mockResponse = createMockTavilyResponse()
      mockTavilyClient.search.mockResolvedValue(mockResponse)

      await service.searchGeneral('test query', undefined, 'test-tavily-key')

      expect(mockTavilyClient.search).toHaveBeenCalledWith('test query', {
        max_results: 5
      })
    })

    it('throws error when client is not initialized', async () => {
      const module = await import('~/server/services/tavily')
      const serviceWithoutClient = new module.TavilyService()

      await expect(serviceWithoutClient.searchGeneral('test query')).rejects.toThrow(
        'Tavily client not initialized - API key required'
      )
    })

    it('handles API errors', async () => {
      mockTavilyClient.search.mockRejectedValue(new Error('API Error'))

      await expect(service.searchGeneral('test query', 5, 'test-tavily-key')).rejects.toThrow(
        'Failed to search with Tavily API'
      )
    })
  })

  describe('initializeClient', () => {
    it('logs warning when API key is not provided', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const module = await import('~/server/services/tavily')
      const service = new module.TavilyService()

      // Access private method using bracket notation
      service['initializeClient']()

      expect(consoleSpy).toHaveBeenCalledWith('TAVILY_API_KEY not configured')

      consoleSpy.mockRestore()
    })
  })
})