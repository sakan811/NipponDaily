import { describe, it, expect, beforeEach } from "vitest";
import { SiteThemeService } from "~/server/services/site-theme";
import type { SiteTheme } from "~~/types/index";

// No UPSTASH_* env vars → the service uses its in-memory store.
describe("SiteThemeService (in-memory)", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("round-trips a saved theme", async () => {
    const service = new SiteThemeService();
    const theme: SiteTheme = {
      season: "winter",
      updatedAt: 1,
      source: "agent",
    };
    await service.saveActiveTheme(theme);
    expect(await service.getActiveTheme()).toEqual(theme);
  });

  it("returns null when nothing is stored", async () => {
    expect(await new SiteThemeService().getActiveTheme()).toBeNull();
  });

  it("onlyIfAbsent never overwrites an existing theme", async () => {
    const service = new SiteThemeService();
    const agent: SiteTheme = {
      season: "summer",
      updatedAt: 1,
      source: "agent",
    };
    await service.saveActiveTheme(agent);
    await service.saveActiveTheme(
      { season: "sakura", updatedAt: 2, source: "fallback" },
      { onlyIfAbsent: true },
    );
    expect(await service.getActiveTheme()).toEqual(agent);
  });

  it("onlyIfAbsent writes when nothing is stored yet", async () => {
    const service = new SiteThemeService();
    const fallback: SiteTheme = {
      season: "sakura",
      updatedAt: 2,
      source: "fallback",
    };
    await service.saveActiveTheme(fallback, { onlyIfAbsent: true });
    expect(await service.getActiveTheme()).toEqual(fallback);
  });

  it("treats a stored season this build doesn't implement as unset", async () => {
    const service = new SiteThemeService();
    await service.saveActiveTheme({
      season: "monsoon",
      updatedAt: 1,
      source: "agent",
    } as unknown as SiteTheme);
    expect(await service.getActiveTheme()).toBeNull();
  });
});
