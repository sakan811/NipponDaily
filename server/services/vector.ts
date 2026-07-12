import { Index } from "@upstash/vector";
import { GoogleGenAI } from "@google/genai";

export interface VectorMetadata {
  story_id: string;
  category?: string;
  source?: string;
  url?: string;
  published_at?: number;
  title?: string;
  regions?: string[];
  [key: string]: any;
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
      const apiKey = (typeof rawApiKey === "string" ? rawApiKey : "") || process.env.GEMINI_API_KEY;
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
    const url = (typeof rawUrl === "string" ? rawUrl : "") || process.env.UPSTASH_VECTOR_REST_URL;
    const token = (typeof rawToken === "string" ? rawToken : "") || process.env.UPSTASH_VECTOR_REST_TOKEN;
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

  private async getEmbedding(text: string): Promise<number[]> {
    const client = this.getGeminiClient();
    if (!client) {
      throw new Error("Gemini AI client is not configured for embedding generation.");
    }

    const response = await client.models.embedContent({
      model: "gemini-embedding-2",
      contents: text,
      config: {
        outputDimensionality: 1536,
      },
    });

    const embedding = (response as any).embedding || (response.embeddings && response.embeddings[0]);
    if (!embedding || !embedding.values) {
      throw new Error("Failed to retrieve embedding values from Gemini API response.");
    }

    return embedding.values;
  }

  /**
   * Search for semantically similar articles
   */
  async querySimilarity(
    text: string,
    options?: { topK?: number; filter?: string; namespace?: string }
  ): Promise<VectorMatch[]> {
    if (!this.isConfigured()) {
      console.warn("Upstash Vector is not configured. Skipping similarity query.");
      return [];
    }

    try {
      const vector = await this.getEmbedding(text);
      const index = this.getIndex();
      if (!index) throw new Error("Index initialization failed.");

      const queryOptions: { namespace?: string } = {};
      if (options?.namespace) {
        queryOptions.namespace = options.namespace;
      }

      const results = await index.query({
        vector,
        topK: options?.topK ?? 1,
        includeMetadata: true,
        filter: options?.filter,
      }, queryOptions);

      return (results || []).map((r: any) => ({
        id: r.id,
        score: r.score ?? 0,
        metadata: (r.metadata || {}) as VectorMetadata,
      }));
    } catch (error) {
      console.error("Failed to query Upstash Vector:", error);
      return [];
    }
  }

  /**
   * Upsert a document (raw text) to the index.
   * We generate the embedding client-side and upsert to the vector index.
   */
  async upsertArticle(
    id: string,
    text: string,
    metadata: VectorMetadata,
    options?: { namespace?: string }
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn("Upstash Vector is not configured. Skipping upsert.");
      return false;
    }

    try {
      const vector = await this.getEmbedding(text);
      const index = this.getIndex();
      if (!index) throw new Error("Index initialization failed.");

      const upsertOptions: { namespace?: string } = {};
      if (options?.namespace) {
        upsertOptions.namespace = options.namespace;
      }

      await index.upsert({
        id,
        vector,
        metadata: metadata as any,
      }, upsertOptions);

      return true;
    } catch (error) {
      console.error("Failed to upsert to Upstash Vector:", error);
      return false;
    }
  }
}

export const upstashVectorService = new UpstashVectorService();
