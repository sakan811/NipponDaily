import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getUpdateSeasonHandler,
  setupDefaults,
  mockGetActiveTheme,
  mockSaveActiveTheme,
  createMockSiteTheme,
} from "./setup";

const CRON_SECRET = "test-cron-secret";

describe("GET /api/cron/update-season", () => {
  beforeEach(() => {
    setupDefaults();
    process.env.CRON_SECRET = CRON_SECRET;
    (global as any).getHeader.mockReturnValue(undefined);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects a request with no Authorization header", async () => {
    const handler = await getUpdateSeasonHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(mockSaveActiveTheme).not.toHaveBeenCalled();
  });

  it("rejects a request with the wrong bearer token", async () => {
    (global as any).getHeader.mockReturnValue("Bearer wrong-token");

    const handler = await getUpdateSeasonHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(mockSaveActiveTheme).not.toHaveBeenCalled();
  });

  it("rejects when CRON_SECRET is not configured", async () => {
    process.env.CRON_SECRET = "";
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);

    const handler = await getUpdateSeasonHandler();
    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("saves today's season when nothing is stored yet", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetActiveTheme.mockResolvedValue(null);

    const handler = await getUpdateSeasonHandler();
    const result = await handler({} as any);

    expect(result.data).toEqual({
      season: "autumn",
      previousSeason: null,
      changed: true,
    });
    expect(mockSaveActiveTheme).toHaveBeenCalledWith(
      expect.objectContaining({ season: "autumn", source: "cron" }),
    );
  });

  it("switches the stored season when the date has moved into another one", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetActiveTheme.mockResolvedValue(
      createMockSiteTheme({ season: "summer" }),
    );

    const handler = await getUpdateSeasonHandler();
    const result = await handler({} as any);

    expect(result.data).toEqual({
      season: "autumn",
      previousSeason: "summer",
      changed: true,
    });
    expect(mockSaveActiveTheme).toHaveBeenCalledTimes(1);
  });

  it("is idempotent — writes nothing when the season already matches", async () => {
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetActiveTheme.mockResolvedValue(
      createMockSiteTheme({ season: "autumn" }),
    );

    const handler = await getUpdateSeasonHandler();
    const result = await handler({} as any);

    expect(result.data.changed).toBe(false);
    expect(mockSaveActiveTheme).not.toHaveBeenCalled();
  });

  it("uses Japan time: 15:00 UTC on 30 Nov is already 1 Dec, winter", async () => {
    vi.setSystemTime(new Date("2026-11-30T15:00:00Z"));
    (global as any).getHeader.mockReturnValue(`Bearer ${CRON_SECRET}`);
    mockGetActiveTheme.mockResolvedValue(
      createMockSiteTheme({ season: "autumn" }),
    );

    const handler = await getUpdateSeasonHandler();
    const result = await handler({} as any);

    expect(result.data.season).toBe("winter");
  });
});
