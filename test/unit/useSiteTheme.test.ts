import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSiteTheme } from "~/app/composables/useSiteTheme";

const fetchMock = (global as any).$fetch as ReturnType<typeof vi.fn>;

describe("useSiteTheme", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    document.documentElement.removeAttribute("data-season");
    localStorage.clear();
  });

  it("applies and caches a known season", async () => {
    fetchMock.mockResolvedValue({
      success: true,
      data: { season: "winter", updatedAt: 1, source: "agent" },
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
      data: { season: "monsoon", updatedAt: 1, source: "agent" },
    });
    const { theme, fetchTheme } = useSiteTheme();

    await fetchTheme();

    expect(document.documentElement.getAttribute("data-season")).toBe("sakura");
    expect(theme.value).toBeNull();
  });

  it("skips the storage write when the season is already applied", async () => {
    document.documentElement.setAttribute("data-season", "autumn");
    const setItem = vi.spyOn(localStorage, "setItem");
    fetchMock.mockResolvedValue({
      success: true,
      data: { season: "autumn", updatedAt: 1, source: "agent" },
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
      data: { season: "summer", updatedAt: 1, source: "agent" },
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
});
