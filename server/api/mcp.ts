import { createMcpHandler } from "mcp-handler";
import { fromWebHandler } from "h3";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { siteThemeService } from "../services/site-theme";
import { getEnvOrConfig } from "../utils/config";
import { SEASON_IDS, SEASONS, seasonForDate } from "../utils/site-theme";
import type { SiteTheme } from "~~/types/index";

/**
 * Remote MCP server letting an external agent (e.g. a scheduled Claude web
 * task) control NipponDaily's seasonal design — see
 * docs/site-theme-agent-prompt.md. The N5 pool and daily game are not
 * agent-managed here: GET /api/daily-game always serves its own
 * deterministic fallback (server/utils/daily-game.ts), and the pool is
 * static reference data seeded offline (scripts/seed-n5-data.mjs).
 */

function isAuthorized(request: Request): boolean {
  const expected = getEnvOrConfig("mcpAuthToken", "MCP_AUTH_TOKEN");
  if (!expected) return false;

  const authHeader = request.headers.get("authorization") || "";
  const headerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  // Only parse the URL when the header didn't carry a token.
  const provided =
    headerToken || new URL(request.url).searchParams.get("token") || "";
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Static per-deploy data, built once rather than on every tool call. The
// catalogue is deliberately lean (no palette hex values) — it's what an
// agent needs to pick a season, nothing more.
const SEASON_CATALOGUE = SEASON_IDS.map((id) => {
  const { label, months, motif } = SEASONS[id];
  return { id, label, months, motif };
});

const seasonIdSchema = z
  .enum(SEASON_IDS)
  .describe(
    SEASON_CATALOGUE.map(
      ({ id, label, months }) => `${id} = ${label}, months ${months.join("/")}`,
    ).join("; "),
  );

const textResult = (payload: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(payload) }],
});

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_active_theme",
      {
        title: "Get active site theme",
        description:
          "Get NipponDaily's currently active seasonal theme (palette + shape language), the season that matches today's date in Japan (suggestedSeason), whether a save is needed (needsUpdate), and every preset save_site_theme accepts. Call this first; if needsUpdate is false there is nothing to do.",
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true, idempotentHint: true },
      },
      async () => {
        const active = await siteThemeService.getActiveTheme();
        const suggestedSeason = seasonForDate();
        return textResult({
          active,
          suggestedSeason,
          needsUpdate: active?.season !== suggestedSeason,
          seasons: SEASON_CATALOGUE,
        });
      },
    );

    server.registerTool(
      "save_site_theme",
      {
        title: "Save active site theme",
        description: `Set NipponDaily's active seasonal theme, applied site-wide within about a minute — it swaps the full color palette AND the UI's shape language (card/button/badge silhouettes, dividers, backdrop pattern, ambient particles). Only implemented presets are accepted — currently: ${SEASON_IDS.join(", ")}. Pick the one whose months cover today's date in Japan (get_active_theme returns it as suggestedSeason). Saving the season that is already active is a no-op.`,
        inputSchema: z.object({
          season: seasonIdSchema,
        }),
        annotations: { idempotentHint: true, destructiveHint: false },
      },
      async ({ season }) => {
        const previous = await siteThemeService.getActiveTheme();
        const changed = previous?.season !== season;
        if (changed) {
          const theme: SiteTheme = {
            season,
            updatedAt: Date.now(),
            source: "agent",
          };
          await siteThemeService.saveActiveTheme(theme);
        }
        return textResult({
          saved: true,
          changed,
          season,
          previousSeason: previous?.season ?? null,
        });
      },
    );
  },
  {
    serverInfo: { name: "nippondaily-site-theme", version: "1.1.0" },
  },
);

async function protectedHandler(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return mcpHandler(request);
}

export default defineEventHandler(fromWebHandler(protectedHandler));
