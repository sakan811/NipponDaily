import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let useSiteTheme: typeof import("~/app/composables/useSiteTheme").useSiteTheme;

const season = () => document.documentElement.getAttribute("data-season");

/** The clock, fixed to an instant (UTC); the season follows the date in Japan. */
const at = (iso: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
};

describe("useSiteTheme", () => {
  beforeEach(async () => {
    document.documentElement.removeAttribute("data-season");
    localStorage.clear();
    // The composable keeps shared module-level state; start each test fresh.
    vi.resetModules();
    ({ useSiteTheme } = await import("~/app/composables/useSiteTheme"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("the daily season check", () => {
    it("applies the season for today's date in Japan", () => {
      at("2026-07-15T00:00:00Z");
      const { startSeasonCheck, activeSeason } = useSiteTheme();

      const stop = startSeasonCheck();

      expect(season()).toBe("summer");
      expect(activeSeason.value).toBe("summer");
      stop();
    });

    it("reads the date in Japan, not UTC, at a month boundary", () => {
      // 2026-02-28 20:00 UTC is already 1 March, 05:00 in Japan: spring.
      at("2026-02-28T20:00:00Z");
      const stop = useSiteTheme().startSeasonCheck();

      expect(season()).toBe("sakura");
      stop();
    });

    it("turns with the calendar at midnight in Japan, with no reload", () => {
      // 31 Aug 23:59:00 JST (14:59 UTC): the last minute of summer.
      at("2026-08-31T14:59:00Z");
      const stop = useSiteTheme().startSeasonCheck();
      expect(season()).toBe("summer");

      vi.advanceTimersByTime(30_000);
      expect(season()).toBe("summer");

      // Past midnight (and the one second of slack the check allows).
      vi.advanceTimersByTime(32_000);
      expect(season()).toBe("autumn");
      stop();
    });

    it("keeps checking every midnight after the first", () => {
      at("2026-11-30T14:59:00Z");
      const stop = useSiteTheme().startSeasonCheck();
      expect(season()).toBe("autumn");

      vi.advanceTimersByTime(62_000);
      expect(season()).toBe("winter");

      // Another day on: still winter, and the timer is still armed.
      vi.advanceTimersByTime(24 * 60 * 60 * 1000);
      expect(season()).toBe("winter");
      expect(vi.getTimerCount()).toBe(1);
      stop();
    });

    it("catches up when a tab that slept becomes visible again", () => {
      at("2026-08-31T14:00:00Z");
      const stop = useSiteTheme().startSeasonCheck();
      expect(season()).toBe("summer");

      // The tab slept through midnight: no timer fired.
      vi.setSystemTime(new Date("2026-09-01T03:00:00Z"));
      document.dispatchEvent(new Event("visibilitychange"));

      expect(season()).toBe("autumn");
      stop();
    });

    it("stops checking when told to", () => {
      at("2026-08-31T14:59:00Z");
      const stop = useSiteTheme().startSeasonCheck();

      stop();
      expect(vi.getTimerCount()).toBe(0);

      vi.advanceTimersByTime(5 * 60_000);
      expect(season()).toBe("summer");
      vi.setSystemTime(new Date("2026-09-02T00:00:00Z"));
      document.dispatchEvent(new Event("visibilitychange"));
      expect(season()).toBe("summer");
    });

    it("makes no request: the season comes from the date alone", () => {
      const fetchMock = (global as any).$fetch as ReturnType<typeof vi.fn>;
      fetchMock.mockClear();
      at("2026-10-10T00:00:00Z");

      useSiteTheme().startSeasonCheck()();

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("reader's season choice", () => {
    it("applies and remembers a picked season", () => {
      const { chooseSeason, choice, activeSeason } = useSiteTheme();

      chooseSeason("winter");

      expect(season()).toBe("winter");
      expect(localStorage.getItem("season-choice")).toBe("winter");
      expect(choice.value).toBe("winter");
      expect(activeSeason.value).toBe("winter");
    });

    it("keeps the reader's pick over the calendar, including at midnight", () => {
      at("2026-08-31T14:59:00Z");
      localStorage.setItem("season-choice", "winter");
      const { startSeasonCheck, activeSeason } = useSiteTheme();

      const stop = startSeasonCheck();
      expect(season()).toBe("winter");

      vi.advanceTimersByTime(62_000); // summer turns to autumn in Japan
      expect(season()).toBe("winter");
      expect(activeSeason.value).toBe("winter");
      stop();
    });

    it("ignores a saved pick naming a season this build doesn't have", () => {
      at("2026-10-10T00:00:00Z");
      localStorage.setItem("season-choice", "monsoon");
      const { startSeasonCheck, choice } = useSiteTheme();

      const stop = startSeasonCheck();

      expect(choice.value).toBeNull();
      expect(season()).toBe("autumn");
      stop();
    });

    it("going back to following the calendar restores today's season", () => {
      at("2026-10-10T00:00:00Z");
      const { startSeasonCheck, chooseSeason, choice } = useSiteTheme();
      const stop = startSeasonCheck();

      chooseSeason("winter");
      expect(season()).toBe("winter");

      chooseSeason(null);
      expect(choice.value).toBeNull();
      expect(localStorage.getItem("season-choice")).toBeNull();
      expect(season()).toBe("autumn");
      stop();
    });

    it("still applies a pick when storage is blocked", () => {
      const setItem = vi
        .spyOn(localStorage, "setItem")
        .mockImplementation(() => {
          throw new Error("blocked");
        });
      const { chooseSeason } = useSiteTheme();

      chooseSeason("autumn");

      expect(season()).toBe("autumn");
      setItem.mockRestore();
    });

    it("follows the calendar when storage cannot be read", () => {
      at("2026-07-15T00:00:00Z");
      const getItem = vi
        .spyOn(localStorage, "getItem")
        .mockImplementation(() => {
          throw new Error("blocked");
        });

      const stop = useSiteTheme().startSeasonCheck();

      expect(season()).toBe("summer");
      getItem.mockRestore();
      stop();
    });
  });
});
