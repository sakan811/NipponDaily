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
  private getCredentials() {
    const config = useRuntimeConfig();
    const url = config.upstashVectorRestUrl || process.env.UPSTASH_VECTOR_REST_URL;
    const token = config.upstashVectorRestToken || process.env.UPSTASH_VECTOR_REST_TOKEN;
    return { url, token };
  }

  private isConfigured(): boolean {
    const { url, token } = this.getCredentials();
    return !!(url && token);
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

    const { url, token } = this.getCredentials();
    const cleanUrl = url!.replace(/\/$/, "");
    const namespace = options?.namespace ? `/${options.namespace}` : "";
    const endpoint = `${cleanUrl}/query${namespace}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: text,
          topK: options?.topK ?? 1,
          includeMetadata: true,
          filter: options?.filter,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upstash Vector API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      return (result.result || []) as VectorMatch[];
    } catch (error) {
      console.error("Failed to query Upstash Vector:", error);
      return [];
    }
  }

  /**
   * Upsert a document (raw text) to the index.
   * Upstash Vector will embed it automatically using the index's configured model.
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

    const { url, token } = this.getCredentials();
    const cleanUrl = url!.replace(/\/$/, "");
    const namespace = options?.namespace ? `/${options.namespace}` : "";
    const endpoint = `${cleanUrl}/upsert-data${namespace}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            id,
            data: text,
            metadata,
          },
        ]),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upstash Vector API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      return result.status === "ok";
    } catch (error) {
      console.error("Failed to upsert to Upstash Vector:", error);
      return false;
    }
  }
}

export const upstashVectorService = new UpstashVectorService();
