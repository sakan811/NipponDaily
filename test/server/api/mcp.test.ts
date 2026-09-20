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

const mockGetActiveTheme = vi.fn();
const mockSaveActiveTheme = vi.fn();

vi.mock("~/server/services/site-theme", () => ({
  siteThemeService: {
    getActiveTheme: mockGetActiveTheme,
    saveActiveTheme: mockSaveActiveTheme,
  },
}));

const AUTH_TOKEN = "test-mcp-secret-token";

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

  it("registers exactly two tools", () => {
    expect(Object.keys(registeredTools).sort()).toEqual([
      "get_active_theme",
      "save_site_theme",
    ]);
  });

  describe("get_active_theme tool", () => {
    it("returns the currently active theme", async () => {
      mockGetActiveTheme.mockResolvedValue({
        season: "autumn",
        updatedAt: 1234,
        source: "agent",
      });

      const result = await registeredTools.get_active_theme!.handler({});
      const parsed = parseResult(result);

      expect(mockGetActiveTheme).toHaveBeenCalled();
      expect(parsed).toEqual({
        season: "autumn",
        updatedAt: 1234,
        source: "agent",
      });
    });
  });

  describe("save_site_theme tool", () => {
    it("saves the given season with source 'agent'", async () => {
      const result = await registeredTools.save_site_theme!.handler({
        season: "autumn",
      });
      const parsed = parseResult(result);

      expect(parsed).toEqual({ saved: true, season: "autumn" });
      const saved = mockSaveActiveTheme.mock.calls[0][0];
      expect(saved.season).toBe("autumn");
      expect(saved.source).toBe("agent");
      expect(typeof saved.updatedAt).toBe("number");
    });

    it("rejects a season outside the implemented preset list via the schema", () => {
      const schema = registeredTools.save_site_theme!.config.inputSchema;
      const parsed = schema.safeParse({ season: "winter" });
      expect(parsed.success).toBe(false);
    });
  });
});
