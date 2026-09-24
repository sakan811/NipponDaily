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
  const queryToken = new URL(request.url).searchParams.get("token") || "";
  const provided = headerToken || queryToken;
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const seasonIdSchema = z
  .enum(SEASON_IDS)
  .describe(
    SEASON_IDS.map(
      (id) =>
        `${id} = ${SEASONS[id].label}, months ${SEASONS[id].months.join("/")}`,
    ).join("; "),
  );

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_active_theme",
      {
        title: "Get active site theme",
        description:
          "Get NipponDaily's currently active seasonal theme (palette + shape language), plus the season that matches today's date in Japan (suggestedSeason) and every preset save_site_theme accepts. Call this first: if active.season already equals suggestedSeason, there is nothing to do.",
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true, idempotentHint: true },
      },
      async () => {
        const active = await siteThemeService.getActiveTheme();
        const payload = {
          active,
          suggestedSeason: seasonForDate(),
          seasons: SEASON_IDS.map((id) => SEASONS[id]),
        };
        return { content: [{ type: "text", text: JSON.stringify(payload) }] };
      },
    );

    server.registerTool(
      "save_site_theme",
      {
        title: "Save active site theme",
        description: `Set NipponDaily's active seasonal theme, applied immediately site-wide — it swaps the full color palette AND the UI's shape language (card/button/badge silhouettes, dividers, backdrop pattern, ambient particles). Only implemented presets are accepted — currently: ${SEASON_IDS.join(", ")}. Pick the one whose months cover today's date in Japan (get_active_theme returns it as suggestedSeason). Anything else is rejected by the schema.`,
        inputSchema: z.object({
          season: seasonIdSchema,
        }),
        annotations: { idempotentHint: true, destructiveHint: false },
      },
      async ({ season }) => {
        const theme: SiteTheme = {
          season,
          updatedAt: Date.now(),
          source: "agent",
        };
        await siteThemeService.saveActiveTheme(theme);
        return {
          content: [
            { type: "text", text: JSON.stringify({ saved: true, season }) },
          ],
        };
      },
    );
  },
  {
    serverInfo: { name: "nippondaily-site-theme", version: "1.0.0" },
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
