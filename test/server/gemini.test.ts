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

  describe('categorizeNewsItems', () => {
    it('should return items unchanged when client is not initialized', async () => {
      // Mock runtime config with no API key
      mockRuntimeConfig.mockReturnValue({ geminiApiKey: null })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const mockNewsItems = [
        {
          title: 'Test News 1',
          summary: 'Test Summary 1',
          content: 'Test Content 1',
          source: 'Test Source 1',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Other',
          url: 'https://example.com/1'
        }
      ]

      const result = await service.categorizeNewsItems(mockNewsItems)

      expect(result).toEqual(mockNewsItems)
    })

    it('should categorize news items correctly with valid Gemini response', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const mockNewsItems = [
        {
          title: 'Politics: New Election Announced',
          summary: 'Test Summary 1',
          content: 'Test Content 1',
          source: 'Test Source 1',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Other',
          url: 'https://example.com/1'
        },
        {
          title: 'Tech Company Launches New Product',
          summary: 'Test Summary 2',
          content: 'Test Content 2',
          source: 'Test Source 2',
          publishedAt: '2024-01-15T11:00:00Z',
          category: 'Other',
          url: 'https://example.com/2'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: '["Politics", "Technology"]'
      })

      const result = await service.categorizeNewsItems(mockNewsItems)

      expect(result).toHaveLength(2)
      expect(result[0].category).toBe('Politics')
      expect(result[1].category).toBe('Technology')
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

      const mockNewsItems = [
        {
          title: 'Business News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Other',
          url: 'https://example.com/1'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: `Here are the categories: ["Business"] Additional text here.`
      })

      const result = await service.categorizeNewsItems(mockNewsItems)

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Business')
    })

    it('should fallback to validated categories when JSON parsing fails', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const mockNewsItems = [
        {
          title: 'Some News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Invalid Category',
          url: 'https://example.com/1'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: 'Just plain text without JSON'
      })

      const result = await service.categorizeNewsItems(mockNewsItems)

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Other') // Should validate to 'Other'
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

      const mockNewsItems = [
        {
          title: 'Test News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Business',
          url: 'https://example.com/1'
        }
      ]

      mockGenerateContent.mockRejectedValue(new Error('API Error'))

      const result = await service.categorizeNewsItems(mockNewsItems)

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Business') // Should return with validated original category
    })

    it('should return items unchanged when array is empty', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const result = await service.categorizeNewsItems([])

      expect(result).toEqual([])
    })

    it('should validate categories that are not in valid list', async () => {
      // Mock runtime config with API key
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: 'gemini-1.5-flash'
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const mockNewsItems = [
        {
          title: 'Test News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Invalid Category',
          url: 'https://example.com/1'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: '["Invalid Category"]'
      })

      const result = await service.categorizeNewsItems(mockNewsItems)

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Other') // Should validate invalid category to 'Other'
    })

    it('should use default model when geminiModel is undefined', async () => {
      // Mock runtime config with undefined model
      mockRuntimeConfig.mockReturnValue({
        geminiApiKey: 'test-api-key',
        geminiModel: undefined
      })

      // Import service with mock config
      const { GeminiService: TestGeminiService } = await import('~/server/services/gemini')
      const service = new TestGeminiService()

      const mockNewsItems = [
        {
          title: 'Test News',
          summary: 'Test Summary',
          content: 'Test Content',
          source: 'Test Source',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Other',
          url: 'https://example.com/1'
        }
      ]

      mockGenerateContent.mockResolvedValue({
        text: '["Technology"]'
      })

      await service.categorizeNewsItems(mockNewsItems)

      // Verify the model call used the default value
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-1.5-flash' // Should use default model
        })
      )
    })
  })
})