import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchMock = (global as any).$fetch as ReturnType<typeof vi.fn>;

let useSiteTheme: typeof import("~/app/composables/useSiteTheme").useSiteTheme;

describe("useSiteTheme", () => {
  beforeEach(async () => {
    fetchMock.mockReset();
    document.documentElement.removeAttribute("data-season");
    localStorage.clear();
    // The composable keeps shared module-level state; start each test fresh.
    vi.resetModules();
    ({ useSiteTheme } = await import("~/app/composables/useSiteTheme"));
  });

  it("applies and caches a known season", async () => {
    fetchMock.mockResolvedValue({
      success: true,
      data: { season: "winter", updatedAt: 1, source: "cron" },
    });
    const { theme, fetchTheme, loading } = useSiteTheme();

    await fetchTheme();

    expect(document.documentElement.getAttribute("data-season")).toBe("winter");
    expect(localStorage.getItem("site-theme-season")).toBe("winter");
    expect(theme.value?.season).toBe("winter");
    expect(loading.value).toBe(false);
  });

  it("ignores a season this build doesn't implement", async () => {
    document.documentElement.setAttribute("data-season", "sakura");
    fetchMock.mockResolvedValue({
      success: true,
      data: { season: "monsoon", updatedAt: 1, source: "cron" },
    });
    const { theme, fetchTheme } = useSiteTheme();

    await fetchTheme();

    expect(document.documentElement.getAttribute("data-season")).toBe("sakura");
    expect(theme.value).toBeNull();
  });

  it("skips the storage write when the season is already cached", async () => {
    document.documentElement.setAttribute("data-season", "autumn");
    localStorage.setItem("site-theme-season", "autumn");
    const setItem = vi.spyOn(localStorage, "setItem");
    fetchMock.mockResolvedValue({
      success: true,
      data: { season: "autumn", updatedAt: 1, source: "cron" },
    });

    await useSiteTheme().fetchTheme();

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it("still applies the season when storage is blocked", async () => {
    const setItem = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    fetchMock.mockResolvedValue({
      success: true,
      data: { season: "summer", updatedAt: 1, source: "cron" },
    });

    await useSiteTheme().fetchTheme();

    expect(document.documentElement.getAttribute("data-season")).toBe("summer");
    setItem.mockRestore();
  });

  it("records an error when the request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("offline"));
    const { error, loading, fetchTheme } = useSiteTheme();

    await fetchTheme();

    expect(error.value).toBe("Failed to load the site theme.");
    expect(loading.value).toBe(false);
  });
  describe("reader's season choice", () => {
    const serverSays = (season: string) =>
      fetchMock.mockResolvedValue({
        success: true,
        data: { season, updatedAt: 1, source: "cron" },
      });

    it("applies and remembers a picked season", () => {
      const { chooseSeason, choice, activeSeason } = useSiteTheme();

      chooseSeason("winter");

      expect(document.documentElement.getAttribute("data-season")).toBe(
        "winter",
      );
      expect(localStorage.getItem("season-choice")).toBe("winter");
      expect(choice.value).toBe("winter");
      expect(activeSeason.value).toBe("winter");
    });

    it("keeps the reader's pick over the site's season after a fetch", async () => {
      localStorage.setItem("season-choice", "summer");
      serverSays("autumn");
      const { fetchTheme, theme, activeSeason } = useSiteTheme();

      await fetchTheme();

      expect(document.documentElement.getAttribute("data-season")).toBe(
        "summer",
      );
      expect(activeSeason.value).toBe("summer");
      // The site's season is still tracked and cached.
      expect(theme.value?.season).toBe("autumn");
      expect(localStorage.getItem("site-theme-season")).toBe("autumn");
    });

    it("ignores a saved pick naming a season this build doesn't have", async () => {
      localStorage.setItem("season-choice", "monsoon");
      serverSays("autumn");
      const { fetchTheme, choice } = useSiteTheme();

      await fetchTheme();

      expect(choice.value).toBeNull();
      expect(document.documentElement.getAttribute("data-season")).toBe(
        "autumn",
      );
    });

    it("going back to following the site restores the site's season", async () => {
      serverSays("autumn");
      const { fetchTheme, chooseSeason, choice } = useSiteTheme();
      await fetchTheme();

      chooseSeason("winter");
      expect(document.documentElement.getAttribute("data-season")).toBe(
        "winter",
      );

      chooseSeason(null);
      expect(choice.value).toBeNull();
      expect(localStorage.getItem("season-choice")).toBeNull();
      expect(document.documentElement.getAttribute("data-season")).toBe(
        "autumn",
      );
    });

    it("follows the calendar when the site's season is unknown", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-07-15T00:00:00Z"));
      const { chooseSeason } = useSiteTheme();

      chooseSeason(null);

      expect(document.documentElement.getAttribute("data-season")).toBe(
        "summer",
      );
      vi.useRealTimers();
    });

    it("still applies a pick when storage is blocked", () => {
      const setItem = vi
        .spyOn(localStorage, "setItem")
        .mockImplementation(() => {
          throw new Error("blocked");
        });
      const { chooseSeason } = useSiteTheme();

      chooseSeason("autumn");

      expect(document.documentElement.getAttribute("data-season")).toBe(
        "autumn",
      );
      setItem.mockRestore();
    });
  });
});
