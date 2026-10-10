import { siteThemeService } from "../services/site-theme";
import { ok } from "../utils/api-response";
import { seasonForDate } from "~~/shared/seasons";
import type { SiteTheme } from "~~/types/index";

export default defineEventHandler(async () => {
  try {
    let theme: SiteTheme | null = await siteThemeService.getActiveTheme();
    if (!theme) {
      theme = {
        season: seasonForDate(),
        updatedAt: Date.now(),
        source: "fallback",
      };
      // NX write: persists the fallback only when nothing exists yet, so a
      // concurrent cron write is never clobbered.
      await siteThemeService.saveActiveTheme(theme, { onlyIfAbsent: true });
    }

    return ok(theme);
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
