import { describe, it, expect, beforeEach } from "vitest";
import {
  getSiteThemeHandler,
  setupDefaults,
  mockGetActiveTheme,
  mockSaveActiveTheme,
  createMockSiteTheme,
} from "./setup";

describe("GET /api/site-theme", () => {
  beforeEach(() => {
    setupDefaults();
  });

  it("returns the stored theme when one exists", async () => {
    const theme = createMockSiteTheme();
    mockGetActiveTheme.mockResolvedValue(theme);

    const handler = await getSiteThemeHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(theme);
    expect(mockSaveActiveTheme).not.toHaveBeenCalled();
  });

  it("builds and persists a deterministic fallback when none exists yet", async () => {
    mockGetActiveTheme.mockResolvedValue(null);

    const handler = await getSiteThemeHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data.season).toBe("sakura");
    expect(result.data.source).toBe("fallback");
    // NX write, so it can never clobber a concurrent agent save.
    expect(mockSaveActiveTheme).toHaveBeenCalledWith(
      expect.objectContaining({ season: "sakura", source: "fallback" }),
      { onlyIfAbsent: true },
    );
  });

  it("returns a 500 without leaking internal error details", async () => {
    mockGetActiveTheme.mockRejectedValue(new Error("redis: WRONGPASS secret"));

    const handler = await getSiteThemeHandler();
    const err = await handler({} as any).catch((e: unknown) => e);
    expect(err).toMatchObject({ statusCode: 500 });
    expect(JSON.stringify(err)).not.toContain("WRONGPASS");
  });
});
