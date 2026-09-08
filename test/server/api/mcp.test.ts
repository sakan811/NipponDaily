import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import type { Lesson } from "~~/types/index";

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

const mockGetLessons = vi.fn();
const mockIsArticleProcessed = vi.fn();
const mockGetLesson = vi.fn();
const mockSaveLesson = vi.fn();
const mockMarkArticleProcessed = vi.fn();
const mockDeleteLesson = vi.fn();
const mockGetDomainCredibility = vi.fn();
const mockSetDomainCredibility = vi.fn();
const mockSetLastIngestTime = vi.fn();

vi.mock("~/server/services/lessons", () => ({
  lessonsService: {
    getLessons: mockGetLessons,
    isArticleProcessed: mockIsArticleProcessed,
    getLesson: mockGetLesson,
    saveLesson: mockSaveLesson,
    markArticleProcessed: mockMarkArticleProcessed,
    deleteLesson: mockDeleteLesson,
    getDomainCredibility: mockGetDomainCredibility,
    setDomainCredibility: mockSetDomainCredibility,
    setLastIngestTime: mockSetLastIngestTime,
  },
}));

const AUTH_TOKEN = "test-mcp-secret-token";

const makeLesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: "lesson-1",
  title: "Existing Lesson",
  titleJa: "既存のレッスン",
  source: "https://old.example.com",
  url: "https://old.example.com/a",
  favicon: "https://old.example.com/favicon.ico",
  publishedAt: "2026-01-01T00:00:00Z",
  addedAt: 1000,
  credibilityScore: 0.7,
  difficultyLevel: "N3",
  originalText: "元の日本語テキスト。",
  englishText: "The original Japanese text.",
  furiganaText: "<ruby>元<rt>もと</rt></ruby>の",
  romajiText: "Moto no",
  vocabList: [],
  grammarNotes: [],
  ...overrides,
});

const parseResult = (result: { content: { type: string; text: string }[] }) =>
  JSON.parse(result.content[0]!.text);

const validLessonInput = (overrides: Record<string, unknown> = {}) => ({
  title: "Article",
  url: "https://news.example.com/1",
  publishedAt: "2026-02-01T00:00:00Z",
  credibilityScore: 0.9,
  difficultyLevel: "N3",
  originalText: "日本語。",
  englishText: "Japanese.",
  furiganaText: "<ruby>日本語<rt>にほんご</rt></ruby>。",
  romajiText: "Nihongo.",
  vocabList: [
    {
      term: "日本語",
      reading: "にほんご",
      romaji: "nihongo",
      meaning: "Japanese language",
      jlptLevel: "N5",
      exampleSentence: "日本語。",
    },
  ],
  grammarNotes: [
    {
      pattern: "〜。",
      explanation: "sentence end",
      exampleSentence: "日本語。",
      romaji: "Nihongo.",
    },
  ],
  ...overrides,
});

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

  it("registers exactly five tools and no merge tool", () => {
    expect(Object.keys(registeredTools).sort()).toEqual([
      "check_processed_urls",
      "cleanup_old_data",
      "get_recent_lessons",
      "mark_ingest_complete",
      "upsert_lesson",
    ]);
  });

  describe("get_recent_lessons tool", () => {
    it("filters by cutoff days, sorts by publishedAt desc, and respects limit", async () => {
      const now = Date.now();
      mockGetLessons.mockResolvedValue([
        makeLesson({
          id: "old",
          publishedAt: new Date(now - 200 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        makeLesson({
          id: "recentA",
          publishedAt: new Date(now - 2000).toISOString(),
        }),
        makeLesson({
          id: "recentB",
          publishedAt: new Date(now - 500).toISOString(),
        }),
      ]);

      const result = await registeredTools.get_recent_lessons!.handler({
        days: 30,
        limit: 30,
      });
      const parsed = parseResult(result);

      expect(parsed.map((l: any) => l.id)).toEqual(["recentB", "recentA"]);
      expect(parsed[0]).toHaveProperty("difficultyLevel");
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

  describe("upsert_lesson tool", () => {
    it("creates a new lesson, caching the provided credibility score per domain", async () => {
      mockGetLesson.mockResolvedValue(null);
      mockGetLessons.mockResolvedValue([]);

      const result =
        await registeredTools.upsert_lesson!.handler(validLessonInput());
      const parsed = parseResult(result);

      expect(parsed.saved).toBe(true);
      expect(parsed.isNew).toBe(true);
      expect(mockSetDomainCredibility).toHaveBeenCalledWith(
        "https://news.example.com",
        0.9,
      );
      const saved = mockSaveLesson.mock.calls[0][0];
      expect(saved.source).toBe("https://news.example.com");
      expect(saved.favicon).toBe("https://news.example.com/favicon.ico");
      expect(mockMarkArticleProcessed).toHaveBeenCalledWith(
        "https://news.example.com/1",
      );
    });

    it("reuses a cached domain credibility score when credibilityScore is omitted", async () => {
      mockGetLesson.mockResolvedValue(null);
      mockGetLessons.mockResolvedValue([]);
      mockGetDomainCredibility.mockResolvedValue(0.55);

      const result = await registeredTools.upsert_lesson!.handler(
        validLessonInput({
          url: "https://cached.example.com/1",
          credibilityScore: undefined,
        }),
      );
      const parsed = parseResult(result);

      expect(parsed.saved).toBe(true);
      const saved = mockSaveLesson.mock.calls[0][0];
      expect(saved.credibilityScore).toBe(0.55);
      expect(mockSetDomainCredibility).not.toHaveBeenCalled();
    });

    it("errors without saving when no cached score exists and none was provided", async () => {
      mockGetLesson.mockResolvedValue(null);
      mockGetLessons.mockResolvedValue([]);
      mockGetDomainCredibility.mockResolvedValue(null);

      const result = await registeredTools.upsert_lesson!.handler(
        validLessonInput({
          url: "https://unscored.example.com/1",
          credibilityScore: undefined,
        }),
      );
      const parsed = parseResult(result);

      expect(parsed.saved).toBe(false);
      expect(parsed.error).toMatch(/No cached credibility score/);
      expect(mockSaveLesson).not.toHaveBeenCalled();
    });

    it("updates the existing lesson when the url already exists, keeping omitted mergeable fields", async () => {
      const existing = makeLesson({
        id: "lesson-1",
        url: "https://old.example.com/a",
        originalText: "元の日本語テキスト。",
        difficultyLevel: "N4",
        vocabList: [
          {
            term: "元",
            reading: "もと",
            romaji: "moto",
            meaning: "origin",
            jlptLevel: "N4",
            exampleSentence: "元の。",
          },
        ],
      });
      mockGetLesson.mockResolvedValue(null);
      mockGetLessons.mockResolvedValue([existing]);

      await registeredTools.upsert_lesson!.handler({
        title: "Old Article (updated title)",
        url: "https://old.example.com/a",
        publishedAt: "2026-01-01T00:00:00Z",
        credibilityScore: 0.7,
        difficultyLevel: "N2",
      });

      const saved = mockSaveLesson.mock.calls[0][0];
      expect(saved.id).toBe("lesson-1");
      expect(saved.title).toBe("Old Article (updated title)");
      expect(saved.difficultyLevel).toBe("N2");
      // Mergeable fields not resent are preserved.
      expect(saved.originalText).toBe("元の日本語テキスト。");
      expect(saved.englishText).toBe("The original Japanese text.");
      expect(saved.vocabList).toHaveLength(1);
      expect(saved.addedAt).toBe(existing.addedAt);
    });

    it("rejects an invalid difficultyLevel", () => {
      const schema = registeredTools.upsert_lesson!.config.inputSchema ?? null;
      // config may be the raw zod object; guard for both shapes.
      const parsed = schema.safeParse(
        validLessonInput({ difficultyLevel: "N7" }),
      );
      expect(parsed.success).toBe(false);
    });
  });

  describe("cleanup_old_data tool", () => {
    it("deletes stale lessons and reports the count", async () => {
      const now = Date.now();
      mockGetLessons.mockResolvedValue([
        makeLesson({
          id: "stale",
          publishedAt: new Date(now - 40 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        makeLesson({ id: "fresh", publishedAt: new Date(now).toISOString() }),
      ]);

      const result = await registeredTools.cleanup_old_data!.handler({
        dryRun: false,
      });
      const parsed = parseResult(result);

      expect(parsed.lessonsDeleted).toBe(1);
      expect(mockDeleteLesson).toHaveBeenCalledWith("stale");
    });

    it("does not delete anything when dryRun is true", async () => {
      const now = Date.now();
      mockGetLessons.mockResolvedValue([
        makeLesson({
          id: "stale",
          publishedAt: new Date(now - 40 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ]);

      const result = await registeredTools.cleanup_old_data!.handler({
        dryRun: true,
      });
      const parsed = parseResult(result);

      expect(parsed.lessonsDeleted).toBe(1);
      expect(parsed.dryRun).toBe(true);
      expect(mockDeleteLesson).not.toHaveBeenCalled();
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
