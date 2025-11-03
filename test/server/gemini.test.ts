import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NewsItem } from '~~/types/index'
import { mockGenerateContent } from '../setup'

// Mock useRuntimeConfig with hoisted mock
const { mockUseRuntimeConfig } = vi.hoisted(() => {
  const mockUseRuntimeConfig = vi.fn(() => ({
    geminiApiKey: 'test-api-key',
    geminiModel: 'gemini-1.5-flash'
  }))
  return { mockUseRuntimeConfig }
})

vi.mock('#app', () => ({
  useRuntimeConfig: mockUseRuntimeConfig
}))

describe('GeminiService', () => {
  let service: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('~/server/services/gemini')
    service = module.geminiService
  })

  const createMockNews = (): NewsItem[] => [
    {
      title: 'Tech News',
      summary: 'Tech Summary',
      content: 'Tech Content',
      source: 'Tech Source',
      publishedAt: '2024-01-15T10:00:00Z',
      category: 'Other'
    }
  ]

  describe('categorizeNewsItems', () => {
    it('categorizes news items successfully', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "Technology", "summary": "Test summary"}]'
      })

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: 'test-api-key',
        model: 'gemini-1.5-flash'
      })

      expect(result[0].category).toBe('Technology')
      expect(result[0].summary).toBe('Test summary')
      expect(mockGenerateContent).toHaveBeenCalledTimes(1)
    })

    it('returns original items when client is not initialized', async () => {
      const module = await import('~/server/services/gemini')
      const serviceWithoutClient = new module.GeminiService()

      const mockNews = createMockNews()
      const result = await serviceWithoutClient.categorizeNewsItems(mockNews)

      expect(result).toEqual(mockNews.map(item => ({
        ...item,
        category: 'Other',
        summary: item.summary || item.content
      })))
    })

    it('returns empty array for empty input', async () => {
      const result = await service.categorizeNewsItems([], {
        apiKey: 'test-api-key'
      })

      expect(result).toEqual([])
      expect(mockGenerateContent).not.toHaveBeenCalled()
    })

    it('handles malformed Gemini response', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockResolvedValue({
        text: 'invalid json response'
      })

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: 'test-api-key'
      })

      expect(result[0].category).toBe('Other')
    })

    it('handles API errors gracefully', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockRejectedValue(new Error('API Error'))

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: 'test-api-key'
      })

      expect(result[0].category).toBe('Other')
    })

    it('validates and normalizes category names', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "technology", "summary": "Test summary"}]' // lowercase
      })

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: 'test-api-key'
      })

      expect(result[0].category).toBe('Technology')
    })

    it('defaults to "Other" for invalid categories', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockResolvedValue({
        text: '[{"category": "InvalidCategory", "summary": "Test summary"}]'
      })

      const result = await service.categorizeNewsItems(mockNews, {
        apiKey: 'test-api-key'
      })

      expect(result[0].category).toBe('Other')
    })
  })
})