import { describe, it, expect, vi, beforeEach } from "vitest";

const redisState = { get: vi.fn(), set: vi.fn() };

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(function MockRedis() {
    return redisState;
  }),
}));

vi.mock("~/server/utils/config", () => ({
  getEnvOrConfig: vi.fn((_configKey: string, envKey: string) => {
    if (envKey === "UPSTASH_REDIS_REST_URL") return "https://fake-redis";
    if (envKey === "UPSTASH_REDIS_REST_TOKEN") return "fake-token";
    return "";
  }),
}));

describe("SiteThemeService (Redis)", () => {
  let SiteThemeService: typeof import("~/server/services/site-theme").SiteThemeService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ SiteThemeService } = await import("~/server/services/site-theme"));
  });

  const theme = { season: "winter", updatedAt: 1, source: "agent" } as const;

  it("reads the stored theme", async () => {
    redisState.get.mockResolvedValue(theme);
    expect(await new SiteThemeService().getActiveTheme()).toEqual(theme);
    expect(redisState.get).toHaveBeenCalledWith("n5:site_theme");
  });

  it("falls back to null when Redis errors and nothing is cached", async () => {
    redisState.get.mockRejectedValue(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await new SiteThemeService().getActiveTheme()).toBeNull();
  });

  it("overwrites on a normal save", async () => {
    await new SiteThemeService().saveActiveTheme(theme);
    expect(redisState.set).toHaveBeenCalledWith(
      "n5:site_theme",
      JSON.stringify(theme),
      undefined,
    );
  });

  it("uses NX for onlyIfAbsent saves", async () => {
    await new SiteThemeService().saveActiveTheme(theme, {
      onlyIfAbsent: true,
    });
    expect(redisState.set).toHaveBeenCalledWith(
      "n5:site_theme",
      JSON.stringify(theme),
      { nx: true },
    );
  });

  it("keeps the theme in memory when a Redis write fails", async () => {
    redisState.set.mockRejectedValue(new Error("down"));
    redisState.get.mockRejectedValue(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const service = new SiteThemeService();
    await service.saveActiveTheme(theme);
    expect(await service.getActiveTheme()).toEqual(theme);
  });
});
