import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GoogleGenAI } from '@google/genai'

// Mock the GoogleGenAI module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn()
    }
  }))
}))

// Mock Nuxt runtime config
const mockRuntimeConfig = {
  geminiApiKey: 'test-api-key',
  geminiModel: 'gemini-1.5-flash'
}

vi.mock('#app', () => ({
  useRuntimeConfig: () => mockRuntimeConfig
}))

describe('GeminiService', () => {
  let GeminiService: any
  let geminiService: any
  let mockGenerateContent: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Import the service after mocking
    const module = await import('~/server/services/gemini')
    GeminiService = module.GeminiService
    geminiService = module.geminiService

    mockGenerateContent = vi.fn()
    ;(GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    }))
  })

  describe('fetchJapanNews', () => {
    it('should throw error when client is not initialized', async () => {
      // Mock no API key
      vi.doMock('#app', () => ({
        useRuntimeConfig: () => ({ geminiApiKey: null })
      }))

      const { GeminiService: GeminiServiceNoKey } = await import('~/server/services/gemini')
      const serviceNoKey = new GeminiServiceNoKey()

      await expect(serviceNoKey.fetchJapanNews()).rejects.toThrow('Gemini client not initialized')
    })

    it('should parse valid JSON response correctly', async () => {
      const mockNewsData = [
        {
          title: 'Test News 1',
          summary: 'Test Summary 1',
          content: 'Test Content 1',
          source: 'Test Source 1',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology',
          url: 'https://example.com/1'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockNewsData)
      })

      const result = await geminiService.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News 1')
      expect(result[0].category).toBe('Technology')
    })

    it('should handle JSON embedded in text response', async () => {
      const mockNewsData = [
        {
          title: 'Test News 1',
          summary: 'Test Summary 1',
          content: 'Test Content 1',
          source: 'Test Source 1',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology',
          url: 'https://example.com/1'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: `Here is the news data: ${JSON.stringify(mockNewsData)} Additional text here.`
      })

      const result = await geminiService.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News 1')
    })

    it('should use fallback parsing when JSON parsing fails', async () => {
      mockGenerateContent.mockResolvedValue({
        text: 'Title: Test News\nSummary: Test Summary\nSource: Test Source'
      })

      const result = await geminiService.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News')
      expect(result[0].summary).toBe('Test Summary')
      expect(result[0].source).toBe('Test Source')
    })

    it('should provide default fallback when parsing fails completely', async () => {
      mockGenerateContent.mockResolvedValue({
        text: 'Just some plain text without structured data'
      })

      const result = await geminiService.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Latest Japan News')
      expect(result[0].source).toBe('Gemini API')
    })

    it('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'))

      await expect(geminiService.fetchJapanNews()).rejects.toThrow('Failed to fetch news from Gemini API')
    })

    it('should provide default values for missing fields', async () => {
      const incompleteData = [
        {
          title: 'Test News 1',
          summary: '',
          content: '',
          source: '',
          publishedAt: '',
          category: '',
          url: ''
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(incompleteData)
      })

      const result = await geminiService.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News 1')
      expect(result[0].summary).toBe('')
      expect(result[0].source).toBe('Unknown')
      expect(result[0].category).toBe('General')
    })
  })

  describe('chatAboutNews', () => {
    it('should throw error when client is not initialized', async () => {
      vi.doMock('#app', () => ({
        useRuntimeConfig: () => ({ geminiApiKey: null })
      }))

      const { GeminiService: GeminiServiceNoKey } = await import('~/server/services/gemini')
      const serviceNoKey = new GeminiServiceNoKey()

      await expect(serviceNoKey.chatAboutNews('test', [])).rejects.toThrow('Gemini client not initialized')
    })

    it('should generate chat response with news context', async () => {
      const mockNews = [
        {
          title: 'Test News 1',
          summary: 'Test Summary 1',
          content: 'Test Content 1',
          source: 'Test Source 1',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: 'This is a response about the news'
      })

      const result = await geminiService.chatAboutNews('What is this news about?', mockNews)

      expect(result.message).toBe('This is a response about the news')
      expect(result.sources).toContain('Test Source 1')
    })

    it('should limit news context to 5 items', async () => {
      const mockNews = Array.from({ length: 10 }, (_, i) => ({
        title: `Test News ${i + 1}`,
        summary: `Test Summary ${i + 1}`,
        content: `Test Content ${i + 1}`,
        source: `Test Source ${i + 1}`,
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }))

      mockGenerateContent.mockResolvedValue({
        text: 'Response about limited news'
      })

      await geminiService.chatAboutNews('What is this news about?', mockNews)

      const prompt = mockGenerateContent.mock.calls[0][0].contents
      expect(prompt).toContain('Test News 1')
      expect(prompt).toContain('Test News 5')
      expect(prompt).not.toContain('Test News 6')
    })

    it('should limit sources to 3 items', async () => {
      const mockNews = Array.from({ length: 5 }, (_, i) => ({
        title: `Test News ${i + 1}`,
        summary: `Test Summary ${i + 1}`,
        content: `Test Content ${i + 1}`,
        source: `Test Source ${i + 1}`,
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }))

      mockGenerateContent.mockResolvedValue({
        text: 'Response with sources'
      })

      const result = await geminiService.chatAboutNews('What is this news about?', mockNews)

      expect(result.sources).toHaveLength(3)
      expect(result.sources).toEqual(['Test Source 1', 'Test Source 2', 'Test Source 3'])
    })

    it('should handle API errors in chat', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Chat API Error'))

      await expect(geminiService.chatAboutNews('test', [])).rejects.toThrow('Failed to process chat message')
    })
  })

  describe('summarizeNews', () => {
    it('should throw error when client is not initialized', async () => {
      vi.doMock('#app', () => ({
        useRuntimeConfig: () => ({ geminiApiKey: null })
      }))

      const { GeminiService: GeminiServiceNoKey } = await import('~/server/services/gemini')
      const serviceNoKey = new GeminiServiceNoKey()

      const newsItem = {
        title: 'Test News',
        summary: 'Test Summary',
        content: 'Test Content',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }

      await expect(serviceNoKey.summarizeNews(newsItem)).rejects.toThrow('Gemini client not initialized')
    })

    it('should generate news summary', async () => {
      const newsItem = {
        title: 'Test News',
        summary: 'Test Summary',
        content: 'Test Content',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }

      mockGenerateContent.mockResolvedValue({
        text: 'Generated summary'
      })

      const result = await geminiService.summarizeNews(newsItem)

      expect(result).toBe('Generated summary')
    })

    it('should return original summary on API error', async () => {
      const newsItem = {
        title: 'Test News',
        summary: 'Original Summary',
        content: 'Test Content',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }

      mockGenerateContent.mockRejectedValue(new Error('Summary API Error'))

      const result = await geminiService.summarizeNews(newsItem)

      expect(result).toBe('Original Summary')
    })

    it('should handle empty API response', async () => {
      const newsItem = {
        title: 'Test News',
        summary: 'Original Summary',
        content: 'Test Content',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }

      mockGenerateContent.mockResolvedValue({
        text: ''
      })

      const result = await geminiService.summarizeNews(newsItem)

      expect(result).toBe('Original Summary')
    })
  })

  describe('getModel', () => {
    it('should return configured model', () => {
      mockRuntimeConfig.geminiModel = 'gemini-2.0-flash'

      // Re-import to get updated config
      vi.resetModules()
      vi.doMock('#app', () => ({
        useRuntimeConfig: () => mockRuntimeConfig
      }))

      return import('~/server/services/gemini').then(({ GeminiService }) => {
        const service = new GeminiService()
        expect(service.getModel?.()).toBe('gemini-2.0-flash')
      })
    })

    it('should return default model when not configured', () => {
      mockRuntimeConfig.geminiModel = undefined

      vi.resetModules()
      vi.doMock('#app', () => ({
        useRuntimeConfig: () => mockRuntimeConfig
      }))

      return import('~/server/services/gemini').then(({ GeminiService }) => {
        const service = new GeminiService()
        expect(service.getModel?.()).toBe('gemini-1.5-flash')
      })
    })
  })
})