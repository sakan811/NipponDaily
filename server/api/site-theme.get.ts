import { siteThemeService } from "../services/site-theme";
import { defaultSeason } from "../utils/site-theme";
import type { SiteTheme } from "~~/types/index";

export default defineEventHandler(async () => {
  try {
    let theme: SiteTheme | null = await siteThemeService.getActiveTheme();
    if (!theme) {
      theme = {
        season: defaultSeason(),
        updatedAt: Date.now(),
        source: "fallback",
      };
      // NX write: persists the fallback only when nothing exists yet, so a
      // concurrent agent-authored save_site_theme is never clobbered.
      await siteThemeService.saveActiveTheme(theme, { onlyIfAbsent: true });
    }

    return {
      success: true,
      data: theme,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Site theme API error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch site theme",
      data: {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Failed to fetch site theme",
      },
    });
  }
});
