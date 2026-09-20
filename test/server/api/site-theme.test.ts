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
    expect(result.data.season).toBe("autumn");
    expect(result.data.source).toBe("fallback");
    expect(mockSaveActiveTheme).toHaveBeenCalledTimes(1);
  });
});
