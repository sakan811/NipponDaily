import { GoogleGenAI, Type } from "@google/genai";
import type { NewsItem } from "../../types/index";
import {
  VALID_CATEGORIES,
  type CategoryName,
} from "../../constants/categories";

class GeminiService {
  private client: GoogleGenAI | null = null;

  private initializeClient(apiKey?: string) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured");
      return;
    }

    this.client = new GoogleGenAI({ apiKey });
  }

  private getModel(defaultModel?: string): string {
    return defaultModel || "gemini-2.5-flash";
  }

  /**
   * Categorize news items and generate summaries using Gemini AI
   */
  async categorizeNewsItems(
    newsItems: NewsItem[],
    options?: {
      apiKey?: string;
      model?: string;
      language?: string;
    },
  ): Promise<NewsItem[]> {
    // Initialize client with API key if not already done
    if (!this.client && options?.apiKey) {
      this.initializeClient(options.apiKey);
    }

    if (!this.client || newsItems.length === 0) {
      return newsItems;
    }

    try {
      const language = options?.language || "English";

      const newsText = newsItems
        .map(
          (item, index) =>
            `${index + 1}. Title: ${item.title}\n   Content: ${item.rawContent || item.content || item.summary}\n   Source: ${item.source}`,
        )
        .join("\n\n");

      const prompt = `You are a specialized AI assistant for categorizing Japanese news articles and generating summaries. Please analyze the following news articles and provide categorization, translated title, and concise summary for each one.

Target Language: ${language}
Available categories: ${VALID_CATEGORIES.filter((cat) => cat !== "Other").join(", ")}

${newsText}

For each article, provide category, translated title, and summary in the target language. Focus on accuracy and clarity.`;

      const response = await this.client.models.generateContent({
        model: this.getModel(options?.model),
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: `The news category. Must be one of: ${VALID_CATEGORIES.filter((cat) => cat !== "Other").join(", ")}, or Other`,
                },
                translatedTitle: {
                  type: Type.STRING,
                  description: `The title translated into ${language}`,
                },
                summary: {
                  type: Type.STRING,
                  description: `A concise summary (2-3 sentences maximum) in ${language}`,
                },
              },
              required: ["category", "translatedTitle", "summary"],
              propertyOrdering: ["category", "translatedTitle", "summary"],
            },
          },
        },
      });

      const text = response.text || "";

      // Parse structured JSON response
      try {
        const results = JSON.parse(text);
        if (Array.isArray(results) && results.length === newsItems.length) {
          return newsItems.map((item, index) => {
            const result = results[index];
            const aiSummary =
              result.summary && result.summary.trim() !== ""
                ? result.summary
                : null;
            const translatedTitle =
              result.translatedTitle && result.translatedTitle.trim() !== ""
                ? result.translatedTitle
                : item.title;

            return {
              ...item,
              title: translatedTitle,
              category: this.validateCategory(result.category),
              summary: aiSummary || item.summary || item.content,
              content: aiSummary || item.summary || item.content,
            };
          });
        }
      } catch (parseError) {
        console.warn(
          "Failed to parse structured response from Gemini:",
          parseError,
        );
      }

      // Fallback: return items with validated categories and prioritize rawContent
      return newsItems.map((item) => ({
        ...item,
        category: this.validateCategory(item.category),
        summary:
          item.rawContent && item.rawContent.trim() !== ""
            ? this.createBasicSummary(item.rawContent)
            : item.summary || item.content,
        content:
          item.rawContent && item.rawContent.trim() !== ""
            ? this.createBasicSummary(item.rawContent)
            : item.summary || item.content,
      }));
    } catch (error) {
      console.error("Error categorizing news with Gemini:", error);
      // Return items with validated categories and prioritize rawContent on error
      return newsItems.map((item) => ({
        ...item,
        category: this.validateCategory(item.category),
        summary:
          item.rawContent && item.rawContent.trim() !== ""
            ? this.createBasicSummary(item.rawContent)
            : item.summary || item.content,
        content:
          item.rawContent && item.rawContent.trim() !== ""
            ? this.createBasicSummary(item.rawContent)
            : item.summary || item.content,
      }));
    }
  }

  /**
   * Create a basic summary from raw content when AI fails
   */
  private createBasicSummary(rawContent: string): string {
    if (!rawContent || rawContent.trim() === "") {
      return "No content available";
    }

    // Remove extra whitespace and get first meaningful sentences
    const cleanContent = rawContent.replace(/\s+/g, " ").trim();
    const sentences = cleanContent.match(/[^.!?]+[.!?]+/g) || [cleanContent];

    // Take first 2-3 sentences or first 200 characters
    let summary = "";
    let charCount = 0;
    let sentenceCount = 0;

    for (const sentence of sentences) {
      if (charCount + sentence.length > 200 || sentenceCount >= 3) {
        break;
      }
      summary += sentence;
      charCount += sentence.length;
      sentenceCount++;
    }

    return summary.trim() || cleanContent.substring(0, 200).trim();
  }

  /**
   * Validate and normalize category name
   */
  private validateCategory(
    category: string,
  ): "Politics" | "Business" | "Technology" | "Culture" | "Sports" | "Other" {
    if (!category || typeof category !== "string") {
      return "Other";
    }

    const normalized = category.trim();

    // Check if it's a valid category
    if (VALID_CATEGORIES.includes(normalized as CategoryName)) {
      return normalized as CategoryName;
    }

    // Try to match case-insensitively
    const caseMatch = VALID_CATEGORIES.find(
      (valid) => valid.toLowerCase() === normalized.toLowerCase(),
    );

    return caseMatch || "Other";
  }
}

export { GeminiService };
export const geminiService = new GeminiService();
