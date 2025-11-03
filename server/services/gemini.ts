import { GoogleGenAI } from '@google/genai'
import type { NewsItem } from '../../types/index'
import { VALID_CATEGORIES } from '../../constants/categories'


class GeminiService {
  private client: GoogleGenAI | null = null

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured')
      return
    }

    this.client = new GoogleGenAI({ apiKey })
  }

  private getModel(): string {
    const config = useRuntimeConfig()
    return config.geminiModel || 'gemini-2.5-flash'
  }

  /**
   * Categorize news items using Gemini AI
   */
  async categorizeNewsItems(newsItems: NewsItem[]): Promise<NewsItem[]> {
    if (!this.client || newsItems.length === 0) {
      return newsItems
    }

    try {
      const newsText = newsItems.map((item, index) =>
        `${index + 1}. Title: ${item.title}\n   Content: ${item.content || item.summary}\n   Source: ${item.source}`
      ).join('\n\n')

      const prompt = `You are a specialized AI assistant for categorizing Japanese news articles. Please analyze the following news articles and categorize each one.

Available categories: ${VALID_CATEGORIES.filter(cat => cat !== 'Other').join(', ')}

${newsText}

For each article, provide only the category name. Format your response as a JSON array where each element is the category for the corresponding article.

Example format:
["Politics", "Business", "Technology", "Culture"]

Requirements:
- Use exactly one category from the available list
- Choose the most appropriate primary category for each article
- If no category fits well, use "Other"
- Response must be a valid JSON array
- Order must match the input articles`

      const response = await this.client.models.generateContent({
        model: this.getModel(),
        contents: prompt
      })

      const text = response.text || ''

      // Try to parse JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          const categories = JSON.parse(jsonMatch[0])
          if (Array.isArray(categories) && categories.length === newsItems.length) {
            return newsItems.map((item, index) => ({
              ...item,
              category: this.validateCategory(categories[index])
            }))
          }
        } catch (parseError) {
          console.warn('Failed to parse categories from Gemini response:', parseError)
        }
      }

      // Fallback: return items with original categories or "Other"
      return newsItems.map(item => ({
        ...item,
        category: this.validateCategory(item.category)
      }))

    } catch (error) {
      console.error('Error categorizing news with Gemini:', error)
      // Return items with validated categories on error
      return newsItems.map(item => ({
        ...item,
        category: this.validateCategory(item.category)
      }))
    }
  }

  /**
   * Validate and normalize category name
   */
  private validateCategory(category: string): "Politics" | "Business" | "Technology" | "Culture" | "Sports" | "Other" {
    if (!category || typeof category !== 'string') {
      return 'Other'
    }

    const normalized = category.trim()

    // Check if it's a valid category
    if (VALID_CATEGORIES.includes(normalized as any)) {
      return normalized as any
    }

    // Try to match case-insensitively
    const caseMatch = VALID_CATEGORIES.find(
      valid => valid.toLowerCase() === normalized.toLowerCase()
    )

    return (caseMatch as any) || 'Other'
  }
}

export { GeminiService }
export const geminiService = new GeminiService()