import { GoogleGenAI, Type } from "@google/genai";
import type { NewsItem, CredibilityMetadata } from "../../types/index";
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

      const prompt = `You are a specialized AI assistant for categorizing Japanese news articles, generating summaries, and assessing source credibility. Please analyze the following news articles and provide categorization, translated title, summary, and credibility assessment for each one.

Target Language: ${language}
Available categories: ${VALID_CATEGORIES.filter((cat) => cat !== "Other").join(", ")}

${newsText}

For each article, provide:
1. Category from the available categories
2. Translated title in the target language
3. Concise summary (2-3 sentences maximum) in the target language
4. Credibility assessment (0-1 scale for each metric):
   - sourceReputation: How reputable is this news source? (0 = unknown/unreliable, 1 = highly reputable)
   - domainTrust: How trustworthy is the domain based on known news organizations? (0 = suspicious, 1 = established news domain)
   - contentQuality: How professional and well-written is the content? (0 = poor quality, 1 = high journalistic quality)
   - aiConfidence: How confident are you in the categorization and summarization? (0 = uncertain, 1 = very confident)

Focus on accuracy, clarity, and objective credibility assessment.`;

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
                sourceReputation: {
                  type: Type.NUMBER,
                  description: "Source reputation score from 0 to 1",
                },
                domainTrust: {
                  type: Type.NUMBER,
                  description: "Domain trust score from 0 to 1",
                },
                contentQuality: {
                  type: Type.NUMBER,
                  description: "Content quality score from 0 to 1",
                },
                aiConfidence: {
                  type: Type.NUMBER,
                  description: "AI confidence score from 0 to 1",
                },
              },
              required: ["category", "translatedTitle", "summary", "sourceReputation", "domainTrust", "contentQuality", "aiConfidence"],
              propertyOrdering: ["category", "translatedTitle", "summary", "sourceReputation", "domainTrust", "contentQuality", "aiConfidence"],
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

            // Create credibility metadata from AI response
            const credibilityMetadata: CredibilityMetadata = {
              sourceReputation: Math.min(1, Math.max(0, result.sourceReputation ?? 0.5)),
              domainTrust: Math.min(1, Math.max(0, result.domainTrust ?? 0.5)),
              contentQuality: Math.min(1, Math.max(0, result.contentQuality ?? 0.5)),
              aiConfidence: Math.min(1, Math.max(0, result.aiConfidence ?? 0.5)),
            };

            // Calculate overall credibility score (weighted average)
            const credibilityScore = (
              credibilityMetadata.sourceReputation * 0.3 +
              credibilityMetadata.domainTrust * 0.3 +
              credibilityMetadata.contentQuality * 0.2 +
              credibilityMetadata.aiConfidence * 0.2
            );

            return {
              ...item,
              title: translatedTitle,
              category: this.validateCategory(result.category),
              summary: aiSummary || item.summary || item.content,
              content: aiSummary || item.summary || item.content,
              credibilityScore,
              credibilityMetadata,
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
      return newsItems.map((item) => {
        const defaultCredibilityMetadata: CredibilityMetadata = {
          sourceReputation: 0.5, // Default neutral score
          domainTrust: this.getDomainTrustScore(item.source),
          contentQuality: 0.5,
          aiConfidence: 0.3, // Lower confidence since AI failed
        };

        const credibilityScore = (
          defaultCredibilityMetadata.sourceReputation * 0.3 +
          defaultCredibilityMetadata.domainTrust * 0.3 +
          defaultCredibilityMetadata.contentQuality * 0.2 +
          defaultCredibilityMetadata.aiConfidence * 0.2
        );

        return {
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
          credibilityScore,
          credibilityMetadata: defaultCredibilityMetadata,
        };
      });
    } catch (error) {
      console.error("Error categorizing news with Gemini:", error);
      // Return items with validated categories and prioritize rawContent on error
      return newsItems.map((item) => {
        const defaultCredibilityMetadata: CredibilityMetadata = {
          sourceReputation: 0.5, // Default neutral score
          domainTrust: this.getDomainTrustScore(item.source),
          contentQuality: 0.5,
          aiConfidence: 0.3, // Lower confidence since AI failed
        };

        const credibilityScore = (
          defaultCredibilityMetadata.sourceReputation * 0.3 +
          defaultCredibilityMetadata.domainTrust * 0.3 +
          defaultCredibilityMetadata.contentQuality * 0.2 +
          defaultCredibilityMetadata.aiConfidence * 0.2
        );

        return {
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
          credibilityScore,
          credibilityMetadata: defaultCredibilityMetadata,
        };
      });
    }
  }

  /**
   * Get domain trust score based on known reputable news sources
   */
  private getDomainTrustScore(source: string): number {
    const trustedDomains = [
      // 🇯🇵 Major / National Japanese News Sources (Highest Trust)
      { domains: ["nhk.or.jp", "nhk.com", "nhkworld.jp"], score: 0.95 }, // Japan's public broadcaster
      { domains: ["nikkei.com", "nikkei.co.jp", "asia.nikkei.com"], score: 0.95 }, // Nihon Keizai Shimbun - business focus

      // Major Japanese newspapers
      { domains: ["asahi.com", "asahi.co.jp", "digital.asahi.com"], score: 0.9 }, // Asahi Shimbun
      { domains: ["mainichi.jp", "mainichi.co.jp"], score: 0.9 }, // Mainichi Shimbun
      { domains: ["yomiuri.co.jp", "japanynews.yomiuri.co.jp"], score: 0.9 }, // Yomiuri Shimbun
      { domains: ["sankei.com", "sankei.co.jp"], score: 0.85 }, // Sankei Shimbun

      // Investigative and specialized sources
      { domains: ["tansa.jp", "tansa.co.jp"], score: 0.9 }, // Tansa - investigative journalism
      { domains: ["facta.co.jp"], score: 0.85 }, // Facta - business/investigative magazine

      // 🌐 English-Language / International-Facing Japanese News Sources
      { domains: ["japantimes.co.jp", "thejapantimes.jp"], score: 0.9 }, // The Japan Times
      { domains: ["kyodonews.net", "kyodo.co.jp"], score: 0.9 }, // Kyodo News wire service
      { domains: ["nippon.com"], score: 0.85 }, // Nippon.com - analysis and data

      // Japanese international services
      { domains: ["nhkworld.jp", "nhk.or.jp/nhkworld"], score: 0.9 }, // NHK World
      { domains: ["japantoday.com"], score: 0.75 }, // Japan Today - aggregator
      { domains: ["newsonjapan.com"], score: 0.75 }, // News On Japan - aggregator

      // 🧭 Other Respected International Sources
      { domains: ["reuters.com"], score: 0.85 }, // Reuters - strong Japan coverage
      { domains: ["bbc.com", "bbc.co.uk"], score: 0.8 }, // BBC News - global perspective
      { domains: ["apnews.com"], score: 0.8 }, // Associated Press
      { domains: ["bloomberg.com"], score: 0.85 }, // Bloomberg - business focus

      // Financial/business specialized
      { domains: ["ft.com"], score: 0.8 }, // Financial Times
      { domains: ["wsj.com", "wsj.asia"], score: 0.8 }, // Wall Street Journal Asia
      { domains: ["fortune.com"], score: 0.75 }, // Fortune
      { domains: ["automotivenews.com"], score: 0.7 }, // Automotive News

      // Regional Japanese media (still high trust)
      { domains: ["hokkaido-np.co.jp"], score: 0.8 }, // Hokkaido Shimbun
      { domains: ["chugoku-np.co.jp"], score: 0.8 }, // Chugoku Shimbun
      { domains: ["kobe-np.co.jp"], score: 0.8 }, // Kobe Shimbun
    ];

    // Check for obviously malformed sources first
    if (!source || source.trim() === "") {
      return 0.4; // Empty source
    }

    // Check for dangerous or obviously invalid protocols
    if (source.startsWith("javascript:") || source.startsWith("data:") || source.startsWith("vbscript:")) {
      return 0.4; // Dangerous protocol
    }

    try {
      // Extract domain from source if it's a URL
      let domain = source;
      if (source.startsWith("http")) {
        const urlObj = new URL(source);
        domain = urlObj.hostname;
      }

      domain = domain.toLowerCase();

      // Check if it looks like a valid domain (contains a dot and doesn't start with protocols)
      if (!domain.includes(".") || domain.startsWith("http")) {
        return 0.4; // Doesn't look like a valid domain
      }

      // Check against trusted domains
      for (const trusted of trustedDomains) {
        if (trusted.domains.some(trustedDomain => domain.includes(trustedDomain))) {
          return trusted.score;
        }
      }

      // Return moderate score for unknown but valid-looking domains
      return 0.6;
    } catch {
      // Return lower score for malformed sources
      return 0.4;
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
