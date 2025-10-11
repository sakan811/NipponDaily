import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock variables at module level
let mockGenerateContent: any
let mockRuntimeConfig: any

// Mock the modules
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent
    }
  }))
}))

describe('GeminiService', () => {
  let GeminiService: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    // Set up the mock
    mockGenerateContent = vi.fn()

    // Create a mock for useRuntimeConfig that we can control in each test
    mockRuntimeConfig = vi.fn()

    // Mock useRuntimeConfig globally
    global.useRuntimeConfig = mockRuntimeConfig
  })

  describe('fetchJapanNews', () => {
    it('should throw error when client is not initialized', async () => {
      // Mock runtime config with no API key
      mockRuntimeConfig.mockReturnValue({ geminiApiKey: null })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      await expect(service.fetchJapanNews()).rejects.toThrow('Gemini client not initialized')
    })

    it('should parse valid JSON response correctly', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

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

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News 1')
      expect(result[0].category).toBe('Technology')
    })

    it('should handle JSON embedded in text response', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

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

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News 1')
    })

    it('should use fallback parsing when JSON parsing fails', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      mockGenerateContent.mockResolvedValue({
        text: 'Title: Test News\nSummary: Test Summary\nSource: Test Source'
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News')
      expect(result[0].summary).toBe('Test Summary')
      expect(result[0].source).toBe('Test Source')
    })

    it('should provide default fallback when parsing fails completely', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      mockGenerateContent.mockResolvedValue({
        text: 'Just some plain text without structured data'
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Latest Japan News')
      expect(result[0].source).toBe('Gemini API')
    })

    it('should handle API errors gracefully', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      mockGenerateContent.mockRejectedValue(new Error('API Error'))

      await expect(service.fetchJapanNews()).rejects.toThrow('Failed to fetch news from Gemini API')
    })

    it('should provide default values for missing fields', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

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

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News 1')
      expect(result[0].summary).toBe('')
      expect(result[0].source).toBe('Unknown')
      expect(result[0].category).toBe('General')
    })
  })
})