import { ref } from "vue";
import type { SeasonId, SiteTheme } from "~~/types/index";
import { isSeasonId, seasonForDate } from "~~/shared/seasons";

const SEASON_STORAGE_KEY = "site-theme-season";
const CHOICE_STORAGE_KEY = "season-choice";

// Shared by every caller (app.vue fetches, the header's season button picks).
// Only ever written client-side, so nothing leaks between server requests.
/** The season applied to <html> right now. */
const activeSeason = ref<SeasonId | null>(null);
/** The reader's own pick from the season button, or null to follow the site. */
const choice = ref<SeasonId | null>(null);
/** The site-wide season last fetched from GET /api/site-theme. */
const siteSeason = ref<SeasonId | null>(null);

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
 * Fetches GET /api/site-theme and applies a season as a data-season
 * attribute on <html>. The reader can override the site's season with the
 * header's season button; that pick lives only in this browser's
 * localStorage (`season-choice`) and wins over the site's season until the
 * reader goes back to following it. The site's season is cached under
 * `site-theme-season`, and the pre-hydration script in nuxt.config.ts
 * applies whichever applies before paint, so a repeat visit never flashes
 * the default palette — the same technique used for dark/light mode.
 */
export function useSiteTheme() {
  const theme = ref<SiteTheme | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** Reads the reader's saved pick and the cached site season, once on mount. */
  const syncFromStorage = (): void => {
    const saved = readStorage(CHOICE_STORAGE_KEY);
    choice.value = isSeasonId(saved) ? saved : null;
    const cached = readStorage(SEASON_STORAGE_KEY);
    if (isSeasonId(cached)) siteSeason.value = cached;
    const attr = document.documentElement.getAttribute("data-season");
    activeSeason.value = isSeasonId(attr) ? attr : null;
  };

  const fetchTheme = async (): Promise<void> => {
    // Children mount before app.vue, but don't rely on that ordering.
    syncFromStorage();
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        success: boolean;
        data: SiteTheme;
        timestamp: string;
      }>("/api/site-theme");

      // Ignore a season this build has no CSS for (e.g. a stale CDN copy
      // from a newer deploy) rather than leaving the site unstyled.
      if (response?.data && isSeasonId(response.data.season)) {
        theme.value = response.data;
        siteSeason.value = response.data.season;
        if (readStorage(SEASON_STORAGE_KEY) !== response.data.season) {
          writeStorage(SEASON_STORAGE_KEY, response.data.season);
        }
        applySeason(choice.value ?? response.data.season);
      }
    } catch (err: unknown) {
      console.error("Error fetching site theme:", err);
      error.value = "Failed to load the site theme.";
    } finally {
      loading.value = false;
    }
  };

  /** Pick a season for this browser, or pass null to follow the site again. */
  const chooseSeason = (season: SeasonId | null): void => {
    choice.value = season;
    writeStorage(CHOICE_STORAGE_KEY, season);
    applySeason(season ?? siteSeason.value ?? seasonForDate());
  };

  return {
    theme,
    loading,
    error,
    activeSeason,
    choice,
    syncFromStorage,
    fetchTheme,
    chooseSeason,
  };
}
