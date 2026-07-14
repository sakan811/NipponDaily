import { GoogleGenAI, Type } from "@google/genai";
import type {
  GenerateContentParameters,
  GenerateContentResponse,
} from "@google/genai";
import type {
  NewsItem,
  NewsBriefing,
  BriefingSource,
  Story,
} from "../../types/index";

class GeminiService {
  private client: GoogleGenAI | null = null;

  private initializeClient(apiKey?: string) {
    if (!apiKey) return;
    this.client = new GoogleGenAI({ apiKey });
  }

  private async generateContentWithRetry(
    params: GenerateContentParameters,
    retries = 3,
    delayMs = 2000,
  ): Promise<GenerateContentResponse> {
    try {
      if (!this.client) {
        throw new Error("Gemini AI client not initialized");
      }
      return await this.client.models.generateContent(params);
    } catch (error) {
      const err = error as {
        status?: number;
        statusCode?: number;
        message?: string;
      };
      const errorStr = String(err.message || error);
      const is429 =
        err.status === 429 ||
        err.statusCode === 429 ||
        errorStr.includes("429") ||
        errorStr.includes("RESOURCE_EXHAUSTED") ||
        errorStr.includes("Too Many Requests");

      if (is429 && retries > 0) {
        console.warn(
          `[Gemini] API rate limited (429/RESOURCE_EXHAUSTED). Retrying in ${delayMs}ms... (${retries} retries left). Error: ${errorStr}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.generateContentWithRetry(params, retries - 1, delayMs * 2);
      }
      throw error;
    }
  }

  private getModels(defaultModel?: string): string[] {
    const config = useRuntimeConfig();
    const modelStr =
      defaultModel ||
      (config.geminiModel as string | undefined) ||
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash";
    return [modelStr.trim()];
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
    options?: { apiKey?: string; model?: string },
  ): Promise<{
    headline: string;
    summary: string;
    thematicAnalysis: string;
    regionsAffected: string[];
    overallCredibilityScore: number;
    categories: string[];
  }> {
    if (!this.client && options?.apiKey) this.initializeClient(options.apiKey);
    if (!this.client) {
      const config = useRuntimeConfig();
      const rawApiKey = config.geminiApiKey;
      const apiKey =
        (typeof rawApiKey === "string" ? rawApiKey : "") ||
        process.env.GEMINI_API_KEY;
      this.client = new GoogleGenAI({ apiKey });
    }

    const newsText = newsItems
      .map(
        (item, i) =>
          `[Source ${i + 1}] Title: ${item.title}\nContent: ${item.summary}\nPublisher: ${item.source}\nURL: ${item.url}`,
      )
      .join("\n\n---\n\n");

    const prompt = `You are an expert news editor specializing in Japan. All output must be in English.
If any source article is in Japanese, translate and incorporate its content into the English briefing.

You have a story cluster containing the following article(s).
Create a comprehensive news briefing for this story in English.

Articles:
${newsText}

Instructions:
1. headline: A concise, engaging English headline capturing the core theme.
2. summary: A detailed bullet-point summary in English. Format as a Markdown unordered list (using "- "), with line breaks (\\n) separating each point.
3. thematicAnalysis: A cross-source analysis comparing perspectives in English. Contrast domestic Japanese sources vs international/Western sources where available. Format as a Markdown unordered list.
4. regionsAffected: Specific Japanese prefectures or regions mentioned (e.g. "Tokyo", "Osaka"). Empty if national/general.
5. overallCredibilityScore: Collective reliability (0.0 to 1.0) based on publishers.
6. categories: One or more from: ["society", "tech", "pop-culture", "tourism", "food", "disaster-prep"].

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
                headline: { type: Type.STRING },
                summary: { type: Type.STRING },
                thematicAnalysis: { type: Type.STRING },
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
                "headline",
                "summary",
                "thematicAnalysis",
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
    const defaultSummary = newsItems
      .map((item) => `- ${item.summary}`)
      .join("\n");
    return {
      headline: defaultHeadline,
      summary: defaultSummary,
      thematicAnalysis: "- Cross-source analysis unavailable.",
      regionsAffected: [],
      overallCredibilityScore: 0.7,
      categories: ["society"],
    };
  }

  async updateStoryBriefing(
    existingStory: Story,
    newItems: NewsItem[],
    options?: { apiKey?: string; model?: string },
  ): Promise<{
    headline: string;
    summary: string;
    thematicAnalysis: string;
    regionsAffected: string[];
    overallCredibilityScore: number;
    categories: string[];
  }> {
    if (!this.client && options?.apiKey) this.initializeClient(options.apiKey);
    if (!this.client) {
      const config = useRuntimeConfig();
      const rawApiKey = config.geminiApiKey;
      const apiKey =
        (typeof rawApiKey === "string" ? rawApiKey : "") ||
        process.env.GEMINI_API_KEY;
      this.client = new GoogleGenAI({ apiKey });
    }

    const newArticlesText = newItems
      .map(
        (item, i) =>
          `[New Source ${i + 1}] Title: ${item.title}\nContent: ${item.summary}\nPublisher: ${item.source}\nURL: ${item.url}`,
      )
      .join("\n\n---\n\n");

    const prompt = `You are an expert news editor. All output must be in English.
If any new source article is in Japanese, translate and incorporate its content into the English briefing.

You are maintaining an English news briefing for a specific story in Japan.
New articles have just been published. Update the briefing to incorporate the new information while retaining historical context.

Existing Story Briefing:
- Headline: ${existingStory.headline}
- Summary:
${existingStory.summary}
- Thematic Analysis:
${existingStory.thematicAnalysis}

New Article(s):
${newArticlesText}

Instructions:
1. headline: Update if the story has evolved significantly; otherwise keep it close to the existing one.
2. summary: Update the bullet-point summary with new facts. Keep as a Markdown unordered list (using "- ") with line breaks (\\n) between each point.
3. thematicAnalysis: Update if new articles bring new perspectives. Format as a Markdown unordered list.
4. regionsAffected: Combine existing regions [${Object.keys(existingStory.regionBreakdown).join(", ")}] with any new ones from the new articles.
5. overallCredibilityScore: Re-assess reliability (0.0 to 1.0) based on all sources.
6. categories: Classify from: ["society", "tech", "pop-culture", "tourism", "food", "disaster-prep"]. May reuse existing [${existingStory.categories.join(", ")}].

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
                headline: { type: Type.STRING },
                summary: { type: Type.STRING },
                thematicAnalysis: { type: Type.STRING },
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
                "headline",
                "summary",
                "thematicAnalysis",
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
    const newSummaryLines = newItems
      .map((item) => `- ${item.summary}`)
      .join("\n");
    return {
      headline: existingStory.headline,
      summary: `${existingStory.summary}\n${newSummaryLines}`,
      thematicAnalysis: existingStory.thematicAnalysis,
      regionsAffected: Object.keys(existingStory.regionBreakdown),
      overallCredibilityScore:
        existingStory.sources[0]?.credibilityScore || 0.7,
      categories: existingStory.categories || ["society"],
    };
  }

  async batchProcessStories(
    storiesToProcess: Array<{
      storyId: string;
      existingStory?: Story;
      articles: NewsItem[];
    }>,
    options?: { apiKey?: string; model?: string },
  ): Promise<
    Record<
      string,
      {
        headline: string;
        summary: string;
        thematicAnalysis: string;
        regionsAffected: string[];
        overallCredibilityScore: number;
        categories: string[];
      }
    >
  > {
    if (!this.client && options?.apiKey) this.initializeClient(options.apiKey);
    if (!this.client) {
      const config = useRuntimeConfig();
      const rawApiKey = config.geminiApiKey;
      const apiKey =
        (typeof rawApiKey === "string" ? rawApiKey : "") ||
        process.env.GEMINI_API_KEY;
      this.client = new GoogleGenAI({ apiKey });
    }

    if (storiesToProcess.length === 0) {
      return {};
    }

    const storiesPromptData = storiesToProcess
      .map((item, idx) => {
        const articlesText = item.articles
          .map(
            (a, aIdx) =>
              `  [Article ${aIdx + 1}] Title: ${a.title}\n  Summary: ${a.summary || a.content || ""}\n  Source: ${a.source}\n  URL: ${a.url}`,
          )
          .join("\n\n");

        if (item.existingStory) {
          return `Story Cluster #${idx + 1} (Story ID: ${item.storyId})
[Type: UPDATE]
Existing Headline: ${item.existingStory.headline}
Existing Summary:
${item.existingStory.summary}
Existing Thematic Analysis:
${item.existingStory.thematicAnalysis}

New Articles:
${articlesText}`;
        } else {
          return `Story Cluster #${idx + 1} (Story ID: ${item.storyId})
[Type: NEW]
Articles:
${articlesText}`;
        }
      })
      .join("\n\n====================\n\n");

    const prompt = `You are an expert news editor specializing in Japan. All output must be in English.
If any source article is in Japanese, translate and incorporate its content into the English briefing.

You are given ${storiesToProcess.length} story clusters. For each cluster, you must generate or update the news briefing in English.

Input Story Clusters:
${storiesPromptData}

Instructions for each Story Cluster:
1. headline: A concise, engaging English headline capturing the core theme. For UPDATE types, update if the story has evolved significantly; otherwise keep it close to the existing one.
2. summary: A detailed bullet-point summary in English. Format as a Markdown unordered list (using "- "), with line breaks (\\n) separating each point.
3. thematicAnalysis: A cross-source analysis comparing perspectives in English. Contrast domestic Japanese sources vs international/Western sources where available. Format as a Markdown unordered list.
4. regionsAffected: Specific Japanese prefectures or regions mentioned (e.g. "Tokyo", "Osaka"). Empty if national/general. For UPDATE types, combine existing regions with any new ones.
5. overallCredibilityScore: Collective reliability (0.0 to 1.0) based on publishers.
6. categories: One or more from: ["society", "tech", "pop-culture", "tourism", "food", "disaster-prep"].

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
                results: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      storyId: { type: Type.STRING },
                      headline: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      thematicAnalysis: { type: Type.STRING },
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
                      "storyId",
                      "headline",
                      "summary",
                      "thematicAnalysis",
                      "regionsAffected",
                      "overallCredibilityScore",
                      "categories",
                    ],
                  },
                },
              },
              required: ["results"],
            },
          },
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          const resultsMap: Record<
            string,
            {
              headline: string;
              summary: string;
              thematicAnalysis: string;
              regionsAffected: string[];
              overallCredibilityScore: number;
              categories: string[];
            }
          > = {};

          if (parsed && Array.isArray(parsed.results)) {
            for (const item of parsed.results) {
              if (item && item.storyId) {
                resultsMap[item.storyId] = {
                  headline: item.headline,
                  summary: item.summary,
                  thematicAnalysis: item.thematicAnalysis,
                  regionsAffected: item.regionsAffected,
                  overallCredibilityScore: item.overallCredibilityScore,
                  categories: item.categories,
                };
              }
            }
          }
          return resultsMap;
        }
      } catch (error) {
        console.warn(`Model ${model} failed in batchProcessStories.`, error);
      }
    }

    throw new Error("Batch processing with Gemini failed");
  }

  async regroupStories(
    currentStories: Array<{
      storyId: string;
      headline: string;
      summary: string;
      categories: string[];
      articles: Array<{
        title: string;
        source: string;
        url: string;
        category?: string;
        publishedAt: string;
      }>;
    }>,
    orphanedArticles: Array<{
      title: string;
      source: string;
      url: string;
      category?: string;
      publishedAt: string;
    }>,
    options?: { apiKey?: string; model?: string },
  ): Promise<{
    stories: Array<{
      storyId: string;
      headline: string;
      summary: string;
      thematicAnalysis: string;
      categories: string[];
      regionsAffected: string[];
      overallCredibilityScore: number;
      articleUrls: string[];
    }>;
  }> {
    if (!this.client && options?.apiKey) this.initializeClient(options.apiKey);
    if (!this.client) {
      const config = useRuntimeConfig();
      const rawApiKey = config.geminiApiKey;
      const apiKey =
        (typeof rawApiKey === "string" ? rawApiKey : "") ||
        process.env.GEMINI_API_KEY;
      this.client = new GoogleGenAI({ apiKey });
    }

    const currentStoriesPromptData = currentStories
      .map((item, idx) => {
        const articlesText = item.articles
          .map(
            (a, aIdx) =>
              `  [Article ${aIdx + 1}] Title: ${a.title}\n  Source: ${a.source}\n  URL: ${a.url}\n  PublishedAt: ${a.publishedAt}`,
          )
          .join("\n\n");

        return `Story Cluster #${idx + 1} (Story ID: ${item.storyId})
Existing Headline: ${item.headline}
Existing Summary:
${item.summary}
Articles:
${articlesText}`;
      })
      .join("\n\n====================\n\n");

    const orphanedArticlesText = orphanedArticles
      .map(
        (a, aIdx) =>
          `[Orphaned Article ${aIdx + 1}] Title: ${a.title}\nSource: ${a.source}\nURL: ${a.url}\nPublishedAt: ${a.publishedAt}`,
      )
      .join("\n\n");

    const prompt = `You are an expert news editor specializing in Japan. All output must be in English.
If any source article is in Japanese, translate and incorporate its content into the English briefings.

Review the existing story groupings and suggest corrections, merges, splits, and new groupings to resolve any misclusterings.
We have some existing story clusters (each containing source articles) and some orphaned articles that do not belong to any cluster yet.

Existing Story Clusters:
${currentStoriesPromptData || "None"}

Orphaned Articles (not grouped yet):
${orphanedArticlesText || "None"}

Instructions for Re-grouping:
1. Review the articles in each existing cluster and the orphaned articles.
2. Group related articles together into cohesive stories.
3. If some articles in a story cluster are unrelated to the main story, split them off. For split-off articles:
   - Either place them in another matching story cluster.
   - Or create a new story cluster for them.
4. If two existing story clusters are about the same event or highly overlapping topics, merge them.
5. If an article doesn't belong to any existing story, either group it with a matching story or create a new story.
6. For each resulting story cluster:
   - storyId: Reuse the existing story ID if the story is largely unchanged, or if another story was merged into it. If a new story is created (either from orphaned articles or split-off articles), generate a new UUID or unique string ID.
   - headline: A concise, engaging headline in English.
   - summary: A detailed bullet-point summary in English. Format as a Markdown unordered list (using "- "), with line breaks (\\n) separating each point.
   - thematicAnalysis: A cross-source analysis comparing perspectives in English. Format as a Markdown unordered list (using "- ").
   - categories: One or more categories from: ["society", "tech", "pop-culture", "tourism", "food", "disaster-prep"].
   - regionsAffected: Specific Japanese prefectures or regions mentioned (e.g. "Tokyo", "Osaka"). Empty if national/general.
   - overallCredibilityScore: Collective reliability (0.0 to 1.0) based on publishers.
   - articleUrls: The exact list of article URLs that belong to this story. Every article URL from the input (both existing and orphaned) must be assigned to exactly one story.

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
                stories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      storyId: { type: Type.STRING },
                      headline: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      thematicAnalysis: { type: Type.STRING },
                      categories: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      regionsAffected: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      overallCredibilityScore: { type: Type.NUMBER },
                      articleUrls: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: [
                      "storyId",
                      "headline",
                      "summary",
                      "thematicAnalysis",
                      "categories",
                      "regionsAffected",
                      "overallCredibilityScore",
                      "articleUrls",
                    ],
                  },
                },
              },
              required: ["stories"],
            },
          },
        });

        if (response && response.text) {
          return JSON.parse(response.text);
        }
      } catch (error) {
        console.warn(`Model ${model} failed in regroupStories.`, error);
      }
    }

    throw new Error("Regrouping with Gemini failed");
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
