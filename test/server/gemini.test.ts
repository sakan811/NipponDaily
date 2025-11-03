import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NewsItem } from '~~/types/index'

let mockGenerateContent: any

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent
    }
  }))
}))

vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    geminiApiKey: 'test-key',
    geminiModel: 'gemini-2.5-flash'
  }))
}))

describe('GeminiService', () => {
  let service: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockGenerateContent = vi.fn()
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
        text: '["Technology"]'
      })

      const result = await service.categorizeNewsItems(mockNews)

      expect(result[0].category).toBe('Technology')
      expect(mockGenerateContent).toHaveBeenCalledTimes(1)
    })

    it('returns original items when client is not initialized', async () => {
      const module = await import('~/server/services/gemini')
      const serviceWithoutClient = new module.GeminiService()

      const mockNews = createMockNews()
      const result = await serviceWithoutClient.categorizeNewsItems(mockNews)

      expect(result).toEqual(mockNews)
    })

    it('returns empty array for empty input', async () => {
      const result = await service.categorizeNewsItems([])

      expect(result).toEqual([])
      expect(mockGenerateContent).not.toHaveBeenCalled()
    })

    it('handles malformed Gemini response', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockResolvedValue({
        text: 'invalid json response'
      })

      const result = await service.categorizeNewsItems(mockNews)

      expect(result[0].category).toBe('Other')
    })

    it('handles API errors gracefully', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockRejectedValue(new Error('API Error'))

      const result = await service.categorizeNewsItems(mockNews)

      expect(result[0].category).toBe('Other')
    })

    it('validates and normalizes category names', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockResolvedValue({
        text: '["technology"]' // lowercase
      })

      const result = await service.categorizeNewsItems(mockNews)

      expect(result[0].category).toBe('Technology')
    })

    it('defaults to "Other" for invalid categories', async () => {
      const mockNews = createMockNews()
      mockGenerateContent.mockResolvedValue({
        text: '["InvalidCategory"]'
      })

      const result = await service.categorizeNewsItems(mockNews)

      expect(result[0].category).toBe('Other')
    })
  })
})