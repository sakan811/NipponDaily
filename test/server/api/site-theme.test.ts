import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds and persists a fallback for today's season when none exists yet", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T00:00:00Z"));
    mockGetActiveTheme.mockResolvedValue(null);

    const handler = await getSiteThemeHandler();
    const result = await handler({} as any);

    expect(result.success).toBe(true);
    expect(result.data.season).toBe("sakura");
    expect(result.data.source).toBe("fallback");
    // NX write, so it can never clobber a concurrent cron write.
    expect(mockSaveActiveTheme).toHaveBeenCalledWith(
      expect.objectContaining({ season: "sakura", source: "fallback" }),
      { onlyIfAbsent: true },
    );
  });

  it("falls back to the season matching today's date in Japan", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
    mockGetActiveTheme.mockResolvedValue(null);

    const handler = await getSiteThemeHandler();
    const result = await handler({} as any);

    expect(result.data.season).toBe("autumn");
  });

  it("returns a 500 without leaking internal error details", async () => {
    mockGetActiveTheme.mockRejectedValue(new Error("redis: WRONGPASS secret"));

    const handler = await getSiteThemeHandler();
    const err = await handler({} as any).catch((e: unknown) => e);
    expect(err).toMatchObject({ statusCode: 500 });
    expect(JSON.stringify(err)).not.toContain("WRONGPASS");
  });
});
