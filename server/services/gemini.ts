import { GoogleGenAI, Type } from "@google/genai";
import type { NewsItem, NewsBriefing, BriefingSource } from "../../types/index";

class GeminiService {
  private client: GoogleGenAI | null = null;

  private initializeClient(apiKey?: string) {
    if (!apiKey) return;
    this.client = new GoogleGenAI({ apiKey });
  }

  private getModels(defaultModel?: string): string[] {
    const modelStr = defaultModel || "gemini-2.5-flash,gemini-3-flash-preview";
    const models = modelStr.split(",").map((m) => m.trim()).filter(Boolean);
    if (models.length === 0) return ["gemini-2.5-flash"];
    return [...models].sort(() => Math.random() - 0.5);
  }

  private validateLocaleCode(input?: string | null): string {
    if (!input || typeof input !== "string") return "en";
    const normalized = input.trim().toLowerCase();
    const LOCALE_PATTERN = /^[a-z]{2}(?:_[a-z]{2})?$/;
    return LOCALE_PATTERN.test(normalized) ? normalized : "en";
  }

  private getDomainTrustScore(source: string): number {
    // simplified for brevity, keep your original trustedDomains logic here!
    if (!source) return 0.4;
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes("nhk") || lowerSource.includes("nikkei")) return 0.95;
    if (lowerSource.includes("asahi") || lowerSource.includes("yomiuri")) return 0.9;
    return 0.6; 
  }

  async generateNewsBriefing(
    newsItems: NewsItem[],
    options?: { apiKey?: string; model?: string; language?: string }
  ): Promise<NewsBriefing> {
    if (!this.client && options?.apiKey) this.initializeClient(options.apiKey);

    if (!this.client || newsItems.length === 0) {
      return this.getFallbackBriefing(newsItems);
    }

    try {
      const localeCode = this.validateLocaleCode(options?.language);
      
      const newsText = newsItems
        .map((item, i) => `[Source ${i + 1}] Title: ${item.title}\nContent: ${item.rawContent || item.summary}\nPublisher: ${item.source}\nURL: ${item.url}`)
        .join("\n\n---\n\n");

      const prompt = `You are an expert intelligence analyst specializing in Japanese news. Read the following articles and synthesize them into a single, cohesive briefing.
Target Language (ISO 639-1): ${localeCode}

Instructions:
1. mainHeadline: Create a single, overarching headline that captures the most important theme across these articles.
2. executiveSummary: Write a 2-paragraph synthesis of what is happening.
3. thematicAnalysis: Explain HOW these articles relate to each other. Do they corroborate each other? Do they show contrasting viewpoints? What is the broader implication?
4. overallCredibilityScore: Assess the collective reliability (0.0 to 1.0) based on the publishers provided.
5. sourcesProcessed: List the sources you used, translating their titles into the target language.

Raw Articles:
${newsText}`;

      const modelsToTry = this.getModels(options?.model);
      let response = null;

      for (const model of modelsToTry) {
        try {
          response = await this.client.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  mainHeadline: { type: Type.STRING },
                  executiveSummary: { type: Type.STRING },
                  thematicAnalysis: { type: Type.STRING },
                  overallCredibilityScore: { type: Type.NUMBER },
                  sourcesProcessed: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        source: { type: Type.STRING },
                        url: { type: Type.STRING }
                      },
                      required: ["title", "source", "url"]
                    }
                  }
                },
                required: ["mainHeadline", "executiveSummary", "thematicAnalysis", "overallCredibilityScore", "sourcesProcessed"]
              }
            }
          });
          break;
        } catch (error) {
          console.warn(`Model ${model} failed.`, error);
        }
      }

      if (!response || !response.text) throw new Error("AI generation failed");

      const result = JSON.parse(response.text);
      
      // Calculate individual credibility for sources
      result.sourcesProcessed = result.sourcesProcessed.map((s: any) => ({
        ...s,
        credibilityScore: this.getDomainTrustScore(s.source)
      }));

      return result as NewsBriefing;
    } catch (error) {
      console.error("Briefing generation failed:", error);
      return this.getFallbackBriefing(newsItems);
    }
  }

  private getFallbackBriefing(items: NewsItem[]): NewsBriefing {
    return {
      isAiFallback: true,
      mainHeadline: "Latest News Unprocessed",
      executiveSummary: "Our AI analysis engine is currently unavailable. Below are the raw sources we retrieved.",
      thematicAnalysis: "Unable to synthesize relationships between articles at this time.",
      overallCredibilityScore: 0.5,
      sourcesProcessed: items.map(item => ({
        title: item.title,
        source: item.source,
        url: item.url,
        credibilityScore: this.getDomainTrustScore(item.source)
      }))
    };
  }
}

export { GeminiService };
export const geminiService = new GeminiService();
