import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CategoryName } from '~~/constants/categories'

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
          category: 'Technology' as CategoryName,
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
          category: 'Technology' as CategoryName,
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

    it('should handle multiple news items in fallback parsing', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const textWithMultipleItems = `Title: First News\nSummary: First Summary\nSource: First Source\nTitle: Second News\nSummary: Second Summary\nSource: Second Source`

      mockGenerateContent.mockResolvedValue({
        text: textWithMultipleItems
      })

      const result = await service.fetchJapanNews()

      // Should parse both news items (lines 146-148 cover the newsItems.push logic)
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('First News')
      expect(result[1].title).toBe('Second News')
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

    // Additional tests for error logging coverage (lines 129-130, 146-148)

    it('should log errors in development environment', async () => {
      process.env.NODE_ENV = 'development'

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const testError = new Error('Development test error')
      mockGenerateContent.mockRejectedValue(testError)

      try {
        await service.fetchJapanNews()
      } catch (error) {
        // Expected to throw
      }

      // Verify error was logged in development (lines 129-130)
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching news:', testError)

      consoleSpy.mockRestore()
    })

    it('should not log errors in production environment', async () => {
      process.env.NODE_ENV = 'production'

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const testError = new Error('Production test error')
      mockGenerateContent.mockRejectedValue(testError)

      try {
        await service.fetchJapanNews()
      } catch (error) {
        // Expected to throw
      }

      // Verify error was NOT logged in production (lines 129-130)
      expect(consoleSpy).not.toHaveBeenCalledWith('Error fetching news:', testError)

      consoleSpy.mockRestore()
    })

    it('should preserve error context through service layer', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const originalError = new Error('Original API error')
      originalError.stack = 'Original error stack trace'
      mockGenerateContent.mockRejectedValue(originalError)

      try {
        await service.fetchJapanNews()
        fail('Should have thrown an error')
      } catch (error: any) {
        // Verify the error is properly wrapped with context (lines 146-148)
        expect(error.message).toBe('Failed to fetch news from Gemini API')
        expect(error).not.toBe(originalError) // Should be a new error
      }
    })

    it('should handle different error types appropriately', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      // Test with string error
      mockGenerateContent.mockRejectedValue('String error message')

      try {
        await service.fetchJapanNews()
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.message).toBe('Failed to fetch news from Gemini API')
      }

      // Test with object error
      mockGenerateContent.mockRejectedValue({ message: 'Object error' })

      try {
        await service.fetchJapanNews()
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.message).toBe('Failed to fetch news from Gemini API')
      }
    })

    // Additional tests for uncovered branch conditions

    it('should use default model when geminiModel is undefined (line 27)', async () => {
      // Mock runtime config with undefined model
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: undefined
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const mockNewsData = [
        {
          title: 'Test News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: 'https://example.com/test'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockNewsData)
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News')
      // Verify the model call used the default value by checking it was called with correct model
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-1.5-flash' // Should use default model
        })
      )
    })

    it('should use default model when geminiModel is null (line 27)', async () => {
      // Mock runtime config with null model
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: null
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const mockNewsData = [
        {
          title: 'Test News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: 'https://example.com/test'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockNewsData)
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News')
      // Verify the model call used the default value
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-1.5-flash' // Should use default model
        })
      )
    })

    it('should use default model when geminiModel is empty string (line 27)', async () => {
      // Mock runtime config with empty string model
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: ''
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const mockNewsData = [
        {
          title: 'Test News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: 'https://example.com/test'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockNewsData)
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test News')
      // Verify the model call used the default value
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-1.5-flash' // Should use default model
        })
      )
    })

    it('should handle undefined response.text (line 102)', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      // Mock response with undefined text
      mockGenerateContent.mockResolvedValue({
        text: undefined
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Latest Japan News')
      expect(result[0].summary).toBe('Unable to fetch detailed news. Please try again later.')
      expect(result[0].source).toBe('Gemini API')
    })

    it('should handle null response.text (line 102)', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      // Mock response with null text
      mockGenerateContent.mockResolvedValue({
        text: null
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Latest Japan News')
      expect(result[0].summary).toBe('Unable to fetch detailed news. Please try again later.')
      expect(result[0].source).toBe('Gemini API')
    })

    it('should handle response without text property (line 102)', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      // Mock response without text property
      mockGenerateContent.mockResolvedValue({})

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Latest Japan News')
      expect(result[0].summary).toBe('Unable to fetch detailed news. Please try again later.')
      expect(result[0].source).toBe('Gemini API')
    })

    it('should handle undefined item title (line 113)', async () => {
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
          title: undefined,
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: 'https://example.com/test'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockNewsData)
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Untitled') // Should use fallback
      expect(result[0].summary).toBe('Test Summary')
    })

    it('should handle null item title (line 113)', async () => {
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
          title: null,
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: 'https://example.com/test'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockNewsData)
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Untitled') // Should use fallback
      expect(result[0].summary).toBe('Test Summary')
    })

    it('should handle empty string item title (line 113)', async () => {
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
          title: '',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Technology' as CategoryName,
          url: 'https://example.com/test'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify(mockNewsData)
      })

      const result = await service.fetchJapanNews()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Untitled') // Empty string is falsy, so uses fallback
      expect(result[0].summary).toBe('Test Summary')
    })
  })
})