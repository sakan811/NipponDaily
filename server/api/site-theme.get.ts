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
      // Only persist the fallback when nothing exists yet, so a later
      // agent-authored save_site_theme call is never clobbered by this.
      await siteThemeService.saveActiveTheme(theme);
    }

    return {
      success: true,
      data: theme,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Site theme API error:", error);
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch site theme",
      data: {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
});
