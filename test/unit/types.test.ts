import { describe, it, expect } from 'vitest'
import type { NewsItem, ChatResponse, ApiResponse, ChatMessage, Category } from '~/types/index'

describe('Type Definitions', () => {
  describe('NewsItem', () => {
    it('accepts valid NewsItem structure', () => {
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
      expect(newsItem.url).toBeDefined()
    })

    it('allows optional URL', () => {
      const newsItem: NewsItem = {
        title: 'Test News',
        summary: 'Test Summary',
        content: 'Test Content',
        source: 'Test Source',
        publishedAt: '2024-01-15T10:00:00Z',
        category: 'Technology'
      }

      expect(newsItem.url).toBeUndefined()
    })
  })

  describe('ChatResponse', () => {
    it('accepts valid ChatResponse structure', () => {
      const chatResponse: ChatResponse = {
        message: 'Test response message',
        sources: ['Source 1', 'Source 2']
      }

      expect(chatResponse.message).toBe('Test response message')
      expect(chatResponse.sources).toHaveLength(2)
    })

    it('allows optional sources', () => {
      const chatResponse: ChatResponse = {
        message: 'Test response message'
      }

      expect(chatResponse.sources).toBeUndefined()
    })
  })

  describe('ApiResponse', () => {
    it('accepts valid ApiResponse structure', () => {
      const apiResponse: ApiResponse<NewsItem[]> = {
        success: true,
        data: [
          {
            title: 'Test News',
            summary: 'Test Summary',
            content: 'Test Content',
            source: 'Test Source',
            publishedAt: '2024-01-15T10:00:00Z',
            category: 'Technology'
          }
        ],
        count: 1,
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(apiResponse.success).toBe(true)
      expect(apiResponse.data).toHaveLength(1)
      expect(apiResponse.count).toBe(1)
    })

    it('allows generic data type', () => {
      const stringResponse: ApiResponse<string> = {
        success: true,
        data: 'Test data',
        timestamp: '2024-01-15T10:00:00Z'
      }

      expect(typeof stringResponse.data).toBe('string')
    })
  })

  describe('ChatMessage', () => {
    it('accepts valid ChatMessage structure', () => {
      const chatMessage: ChatMessage = {
        type: 'user',
        content: 'Hello, how are you?',
        timestamp: new Date(),
        sources: ['Source 1'],
        loading: false
      }

      expect(chatMessage.type).toBe('user')
      expect(chatMessage.content).toBe('Hello, how are you?')
      expect(chatMessage.sources).toHaveLength(1)
      expect(chatMessage.loading).toBe(false)
    })

    it('allows optional properties', () => {
      const chatMessage: ChatMessage = {
        type: 'bot',
        content: 'I am doing well, thank you!',
        timestamp: new Date()
      }

      expect(chatMessage.type).toBe('bot')
      expect(chatMessage.sources).toBeUndefined()
      expect(chatMessage.loading).toBeUndefined()
    })
  })

  describe('Category', () => {
    it('accepts valid Category structure', () => {
      const category: Category = {
        id: 'technology',
        name: 'Technology'
      }

      expect(category.id).toBe('technology')
      expect(category.name).toBe('Technology')
    })
  })
})