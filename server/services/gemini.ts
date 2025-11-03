import { GoogleGenAI } from '@google/genai'
import type { NewsItem } from '../../types/index'
import { VALID_CATEGORIES } from '../../constants/categories'


class GeminiService {
  private client: GoogleGenAI | null = null

  private initializeClient(apiKey?: string) {
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured')
      return
    }

    this.client = new GoogleGenAI({ apiKey })
  }

  private getModel(defaultModel?: string): string {
    return defaultModel || 'gemini-2.5-flash'
  }

  /**
   * Categorize news items and generate summaries using Gemini AI
   */
  async categorizeNewsItems(newsItems: NewsItem[], options?: {
    apiKey?: string
    model?: string
  }): Promise<NewsItem[]> {
    // Initialize client with API key if not already done
    if (!this.client && options?.apiKey) {
      this.initializeClient(options.apiKey)
    }

    if (!this.client || newsItems.length === 0) {
      return newsItems
    }

    try {
      const newsText = newsItems.map((item, index) =>
        `${index + 1}. Title: ${item.title}\n   Content: ${item.rawContent || item.content || item.summary}\n   Source: ${item.source}`
      ).join('\n\n')

      const prompt = `You are a specialized AI assistant for categorizing Japanese news articles and generating summaries. Please analyze the following news articles and provide both categorization and a concise summary for each one.

Available categories: ${VALID_CATEGORIES.filter(cat => cat !== 'Other').join(', ')}

${newsText}

For each article, provide a JSON object with both category and summary. Format your response as a JSON array where each element contains the category and a concise summary for the corresponding article.

Example format:
[
  {"category": "Politics", "summary": "Former Prime Minister Abe's assassination trial begins with suspect's guilty plea"},
  {"category": "Business", "summary": "Trump and Japanese PM announce major trade agreements and investment deals"}
]

Requirements:
- Use exactly one category from the available list for each article
- Choose the most appropriate primary category for each article
- Generate a concise, informative summary (2-3 sentences maximum) based on the raw content
- If no category fits well, use "Other"
- Response must be a valid JSON array
- Order must match the input articles
- Focus on the key information and main point of each article`

      const response = await this.client.models.generateContent({
        model: this.getModel(options?.model),
        contents: prompt
      })

      const text = response.text || ''

      // Try to parse JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          const results = JSON.parse(jsonMatch[0])
          if (Array.isArray(results) && results.length === newsItems.length) {
            return newsItems.map((item, index) => {
              const result = results[index]
              return {
                ...item,
                category: this.validateCategory(result.category),
                summary: result.summary || item.summary || item.content,
                content: result.summary || item.summary || item.content
              }
            })
          }
        } catch (parseError) {
          console.warn('Failed to parse categories and summaries from Gemini response:', parseError)
        }
      }

      // Fallback: return items with original categories and content
      return newsItems.map(item => ({
        ...item,
        category: this.validateCategory(item.category),
        summary: item.summary || item.content,
        content: item.summary || item.content
      }))

    } catch (error) {
      console.error('Error categorizing news with Gemini:', error)
      // Return items with validated categories on error
      return newsItems.map(item => ({
        ...item,
        category: this.validateCategory(item.category),
        summary: item.summary || item.content,
        content: item.summary || item.content
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