import { ref } from "vue";
import type { SeasonId, SiteTheme } from "~~/types/index";
import { isSeasonId } from "~~/shared/seasons";

const SEASON_STORAGE_KEY = "site-theme-season";

/**
 * Fetches GET /api/site-theme and applies the active season as a
 * data-season attribute on <html>, caching it to localStorage so the next
 * page load's pre-hydration script (nuxt.config.ts) can apply it
 * synchronously before paint instead of flashing the default palette —
 * the same technique this app already uses for dark/light mode.
 */
export function useSiteTheme() {
  const theme = ref<SiteTheme | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const applySeason = (season: SeasonId): void => {
    const root = document.documentElement;
    // Usually already applied pre-paint from the localStorage cache.
    if (root.getAttribute("data-season") === season) return;
    root.setAttribute("data-season", season);
    try {
      localStorage.setItem(SEASON_STORAGE_KEY, season);
    } catch {
      // Private browsing / blocked storage — the season still applies for
      // this load, it just won't be cached for the next one.
    }
  };

  const fetchTheme = async (): Promise<void> => {
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
        applySeason(response.data.season);
      }
    } catch (err: unknown) {
      console.error("Error fetching site theme:", err);
      error.value = "Failed to load the site theme.";
    } finally {
      loading.value = false;
    }
  };

  return { theme, loading, error, fetchTheme };
}
