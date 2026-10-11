import { ref } from "vue";
import type { SeasonId } from "~~/types/index";
import { msUntilJstMidnight } from "~~/shared/jst";
import { isSeasonId, seasonForDate } from "~~/shared/seasons";
import { STORAGE_KEYS } from "~~/shared/storage-keys";

const CHOICE_STORAGE_KEY = STORAGE_KEYS.seasonChoice;

/** The daily check runs this long after midnight in Japan: a timer can fire a
 *  moment early, and the check must land on the new day. */
const MIDNIGHT_SLACK_MS = 1000;

// Shared by every caller (app.vue starts the check, the header's season button
// picks). Only ever written client-side, so nothing leaks between server
// requests.
/** The season applied to <html> right now. */
const activeSeason = ref<SeasonId | null>(null);
/** The reader's own pick from the season button, or null to follow the calendar. */
const choice = ref<SeasonId | null>(null);

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private browsing / blocked storage — the season still applies for
    // this load, it just won't be remembered for the next one.
  }
}

function applySeason(season: SeasonId): void {
  activeSeason.value = season;
  const root = document.documentElement;
  // Usually already applied pre-paint by the inline script in nuxt.config.ts.
  if (root.getAttribute("data-season") !== season) {
    root.setAttribute("data-season", season);
  }
}

/**
 * The site's season is the one for today's date in Japan (`seasonForDate`),
 * worked out in the browser: nothing is stored or fetched for it. The inline
 * script in nuxt.config.ts sets it before first paint; this composable takes
 * over once the page is up and keeps it right with a daily check.
 *
 * The reader can override the calendar with the header's season button; that
 * pick lives only in this browser's localStorage (`season-choice`) and wins
 * until the reader goes back to following the calendar.
 */
export function useSiteTheme() {
  /** Reads the reader's saved pick and what <html> already shows, once on mount. */
  const syncFromStorage = (): void => {
    const saved = readStorage(CHOICE_STORAGE_KEY);
    choice.value = isSeasonId(saved) ? saved : null;
    const attr = document.documentElement.getAttribute("data-season");
    activeSeason.value = isSeasonId(attr) ? attr : null;
  };

  /** Applies the reader's pick, else today's season in Japan. */
  const applyCalendar = (): void => {
    applySeason(choice.value ?? seasonForDate());
  };

  /**
   * Applies the season now, then checks again at every midnight in Japan and
   * whenever the tab becomes visible again (a hidden tab's timers sleep, so a
   * page left open overnight still turns with the calendar). Returns a
   * function that stops the check.
   */
  const startSeasonCheck = (): (() => void) => {
    // Children mount before app.vue, but don't rely on that ordering.
    syncFromStorage();
    applyCalendar();

    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = (): void => {
      timer = setTimeout(() => {
        applyCalendar();
        arm();
      }, msUntilJstMidnight() + MIDNIGHT_SLACK_MS);
    };
    const onVisible = (): void => {
      if (document.visibilityState === "visible") applyCalendar();
    };

    document.addEventListener("visibilitychange", onVisible);
    arm();
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  };

  /** Pick a season for this browser, or pass null to follow the calendar again. */
  const chooseSeason = (season: SeasonId | null): void => {
    choice.value = season;
    writeStorage(CHOICE_STORAGE_KEY, season);
    applyCalendar();
  };

  return {
    activeSeason,
    choice,
    syncFromStorage,
    startSeasonCheck,
    chooseSeason,
  };
}
