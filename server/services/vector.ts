import { Index } from "@upstash/vector";
import { GoogleGenAI } from "@google/genai";
import { createHash } from "node:crypto";

export interface VectorMetadata {
  story_id: string;
  category?: string;
  source?: string;
  url?: string;
  published_at?: number;
  title?: string;
  regions?: string[];
  [key: string]: unknown;
}

export interface VectorMatch {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

class UpstashVectorService {
  private client: GoogleGenAI | null = null;

  private getGeminiClient() {
    if (!this.client) {
      const config = useRuntimeConfig();
      const rawApiKey = config.geminiApiKey;
      const apiKey =
        (typeof rawApiKey === "string" ? rawApiKey : "") ||
        process.env.GEMINI_API_KEY;
      if (apiKey) {
        this.client = new GoogleGenAI({ apiKey });
      }
    }
    return this.client;
  }

  private getCredentials() {
    const config = useRuntimeConfig();
    const rawUrl = config.upstashVectorRestUrl;
    const rawToken = config.upstashVectorRestToken;
    const url =
      (typeof rawUrl === "string" ? rawUrl : "") ||
      process.env.UPSTASH_VECTOR_REST_URL;
    const token =
      (typeof rawToken === "string" ? rawToken : "") ||
      process.env.UPSTASH_VECTOR_REST_TOKEN;
    return { url, token };
  }

  private isConfigured(): boolean {
    const { url, token } = this.getCredentials();
    return !!(url && token);
  }

  private getIndex() {
    const { url, token } = this.getCredentials();
    if (!url || !token) return null;
    return new Index({ url, token });
  }

  async getEmbedding(text: string): Promise<number[]> {
    const client = this.getGeminiClient();
    if (!client) {
      throw new Error(
        "Gemini AI client is not configured for embedding generation.",
      );
    }

    const config = useRuntimeConfig();
    const embeddingModel =
      (config.geminiEmbeddingModel as string | undefined) ||
      "gemini-embedding-2";
    const dim = embeddingModel.includes("embedding-2") ? 1536 : 768;

    return retryWithBackoff(async () => {
      const response = await client.models.embedContent({
        model: embeddingModel,
        contents: text,
        config: {
          outputDimensionality: dim,
        },
      });

      const responseData = response as {
        embedding?: { values: number[] };
        embeddings?: Array<{ values: number[] }>;
      };
      const embedding =
        responseData.embedding ||
        (responseData.embeddings && responseData.embeddings[0]);
      if (!embedding || !embedding.values) {
        throw new Error(
          "Failed to retrieve embedding values from Gemini API response.",
        );
      }

      return embedding.values;
    });
  }

  /**
   * Search for semantically similar articles
   */
  async querySimilarity(
    textOrVector: string | number[],
    options?: { topK?: number; filter?: string; namespace?: string },
  ): Promise<VectorMatch[]> {
    if (!this.isConfigured()) {
      console.warn(
        "Upstash Vector is not configured. Skipping similarity query.",
      );
      return [];
    }

    try {
      const vector =
        typeof textOrVector === "string"
          ? await this.getEmbedding(textOrVector)
          : textOrVector;
      const index = this.getIndex();
      if (!index) throw new Error("Index initialization failed.");

      const queryOptions: { namespace?: string } = {};
      if (options?.namespace) {
        queryOptions.namespace = options.namespace;
      }

      const results = await index.query<VectorMetadata>(
        {
          vector,
          topK: options?.topK ?? 1,
          includeMetadata: true,
          filter: options?.filter,
        },
        queryOptions,
      );

      return (results || []).map((r) => ({
        id: String(r.id),
        score: r.score ?? 0,
        metadata: (r.metadata || {}) as VectorMetadata,
      }));
    } catch (error) {
      console.error("Failed to query Upstash Vector:", error);
      return [];
    }
  }

  /**
   * Upsert a document (raw text or pre-computed vector) to the index.
   */
  async upsertArticle(
    id: string,
    textOrVector: string | number[],
    metadata: VectorMetadata,
    options?: { namespace?: string },
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn("Upstash Vector is not configured. Skipping upsert.");
      return false;
    }

    try {
      const vector =
        typeof textOrVector === "string"
          ? await this.getEmbedding(textOrVector)
          : textOrVector;
      const index = this.getIndex();
      if (!index) throw new Error("Index initialization failed.");

      const upsertOptions: { namespace?: string } = {};
      if (options?.namespace) {
        upsertOptions.namespace = options.namespace;
      }

      await index.upsert(
        {
          id,
          vector,
          metadata: metadata as Record<string, unknown>,
        },
        upsertOptions,
      );

      return true;
    } catch (error) {
      console.error("Failed to upsert to Upstash Vector:", error);
      return false;
    }
  }

  /**
   * Fetch all articles currently in the vector database
   */
  async getAllArticles(): Promise<VectorMatch[]> {
    if (!this.isConfigured()) {
      console.warn("Upstash Vector is not configured. Skipping fetch all articles.");
      return [];
    }

    try {
      const index = this.getIndex();
      if (!index) throw new Error("Index initialization failed.");

      const results: VectorMatch[] = [];
      let cursor = "";

      do {
        const rangeResult = await index.range<VectorMetadata>({
          cursor,
          limit: 1000,
          includeMetadata: true,
        });

        if (rangeResult && rangeResult.vectors) {
          results.push(
            ...rangeResult.vectors.map((v) => ({
              id: String(v.id),
              score: 1, // Range results do not have similarity scores, default to 1
              metadata: (v.metadata || {}) as VectorMetadata,
            })),
          );
        }

        cursor = rangeResult.nextCursor || "";
      } while (cursor !== "");

      return results;
    } catch (error) {
      console.error("Failed to fetch all articles from Upstash Vector:", error);
      return [];
    }
  }

  /**
   * Update the story_id metadata for a given article URL
   */
  async updateArticleStory(url: string, newStoryId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn("Upstash Vector is not configured. Skipping update article story.");
      return false;
    }

    try {
      const index = this.getIndex();
      if (!index) throw new Error("Index initialization failed.");

      const articleId = createHash("sha256").update(url).digest("hex");
      await index.update({
        id: articleId,
        metadata: { story_id: newStoryId },
        metadataUpdateMode: "PATCH",
      });

      return true;
    } catch (error) {
      console.error(`Failed to update story_id for article ${url}:`, error);
      return false;
    }
  }
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 5,
  delay = 2000,
  factor = 2,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    const errStr = error instanceof Error ? error.message : String(error);
    const isRateLimit =
      errStr.includes("429") ||
      errStr.includes("quota") ||
      errStr.includes("RESOURCE_EXHAUSTED") ||
      (error &&
        typeof error === "object" &&
        "status" in error &&
        (error as { status?: number }).status === 429);
    if (!isRateLimit) {
      throw error;
    }
    const jitter = Math.random() * 1000;
    const nextDelay = delay * factor + jitter;
    console.warn(
      `[Gemini Embedding] Rate limited (429/Resource Exhausted). Retrying in ${(delay / 1000).toFixed(2)}s... (${retries} retries left)`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, nextDelay, factor);
  }
}

export const upstashVectorService = new UpstashVectorService();
