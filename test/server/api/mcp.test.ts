import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import type { Story } from "~~/types/index";

type ToolHandler = (
  args: any,
) => Promise<{ content: { type: string; text: string }[] }>;
const registeredTools: Record<string, { config: any; handler: ToolHandler }> =
  {};

vi.mock("mcp-handler", () => ({
  createMcpHandler: vi.fn((setupFn: (server: any) => void) => {
    const fakeServer = {
      registerTool: (name: string, config: any, handler: ToolHandler) => {
        registeredTools[name] = { config, handler };
      },
    };
    setupFn(fakeServer);
    return vi.fn(
      async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
  }),
}));

const mockGetStories = vi.fn();
const mockIsArticleProcessed = vi.fn();
const mockGetStory = vi.fn();
const mockSaveStory = vi.fn();
const mockMarkArticleProcessed = vi.fn();
const mockDeleteStory = vi.fn();
const mockGetDomainCredibility = vi.fn();
const mockSetDomainCredibility = vi.fn();
const mockSetLastIngestTime = vi.fn();

vi.mock("~/server/services/stories", () => ({
  storiesService: {
    getStories: mockGetStories,
    isArticleProcessed: mockIsArticleProcessed,
    getStory: mockGetStory,
    saveStory: mockSaveStory,
    markArticleProcessed: mockMarkArticleProcessed,
    deleteStory: mockDeleteStory,
    getDomainCredibility: mockGetDomainCredibility,
    setDomainCredibility: mockSetDomainCredibility,
    setLastIngestTime: mockSetLastIngestTime,
  },
}));

const AUTH_TOKEN = "test-mcp-secret-token";

const makeStory = (overrides: Partial<Story> = {}): Story => ({
  id: "story-1",
  headline: "Existing Headline",
  summary: "- old summary",
  thematicAnalysis: "- old analysis",
  articleCount: 1,
  firstSeen: 1000,
  lastUpdated: 2000,
  trendScore: 0,
  sources: [
    {
      title: "Old Article",
      source: "https://old.example.com",
      url: "https://old.example.com/a",
      publishedAt: "2024-01-01T00:00:00Z",
      credibilityScore: 0.7,
      addedAt: 1000,
      category: "tech",
    },
  ],
  categories: ["tech"],
  isSummarized: true,
  ...overrides,
});

const parseResult = (result: { content: { type: string; text: string }[] }) =>
  JSON.parse(result.content[0]!.text);

describe("server/api/mcp.ts", () => {
  let defaultExport: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    process.env.MCP_AUTH_TOKEN = AUTH_TOKEN;
    (global as any).useRuntimeConfig = vi.fn(() => ({}));
    const mod = await import("~/server/api/mcp");
    defaultExport = mod.default as unknown as (
      req: Request,
    ) => Promise<Response>;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MCP_AUTH_TOKEN = AUTH_TOKEN;
  });

  describe("authorization", () => {
    it("rejects a request with no token at all", async () => {
      const res = await defaultExport(new Request("http://localhost/api/mcp"));
      expect(res.status).toBe(401);
    });

    it("rejects a request with the wrong bearer token", async () => {
      const res = await defaultExport(
        new Request("http://localhost/api/mcp", {
          headers: { authorization: "Bearer wrong-token" },
        }),
      );
      expect(res.status).toBe(401);
    });

    it("rejects when MCP_AUTH_TOKEN is not configured", async () => {
      process.env.MCP_AUTH_TOKEN = "";
      const res = await defaultExport(
        new Request("http://localhost/api/mcp", {
          headers: { authorization: `Bearer ${AUTH_TOKEN}` },
        }),
      );
      expect(res.status).toBe(401);
    });

    it("accepts the correct bearer token in the Authorization header", async () => {
      const res = await defaultExport(
        new Request("http://localhost/api/mcp", {
          headers: { authorization: `Bearer ${AUTH_TOKEN}` },
        }),
      );
      expect(res.status).toBe(200);
    });

    it("accepts the correct token via the ?token= query param", async () => {
      const res = await defaultExport(
        new Request(`http://localhost/api/mcp?token=${AUTH_TOKEN}`),
      );
      expect(res.status).toBe(200);
    });
  });

  describe("get_recent_stories tool", () => {
    it("filters by cutoff days, sorts by lastUpdated desc, and respects limit", async () => {
      const now = Date.now();
      mockGetStories.mockResolvedValue([
        makeStory({ id: "old", lastUpdated: now - 40 * 24 * 60 * 60 * 1000 }),
        makeStory({ id: "recentA", lastUpdated: now - 1000 }),
        makeStory({ id: "recentB", lastUpdated: now - 500 }),
      ]);

      const result = await registeredTools.get_recent_stories!.handler({
        days: 7,
        limit: 30,
        includeSources: false,
      });
      const parsed = parseResult(result);

      expect(parsed.map((s: any) => s.id)).toEqual(["recentB", "recentA"]);
      expect(parsed[0].sources).toBeUndefined();
    });

    it("includes sources when includeSources is true", async () => {
      mockGetStories.mockResolvedValue([
        makeStory({ id: "s1", lastUpdated: Date.now() }),
      ]);

      const result = await registeredTools.get_recent_stories!.handler({
        days: 7,
        limit: 30,
        includeSources: true,
      });
      const parsed = parseResult(result);

      expect(parsed[0].sources).toEqual([
        {
          url: "https://old.example.com/a",
          title: "Old Article",
          publishedAt: "2024-01-01T00:00:00Z",
        },
      ]);
    });
  });

  describe("check_processed_urls tool", () => {
    it("returns only the URLs that are already processed", async () => {
      mockIsArticleProcessed.mockImplementation(
        async (url: string) => url === "https://a.com/1",
      );

      const result = await registeredTools.check_processed_urls!.handler({
        urls: ["https://a.com/1", "https://a.com/2"],
      });
      const parsed = parseResult(result);

      expect(parsed.processed).toEqual(["https://a.com/1"]);
    });
  });

  describe("upsert_story tool", () => {
    it("creates a new story, caching the provided credibility score per domain", async () => {
      mockGetStory.mockResolvedValue(null);

      const result = await registeredTools.upsert_story!.handler({
        headline: "New Headline",
        summary: "- s",
        thematicAnalysis: "- t",
        sources: [
          {
            title: "Article",
            url: "https://news.example.com/1",
            publishedAt: "2026-01-01T00:00:00Z",
            credibilityScore: 0.9,
            category: "tech",
          },
        ],
        replaceSources: false,
      });
      const parsed = parseResult(result);

      expect(parsed.saved).toBe(true);
      expect(parsed.isNew).toBe(true);
      expect(mockSetDomainCredibility).toHaveBeenCalledWith(
        "https://news.example.com",
        0.9,
      );
      expect(mockSaveStory).toHaveBeenCalled();
      const savedStory = mockSaveStory.mock.calls[0][0];
      expect(savedStory.categories).toEqual(["tech"]);
      expect(mockMarkArticleProcessed).toHaveBeenCalledWith(
        "https://news.example.com/1",
      );
    });

    it("reuses a cached domain credibility score when credibilityScore is omitted", async () => {
      mockGetStory.mockResolvedValue(null);
      mockGetDomainCredibility.mockResolvedValue(0.55);

      const result = await registeredTools.upsert_story!.handler({
        headline: "H",
        summary: "- s",
        thematicAnalysis: "- t",
        sources: [
          {
            title: "Article",
            url: "https://cached.example.com/1",
            publishedAt: "2026-01-01T00:00:00Z",
            category: "tech",
          },
        ],
        replaceSources: false,
      });
      const parsed = parseResult(result);

      expect(parsed.saved).toBe(true);
      const savedStory = mockSaveStory.mock.calls[0][0];
      expect(savedStory.sources[0].credibilityScore).toBe(0.55);
      expect(mockSetDomainCredibility).not.toHaveBeenCalled();
    });

    it("errors without saving when no cached score exists and none was provided", async () => {
      mockGetStory.mockResolvedValue(null);
      mockGetDomainCredibility.mockResolvedValue(null);

      const result = await registeredTools.upsert_story!.handler({
        headline: "H",
        summary: "- s",
        thematicAnalysis: "- t",
        sources: [
          {
            title: "Article",
            url: "https://unscored.example.com/1",
            publishedAt: "2026-01-01T00:00:00Z",
            category: "tech",
          },
        ],
        replaceSources: false,
      });
      const parsed = parseResult(result);

      expect(parsed.saved).toBe(false);
      expect(parsed.error).toMatch(/No cached credibility score/);
      expect(mockSaveStory).not.toHaveBeenCalled();
    });

    it("merges new sources into an existing story's source list by URL by default", async () => {
      const existing = makeStory({
        id: "story-1",
        sources: [
          {
            title: "Old Article",
            source: "https://old.example.com",
            url: "https://old.example.com/a",
            publishedAt: "2024-01-01T00:00:00Z",
            credibilityScore: 0.7,
            addedAt: 1000,
            category: "tech",
          },
        ],
      });
      mockGetStory.mockResolvedValue(existing);

      const result = await registeredTools.upsert_story!.handler({
        id: "story-1",
        headline: "Updated Headline",
        summary: "- s",
        thematicAnalysis: "- t",
        sources: [
          {
            title: "New Article",
            url: "https://new.example.com/b",
            publishedAt: "2026-01-01T00:00:00Z",
            credibilityScore: 0.8,
            category: "society",
          },
        ],
        replaceSources: false,
      });
      const parsed = parseResult(result);

      expect(parsed.isNew).toBe(false);
      const savedStory = mockSaveStory.mock.calls[0][0];
      expect(savedStory.sources.map((s: any) => s.url)).toEqual([
        "https://old.example.com/a",
        "https://new.example.com/b",
      ]);
      expect(savedStory.categories.sort()).toEqual(["society", "tech"]);
      expect(savedStory.firstSeen).toBe(existing.firstSeen);
    });

    it("replaces the full source list when replaceSources is true", async () => {
      const existing = makeStory();
      mockGetStory.mockResolvedValue(existing);

      const result = await registeredTools.upsert_story!.handler({
        id: "story-1",
        headline: "Updated Headline",
        summary: "- s",
        thematicAnalysis: "- t",
        sources: [
          {
            title: "Only Article",
            url: "https://only.example.com/z",
            publishedAt: "2026-01-01T00:00:00Z",
            credibilityScore: 0.6,
            category: "food",
          },
        ],
        replaceSources: true,
      });
      parseResult(result);

      const savedStory = mockSaveStory.mock.calls[0][0];
      expect(savedStory.sources.map((s: any) => s.url)).toEqual([
        "https://only.example.com/z",
      ]);
      expect(savedStory.categories).toEqual(["food"]);
    });

    it("derives the domain from the URL when source is omitted", async () => {
      mockGetStory.mockResolvedValue(null);

      await registeredTools.upsert_story!.handler({
        headline: "H",
        summary: "- s",
        thematicAnalysis: "- t",
        sources: [
          {
            title: "Article",
            url: "https://derived.example.com/path/1",
            publishedAt: "2026-01-01T00:00:00Z",
            credibilityScore: 0.5,
            category: "tech",
          },
        ],
        replaceSources: false,
      });

      expect(mockSetDomainCredibility).toHaveBeenCalledWith(
        "https://derived.example.com",
        0.5,
      );
    });
  });

  describe("merge_stories tool", () => {
    it("errors when fewer than 2 of the requested story ids are found", async () => {
      mockGetStory.mockImplementation(async (id: string) =>
        id === "a" ? makeStory({ id: "a" }) : null,
      );

      const result = await registeredTools.merge_stories!.handler({
        storyIds: ["a", "b"],
        headline: "H",
        summary: "- s",
        thematicAnalysis: "- t",
      });
      const parsed = parseResult(result);

      expect(parsed.merged).toBe(false);
      expect(mockSaveStory).not.toHaveBeenCalled();
    });

    it("errors when keepId is not among the found story ids", async () => {
      mockGetStory.mockImplementation(async (id: string) =>
        makeStory({ id, firstSeen: 1000 }),
      );

      const result = await registeredTools.merge_stories!.handler({
        storyIds: ["a", "b"],
        keepId: "c",
        headline: "H",
        summary: "- s",
        thematicAnalysis: "- t",
      });
      const parsed = parseResult(result);

      expect(parsed.merged).toBe(false);
      expect(parsed.error).toMatch(/not one of the found story ids/);
    });

    it("merges sources deduped by URL, keeps the earliest-firstSeen story by default, and deletes the rest", async () => {
      const storyA = makeStory({
        id: "a",
        firstSeen: 2000,
        categories: ["tech"],
        sources: [
          {
            title: "Shared",
            source: "https://shared.example.com",
            url: "https://shared.example.com/x",
            publishedAt: "2024-01-01T00:00:00Z",
            credibilityScore: 0.7,
            addedAt: 1000,
            category: "tech",
          },
        ],
      });
      const storyB = makeStory({
        id: "b",
        firstSeen: 1000,
        categories: ["society"],
        sources: [
          {
            title: "Shared (updated)",
            source: "https://shared.example.com",
            url: "https://shared.example.com/x",
            publishedAt: "2024-02-01T00:00:00Z",
            credibilityScore: 0.7,
            addedAt: 2000,
            category: "society",
          },
          {
            title: "Unique",
            source: "https://unique.example.com",
            url: "https://unique.example.com/y",
            publishedAt: "2024-03-01T00:00:00Z",
            credibilityScore: 0.6,
            addedAt: 3000,
            category: "society",
          },
        ],
      });
      mockGetStory.mockImplementation(async (id: string) =>
        id === "a" ? storyA : id === "b" ? storyB : null,
      );

      const result = await registeredTools.merge_stories!.handler({
        storyIds: ["a", "b"],
        headline: "Merged Headline",
        summary: "- s",
        thematicAnalysis: "- t",
      });
      const parsed = parseResult(result);

      expect(parsed.merged).toBe(true);
      expect(parsed.id).toBe("b");
      expect(parsed.deletedIds).toEqual(["a"]);
      expect(mockDeleteStory).toHaveBeenCalledWith("a");

      const savedStory = mockSaveStory.mock.calls[0][0];
      expect(savedStory.sources).toHaveLength(2);
      expect(savedStory.categories.sort()).toEqual(["society", "tech"]);
      expect(savedStory.firstSeen).toBe(1000);
    });

    it("honors an explicit keepId", async () => {
      mockGetStory.mockImplementation(async (id: string) =>
        makeStory({ id, firstSeen: id === "a" ? 1000 : 2000 }),
      );

      const result = await registeredTools.merge_stories!.handler({
        storyIds: ["a", "b"],
        keepId: "b",
        headline: "H",
        summary: "- s",
        thematicAnalysis: "- t",
      });
      const parsed = parseResult(result);

      expect(parsed.id).toBe("b");
      expect(parsed.deletedIds).toEqual(["a"]);
    });
  });

  describe("cleanup_old_data tool", () => {
    it("deletes stale stories and reports the count", async () => {
      const now = Date.now();
      mockGetStories.mockResolvedValue([
        makeStory({ id: "stale", lastUpdated: now - 40 * 24 * 60 * 60 * 1000 }),
        makeStory({ id: "fresh", lastUpdated: now }),
      ]);

      const result = await registeredTools.cleanup_old_data!.handler({
        dryRun: false,
      });
      const parsed = parseResult(result);

      expect(parsed.storiesDeleted).toBe(1);
      expect(mockDeleteStory).toHaveBeenCalledWith("stale");
    });

    it("does not delete anything when dryRun is true", async () => {
      const now = Date.now();
      mockGetStories.mockResolvedValue([
        makeStory({ id: "stale", lastUpdated: now - 40 * 24 * 60 * 60 * 1000 }),
      ]);

      const result = await registeredTools.cleanup_old_data!.handler({
        dryRun: true,
      });
      const parsed = parseResult(result);

      expect(parsed.storiesDeleted).toBe(1);
      expect(parsed.dryRun).toBe(true);
      expect(mockDeleteStory).not.toHaveBeenCalled();
    });
  });

  describe("mark_ingest_complete tool", () => {
    it("records the current time when no explicit timestamp is given", async () => {
      const result = await registeredTools.mark_ingest_complete!.handler({});
      const parsed = parseResult(result);

      expect(parsed.success).toBe(true);
      expect(mockSetLastIngestTime).toHaveBeenCalledWith(parsed.timestamp);
    });

    it("records an explicit timestamp when provided", async () => {
      const result = await registeredTools.mark_ingest_complete!.handler({
        timestamp: 123456,
      });
      const parsed = parseResult(result);

      expect(parsed.timestamp).toBe(123456);
      expect(mockSetLastIngestTime).toHaveBeenCalledWith(123456);
    });
  });
});
