import { createMcpHandler } from "mcp-handler";
import { fromWebHandler } from "h3";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { n5DataService } from "../services/n5-data";
import { getEnvOrConfig } from "../utils/config";
import { todayUtc } from "../utils/daily-game";
import type { DailyGame, GameQuestion } from "~~/types/index";

/**
 * Remote MCP server letting an external agent (e.g. a scheduled Claude web
 * task) generate NipponDaily's one game per day from the persisted N5
 * kanji/vocab/kana pool — see docs/daily-game-agent-prompt.md. The pool
 * itself is static reference data seeded offline (scripts/seed-n5-data.mjs),
 * not managed through this server.
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

const n5PoolKindSchema = z.enum(["hiragana", "katakana", "kanji", "vocab"]);

const gameQuestionSchema = z.object({
  id: z
    .string()
    .describe(
      "The source item's id, from get_n5_pool (e.g. the kanji/kana character itself, or a vocab id).",
    ),
  kind: n5PoolKindSchema,
  prompt: z
    .string()
    .describe("The Japanese character/word shown to the player."),
  promptSub: z
    .string()
    .optional()
    .describe(
      "Furigana reading shown above the prompt whenever it contains kanji: the character's own reading for a kanji question, or the full kana reading for a vocab question. Omit for hiragana/katakana prompts, which are never kanji.",
    ),
  correctAnswer: z.string(),
  choices: z
    .array(z.string())
    .length(4)
    .describe("Exactly 4 choices, including correctAnswer, in any order."),
});

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_n5_pool",
      {
        title: "Get N5 pool sample",
        description:
          "Get a random sample of one kind (hiragana/katakana/kanji/vocab) from NipponDaily's persisted N5 pool, to pick today's featured items from. Pass excludeIds (item ids from get_recent_daily_games) to avoid repeating recent days. Returns a bounded sample, not the whole pool.",
        inputSchema: z.object({
          kind: n5PoolKindSchema,
          sampleSize: z.number().int().min(1).max(50).optional().default(20),
          excludeIds: z.array(z.string()).optional(),
        }),
      },
      async ({ kind, sampleSize, excludeIds }) => {
        const items = await n5DataService.sampleKind(
          kind,
          sampleSize,
          excludeIds,
        );
        return { content: [{ type: "text", text: JSON.stringify(items) }] };
      },
    );

    server.registerTool(
      "get_recent_daily_games",
      {
        title: "Get recent daily games",
        description:
          "List the item ids featured in NipponDaily's last N days of daily games, so you can pass them as excludeIds to get_n5_pool and avoid repeating recent days.",
        inputSchema: z.object({
          days: z.number().int().min(1).max(30).optional().default(7),
        }),
      },
      async ({ days }) => {
        const dates = await n5DataService.getRecentDailyGameDates(days);
        const games = await Promise.all(
          dates.map((date) => n5DataService.getDailyGame(date)),
        );
        const recent = games
          .filter((g): g is DailyGame => g !== null)
          .map((g) => ({
            date: g.date,
            itemIds: g.questions.map((q) => q.id),
          }));
        return { content: [{ type: "text", text: JSON.stringify(recent) }] };
      },
    );

    server.registerTool(
      "save_daily_game",
      {
        title: "Save daily game",
        description:
          "Persist one day's NipponDaily game — 4-40 authored multiple-choice questions (kanji/vocab meanings, kana romaji), each with exactly 4 choices including the correct answer. Visible at GET /api/daily-game immediately. Defaults to today (UTC) if date is omitted. Aim for ~20 questions (5 each of hiragana/katakana/kanji/vocab) with plausible same-kind distractors.",
        inputSchema: z.object({
          date: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional()
            .describe("YYYY-MM-DD. Defaults to today (UTC) if omitted."),
          questions: z.array(gameQuestionSchema).min(4).max(40),
        }),
      },
      async ({ date, questions }) => {
        const game: DailyGame = {
          date: date ?? todayUtc(),
          questions: questions as GameQuestion[],
          generatedAt: Date.now(),
          source: "agent",
        };
        await n5DataService.saveDailyGame(game);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ saved: true, date: game.date }),
            },
          ],
        };
      },
    );
  },
  {
    serverInfo: { name: "nippondaily-daily-game", version: "1.0.0" },
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
