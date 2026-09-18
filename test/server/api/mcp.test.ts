import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

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

const mockSampleKind = vi.fn();
const mockGetRecentDailyGameDates = vi.fn();
const mockGetDailyGame = vi.fn();
const mockSaveDailyGame = vi.fn();

vi.mock("~/server/services/n5-data", () => ({
  n5DataService: {
    sampleKind: mockSampleKind,
    getRecentDailyGameDates: mockGetRecentDailyGameDates,
    getDailyGame: mockGetDailyGame,
    saveDailyGame: mockSaveDailyGame,
  },
}));

const AUTH_TOKEN = "test-mcp-secret-token";

const parseResult = (result: { content: { type: string; text: string }[] }) =>
  JSON.parse(result.content[0]!.text);

const makeQuestion = (overrides: Record<string, unknown> = {}) => ({
  id: "語0",
  kind: "vocab",
  prompt: "語0",
  correctAnswer: "word0",
  choices: ["word0", "word1", "word2", "word3"],
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

  it("registers exactly three tools", () => {
    expect(Object.keys(registeredTools).sort()).toEqual([
      "get_n5_pool",
      "get_recent_daily_games",
      "save_daily_game",
    ]);
  });

  describe("get_n5_pool tool", () => {
    it("samples the requested kind, forwarding sampleSize and excludeIds", async () => {
      mockSampleKind.mockResolvedValue([{ id: "水", character: "水" }]);

      const result = await registeredTools.get_n5_pool!.handler({
        kind: "kanji",
        sampleSize: 10,
        excludeIds: ["火"],
      });
      const parsed = parseResult(result);

      expect(mockSampleKind).toHaveBeenCalledWith("kanji", 10, ["火"]);
      expect(parsed).toEqual([{ id: "水", character: "水" }]);
    });
  });

  describe("get_recent_daily_games tool", () => {
    it("returns item ids for each recent date", async () => {
      mockGetRecentDailyGameDates.mockResolvedValue(["2026-09-17"]);
      mockGetDailyGame.mockResolvedValue({
        date: "2026-09-17",
        questions: [makeQuestion({ id: "語0" }), makeQuestion({ id: "語1" })],
        generatedAt: Date.now(),
        source: "agent",
      });

      const result = await registeredTools.get_recent_daily_games!.handler({
        days: 7,
      });
      const parsed = parseResult(result);

      expect(mockGetRecentDailyGameDates).toHaveBeenCalledWith(7);
      expect(parsed).toEqual([{ date: "2026-09-17", itemIds: ["語0", "語1"] }]);
    });

    it("skips dates whose game record is missing", async () => {
      mockGetRecentDailyGameDates.mockResolvedValue(["2026-09-16"]);
      mockGetDailyGame.mockResolvedValue(null);

      const result = await registeredTools.get_recent_daily_games!.handler({
        days: 7,
      });
      const parsed = parseResult(result);

      expect(parsed).toEqual([]);
    });
  });

  describe("save_daily_game tool", () => {
    it("saves the given questions under today's date when date is omitted", async () => {
      const questions = [makeQuestion()];

      const result = await registeredTools.save_daily_game!.handler({
        questions,
      });
      const parsed = parseResult(result);

      expect(parsed.saved).toBe(true);
      const saved = mockSaveDailyGame.mock.calls[0][0];
      expect(saved.questions).toEqual(questions);
      expect(saved.source).toBe("agent");
      expect(saved.date).toBe(parsed.date);
      expect(saved.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("saves under an explicit date when given", async () => {
      const result = await registeredTools.save_daily_game!.handler({
        date: "2026-01-01",
        questions: [makeQuestion()],
      });
      const parsed = parseResult(result);

      expect(parsed.date).toBe("2026-01-01");
      expect(mockSaveDailyGame.mock.calls[0][0].date).toBe("2026-01-01");
    });

    it("rejects a question without exactly 4 choices via the schema", () => {
      const schema = registeredTools.save_daily_game!.config.inputSchema;
      const parsed = schema.safeParse({
        questions: [makeQuestion({ choices: ["a", "b"] })],
      });
      expect(parsed.success).toBe(false);
    });

    it("rejects fewer than 4 questions via the schema", () => {
      const schema = registeredTools.save_daily_game!.config.inputSchema;
      const parsed = schema.safeParse({
        questions: [makeQuestion()],
      });
      expect(parsed.success).toBe(false);
    });
  });
});
