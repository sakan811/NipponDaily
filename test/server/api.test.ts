import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NewsItem } from '~~/types/index'

// Mock services with correct method names
const mockTavilySearch = vi.fn()
const mockTavilyFormat = vi.fn()
const mockGeminiCategorize = vi.fn()

vi.mock('~/server/services/tavily', () => ({
  tavilyService: {
    searchJapanNews: mockTavilySearch,
    formatTavilyResultsToNewsItems: mockTavilyFormat
  }
}))

vi.mock('~/server/services/gemini', () => ({
  geminiService: {
    categorizeNewsItems: mockGeminiCategorize
  }
}))

// Mock h3 utilities
vi.mock('h3', () => ({
  getQuery: vi.fn(() => ({})),
  createError: vi.fn((error) => error)
}))

// Mock Nuxt runtime config
vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    tavilyApiKey: 'test-key',
    geminiApiKey: 'test-key'
  }))
}))

describe('News API', () => {
  let handler: any
  let mockGetQuery: any

  beforeEach(async () => {
    vi.clearAllMocks()
    delete process.env.NODE_ENV

    const handlerModule = await import('~/server/api/news.get')
    handler = handlerModule.default
    mockGetQuery = vi.mocked(require('h3').getQuery)
  })

  const createMockNews = (): NewsItem[] => [
    {
      title: 'Tech News',
      summary: 'Tech Summary',
      content: 'Tech Content',
      source: 'Tech Source',
      publishedAt: '2024-01-15T10:00:00Z',
      category: 'Technology',
      url: 'https://example.com'
    }
  ]

  it('returns news successfully with default parameters', async () => {
    mockGetQuery.mockReturnValue({})
    mockTavilySearch.mockResolvedValue({ results: [] })
    mockTavilyFormat.mockReturnValue([])
    mockGeminiCategorize.mockResolvedValue([])

    const response = await handler({})

    expect(response.success).toBe(true)
    expect(response.data).toEqual([])
    expect(response.count).toBe(0)
    expect(response.timestamp).toBeDefined()
  })

  it('filters news by category', async () => {
    const mockNews = createMockNews()
    mockGetQuery.mockReturnValue({ category: 'technology' })
    mockTavilySearch.mockResolvedValue({ results: [] })
    mockTavilyFormat.mockReturnValue(mockNews)
    mockGeminiCategorize.mockResolvedValue(mockNews)

    const response = await handler({})

    expect(response.success).toBe(true)
    expect(response.data).toHaveLength(1)
    expect(mockTavilySearch).toHaveBeenCalledWith({ maxResults: 10 })
  })

  it('applies limit parameter', async () => {
    const mockNews = Array.from({ length: 5 }, (_, i) => ({
      title: `News ${i}`,
      summary: `Summary ${i}`,
      content: `Content ${i}`,
      source: `Source ${i}`,
      publishedAt: '2024-01-15T10:00:00Z',
      category: 'Technology',
      url: `https://example.com/${i}`
    }))

    mockGetQuery.mockReturnValue({ limit: '3' })
    mockTavilySearch.mockResolvedValue({ results: [] })
    mockTavilyFormat.mockReturnValue(mockNews)
    mockGeminiCategorize.mockResolvedValue(mockNews)

    const response = await handler({})

    expect(response.data).toHaveLength(3)
    expect(response.count).toBe(3)
  })

  it('handles invalid limit parameter', async () => {
    mockGetQuery.mockReturnValue({ limit: 'invalid' })
    mockTavilySearch.mockResolvedValue({ results: [] })
    mockTavilyFormat.mockReturnValue([])
    mockGeminiCategorize.mockResolvedValue([])

    const response = await handler({})

    expect(response.data).toHaveLength(0)
  })

  it('returns all news when category is "all"', async () => {
    const mockNews = createMockNews()
    mockGetQuery.mockReturnValue({ category: 'all' })
    mockTavilySearch.mockResolvedValue({ results: [] })
    mockTavilyFormat.mockReturnValue(mockNews)
    mockGeminiCategorize.mockResolvedValue(mockNews)

    const response = await handler({})

    expect(response.success).toBe(true)
    expect(response.data).toHaveLength(1)
  })

  it('handles service errors', async () => {
    const error = new Error('Service error')
    mockGetQuery.mockReturnValue({})
    mockTavilySearch.mockRejectedValue(error)

    await expect(handler({})).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to fetch news',
      data: { error: 'Service error' }
    })
  })

  it('logs errors in development environment', async () => {
    process.env.NODE_ENV = 'development'
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Dev error')
    mockGetQuery.mockReturnValue({})
    mockTavilySearch.mockRejectedValue(error)

    try {
      await handler({})
    } catch {}

    expect(consoleSpy).toHaveBeenCalledWith('News API error:', error)
    consoleSpy.mockRestore()
  })
})