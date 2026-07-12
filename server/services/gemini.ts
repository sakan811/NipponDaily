import { GoogleGenAI, Type } from "@google/genai";
import type { NewsItem, NewsBriefing, BriefingSource, Story } from "../../types/index";

class GeminiService {
  private client: GoogleGenAI | null = null;

  private initializeClient(apiKey?: string) {
    if (!apiKey) return;
    this.client = new GoogleGenAI({ apiKey });
  }

  private async generateContentWithRetry(
    params: { model: string; contents: string; config: any },
    retries = 3,
    delayMs = 2000
  ): Promise<any> {
    try {
      if (!this.client) {
        throw new Error("Gemini AI client not initialized");
      }
      return await this.client.models.generateContent(params);
    } catch (error: any) {
      const errorStr = String(error.message || error);
      const is429 =
        error.status === 429 ||
        error.statusCode === 429 ||
        errorStr.includes("429") ||
        errorStr.includes("RESOURCE_EXHAUSTED") ||
        errorStr.includes("Too Many Requests");

      if (is429 && retries > 0) {
        console.warn(
          `[Gemini] API rate limited (429/RESOURCE_EXHAUSTED). Retrying in ${delayMs}ms... (${retries} retries left). Error: ${errorStr}`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.generateContentWithRetry(params, retries - 1, delayMs * 2);
      }
      throw error;
    }
  }

  private getModels(defaultModel?: string): string[] {
    const modelStr = defaultModel || "gemini-2.5-flash,gemini-3-flash-preview";
    const models = modelStr
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (models.length === 0) return ["gemini-2.5-flash"];
    return [...models].sort(() => Math.random() - 0.5);
  }

  private validateLocaleCode(input?: string | null): string {
    if (!input || typeof input !== "string") return "en";
    const normalized = input.trim().toLowerCase();
    const LOCALE_PATTERN = /^[a-z]{2}(?:_[a-z]{2})?$/;
    return LOCALE_PATTERN.test(normalized) ? normalized : "en";
  }

  async generateNewsBriefing(
    newsItems: NewsItem[],
    options?: { apiKey?: string; model?: string; language?: string },
  ): Promise<NewsBriefing> {
    if (!this.client && options?.apiKey) this.initializeClient(options.apiKey);

    if (!this.client || newsItems.length === 0) {
      return this.getFallbackBriefing(newsItems);
    }

    try {
      const localeCode = this.validateLocaleCode(options?.language);

      const newsText = newsItems
        .map(
          (item, i) =>
            `[Source ${i + 1}] Title: ${item.title}\nContent: ${item.summary}\nPublisher: ${item.source}\nURL: ${item.url}`,
        )
        .join("\n\n---\n\n");

      const prompt = `You are an expert intelligence analyst specializing in Japanese news. Read the following articles and synthesize them into a single, cohesive briefing.
Target Language (ISO 639-1): ${localeCode}

Instructions:
1. mainHeadline: Create a single, overarching headline that captures the most important theme across these articles.
2. executiveSummary: Write a summary broken down by topic for easy skimming. Format as a Markdown unordered list (using "- "), ensuring there are line breaks (\n) separating each point. Focus on structural issues, cultural nuances, and context specific to Japan.
3. thematicAnalysis: Write a cross-source analysis comparing the perspectives. Contrast the viewpoints, focus, and tone of domestic Japanese sources (written in Japanese/from Japan) with those of international/Western sources (written in English/from outside Japan) on these developments. Format as a Markdown unordered list, ensuring there are line breaks (\n) separating each topic.
4. overallCredibilityScore: Assess the collective reliability (0.0 to 1.0) based on the publishers provided.
5. sourcesProcessed: List the sources you used. Translate their titles into the target language. If the original title is in a different language, include the original title in parentheses at the end (e.g., "Translated Title (Original Title)"). For each source, assign a credibilityScore (0.0 to 1.0) based on your knowledge of the publisher's reputation, editorial standards, and trustworthiness (e.g. Reuters, AP, NHK, Bloomberg = high; unknown blogs = low). Also, identify any specific regions or prefectures (e.g. "Tokyo", "Kyoto", "Osaka", "Hokkaido", "Okinawa", "Tohoku", "Kyushu") that this specific source article heavily focuses on, and list them in the "regions" array (leave empty if it is national news or general).
6. regionsAffected: Extract any specific Japanese prefectures or regions explicitly mentioned or heavily featured in these articles (e.g. "Tokyo", "Kyoto", "Osaka", "Hokkaido", "Okinawa", "Tohoku", "Kyushu"). If the news is national or does not target specific prefectures, leave the array empty.

Raw Articles:
${newsText}`;

      const modelsToTry = this.getModels(options?.model);
      let response = null;

      for (const model of modelsToTry) {
        try {
          response = await this.generateContentWithRetry({
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
                        url: { type: Type.STRING },
                        credibilityScore: { type: Type.NUMBER },
                        regions: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: [
                        "title",
                        "source",
                        "url",
                        "credibilityScore",
                        "regions",
                      ],
                    },
                  },
                  regionsAffected: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  "mainHeadline",
                  "executiveSummary",
                  "thematicAnalysis",
                  "overallCredibilityScore",
                  "sourcesProcessed",
                  "regionsAffected",
                ],
              },
            },
          });
          break;
        } catch (error) {
          console.warn(`Model ${model} failed.`, error);
        }
      }

      if (!response || !response.text) throw new Error("AI generation failed");

      const result = JSON.parse(response.text);

      // Attach favicons from original news items
      result.sourcesProcessed = result.sourcesProcessed.map(
        (s: BriefingSource) => {
          const itemMatch = s.url
            ? newsItems.find((item) => item.url === s.url)
            : newsItems.find((item) => item.title === s.title);
          return {
            ...s,
            favicon: itemMatch?.favicon,
          };
        },
      );

      return result as NewsBriefing;
    } catch (error) {
      console.error("Briefing generation failed:", error);
      return this.getFallbackBriefing(newsItems);
    }
  }

  async generateStoryBriefing(
    newsItems: NewsItem[],
    options?: { apiKey?: string; model?: string }
  ): Promise<{
    headlineEn: string;
    headlineJa: string;
    summaryEn: string;
    summaryJa: string;
    thematicAnalysisEn: string;
    thematicAnalysisJa: string;
    regionsAffected: string[];
    overallCredibilityScore: number;
    categories: string[];
  }> {
    if (!this.client && options?.apiKey) this.initializeClient(options.apiKey);
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: (useRuntimeConfig().geminiApiKey as string) || process.env.GEMINI_API_KEY });
    }

    const newsText = newsItems
      .map(
        (item, i) =>
          `[Source ${i + 1}] Title: ${item.title}\nContent: ${item.summary}\nPublisher: ${item.source}\nURL: ${item.url}`,
      )
      .join("\n\n---\n\n");

    const prompt = `You are an expert news editor specializing in Japan.
You have a story cluster containing the following article(s).
Create a comprehensive news briefing for this story in both English and Japanese.

Articles:
${newsText}

Instructions:
1. headlineEn / headlineJa: Create a concise, engaging headline capturing the core theme of the story in English and Japanese.
2. summaryEn / summaryJa: Create a detailed bullet-point summary of the key facts. Focus on structural issues, cultural nuances, and context specific to Japan. Format as a Markdown unordered list (using "- "), ensuring there are line breaks (\\n) separating each point.
3. thematicAnalysisEn / thematicAnalysisJa: Write a cross-source analysis comparing perspectives. Contrast the viewpoints, focus, and tone of domestic Japanese sources vs international/Western sources if available. Format as a Markdown unordered list, with line breaks separating topics.
4. regionsAffected: Identify any specific Japanese prefectures or regions explicitly mentioned or heavily featured (e.g. "Tokyo", "Kyoto", "Osaka", "Hokkaido", "Okinawa", "Tohoku", "Kyushu"). If national/general, leave the array empty.
5. overallCredibilityScore: Assess the collective reliability (0.0 to 1.0) based on the publishers provided.
6. categories: Classify this story into one or more categories that fit from this list: ["society", "tech", "pop-culture", "tourism", "food", "disaster-prep"].

Output in JSON format matching the schema.`;

    const modelsToTry = this.getModels(options?.model);
    for (const model of modelsToTry) {
      try {
        const response = await this.generateContentWithRetry({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headlineEn: { type: Type.STRING },
                headlineJa: { type: Type.STRING },
                summaryEn: { type: Type.STRING },
                summaryJa: { type: Type.STRING },
                thematicAnalysisEn: { type: Type.STRING },
                thematicAnalysisJa: { type: Type.STRING },
                regionsAffected: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                overallCredibilityScore: { type: Type.NUMBER },
                categories: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                "headlineEn",
                "headlineJa",
                "summaryEn",
                "summaryJa",
                "thematicAnalysisEn",
                "thematicAnalysisJa",
                "regionsAffected",
                "overallCredibilityScore",
                "categories",
              ],
            },
          },
        });

        if (response && response.text) {
          return JSON.parse(response.text);
        }
      } catch (error) {
        console.warn(`Model ${model} failed in generateStoryBriefing.`, error);
      }
    }

    // Return a simple fallback if LLM completely fails
    const defaultHeadline = newsItems[0]?.title || "New Story Cluster";
    const defaultSummary = newsItems.map(item => `- ${item.summary}`).join("\n");
    return {
      headlineEn: defaultHeadline,
      headlineJa: defaultHeadline,
      summaryEn: defaultSummary,
      summaryJa: defaultSummary,
      thematicAnalysisEn: "- Cross-source analysis unavailable.",
      thematicAnalysisJa: "- クロスソース分析は現在利用できません。",
      regionsAffected: [],
      overallCredibilityScore: 0.7,
      categories: ["society"],
    };
  }

  async updateStoryBriefing(
    existingStory: Story,
    newItems: NewsItem[],
    options?: { apiKey?: string; model?: string }
  ): Promise<{
    headlineEn: string;
    headlineJa: string;
    summaryEn: string;
    summaryJa: string;
    thematicAnalysisEn: string;
    thematicAnalysisJa: string;
    regionsAffected: string[];
    overallCredibilityScore: number;
    categories: string[];
  }> {
    if (!this.client && options?.apiKey) this.initializeClient(options.apiKey);
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: (useRuntimeConfig().geminiApiKey as string) || process.env.GEMINI_API_KEY });
    }

    const newArticlesText = newItems
      .map(
        (item, i) =>
          `[New Source ${i + 1}] Title: ${item.title}\nContent: ${item.summary}\nPublisher: ${item.source}\nURL: ${item.url}`,
      )
      .join("\n\n---\n\n");

    const prompt = `You are an expert news editor. You are maintaining a bilingual news briefing for a specific story in Japan.
We have an existing briefing for this story, and new articles have just been published about it.
Your task is to update the story briefing (headline, bullet-point summary, and thematic analysis) in both English and Japanese to incorporate the new information from the new articles, while retaining historical context and important details from the existing briefing.

Existing Story Briefing (English):
- Headline: ${existingStory.headlineEn}
- Summary:
${existingStory.summaryEn}
- Thematic Analysis:
${existingStory.thematicAnalysisEn}

Existing Story Briefing (Japanese):
- Headline: ${existingStory.headlineJa}
- Summary:
${existingStory.summaryJa}
- Thematic Analysis:
${existingStory.thematicAnalysisJa}

New Article(s):
${newArticlesText}

Instructions:
1. headlineEn / headlineJa: Update the headline if the story has evolved significantly. Otherwise, keep it similar to the existing one.
2. summaryEn / summaryJa: Update the bullet-point summary to incorporate the new facts, events, or numbers from the new articles. Keep it formatted as a Markdown unordered list (using "- "), ensuring there are line breaks (\\n) separating each point.
3. thematicAnalysisEn / thematicAnalysisJa: Update the thematic analysis comparing viewpoints if the new articles bring new perspectives (e.g. domestic vs international). Format as a Markdown unordered list, with line breaks separating topics.
4. regionsAffected: Combine the existing regions affected [${Object.keys(existingStory.regionBreakdown).join(", ")}] with any new prefectures or regions mentioned in the new articles. Return all affected prefectures/regions as a list.
5. overallCredibilityScore: Re-assess the overall credibility score (0.0 to 1.0) based on all sources.
6. categories: Classify this story into one or more categories that fit from this list: ["society", "tech", "pop-culture", "tourism", "food", "disaster-prep"]. You may reuse the existing categories [${existingStory.categories.join(", ")}] or adapt them based on the new content.

Output in JSON format matching the schema.`;

    const modelsToTry = this.getModels(options?.model);
    for (const model of modelsToTry) {
      try {
        const response = await this.generateContentWithRetry({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headlineEn: { type: Type.STRING },
                headlineJa: { type: Type.STRING },
                summaryEn: { type: Type.STRING },
                summaryJa: { type: Type.STRING },
                thematicAnalysisEn: { type: Type.STRING },
                thematicAnalysisJa: { type: Type.STRING },
                regionsAffected: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                overallCredibilityScore: { type: Type.NUMBER },
                categories: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                "headlineEn",
                "headlineJa",
                "summaryEn",
                "summaryJa",
                "thematicAnalysisEn",
                "thematicAnalysisJa",
                "regionsAffected",
                "overallCredibilityScore",
                "categories",
              ],
            },
          },
        });

        if (response && response.text) {
          return JSON.parse(response.text);
        }
      } catch (error) {
        console.warn(`Model ${model} failed in updateStoryBriefing.`, error);
      }
    }

    // Return a fallback merging existing and new summaries
    const newSummaryLines = newItems.map(item => `- ${item.summary}`).join("\n");
    return {
      headlineEn: existingStory.headlineEn,
      headlineJa: existingStory.headlineJa,
      summaryEn: `${existingStory.summaryEn}\n${newSummaryLines}`,
      summaryJa: `${existingStory.summaryJa}\n${newSummaryLines}`,
      thematicAnalysisEn: existingStory.thematicAnalysisEn,
      thematicAnalysisJa: existingStory.thematicAnalysisJa,
      regionsAffected: Object.keys(existingStory.regionBreakdown),
      overallCredibilityScore: existingStory.sources[0]?.credibilityScore || 0.7,
      categories: existingStory.categories || ["society"],
    };
  }

  private getFallbackBriefing(items: NewsItem[]): NewsBriefing {
    return {
      isAiFallback: true,
      mainHeadline: "Latest News Unprocessed",
      executiveSummary:
        "Our AI analysis engine is currently unavailable. Below are the raw sources we retrieved.",
      thematicAnalysis:
        "Unable to synthesize relationships between articles at this time.",
      overallCredibilityScore: 0.5,
      sourcesProcessed: items.map((item) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        favicon: item.favicon,
        credibilityScore: 0.5,
        regions: [],
      })),
      regionsAffected: [],
    };
  }
}

export { GeminiService };
export const geminiService = new GeminiService();
