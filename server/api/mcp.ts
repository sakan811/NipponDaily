import { createMcpHandler } from "mcp-handler";
import { fromWebHandler } from "h3";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { lessonsService } from "../services/lessons";
import { cleanupOldDataTask } from "../services/cleanup";
import { getEnvOrConfig } from "../utils/config";
import type { Lesson } from "~~/types/index";

/**
 * Remote MCP server letting an external agent (e.g. a scheduled Claude web task)
 * run NipponDaily's news ingestion: it writes finished Japanese-learning
 * lessons — one per article — straight into the same Redis keys
 * `server/api/news.get.ts` reads from. There is no clustering, no cross-article
 * synthesis and no topic taxonomy.
 */

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return url;
  }
}

function extractFavicon(url: string): string | undefined {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}/favicon.ico`;
  } catch {
    return undefined;
  }
}

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

const jlptLevelSchema = z.enum(["N5", "N4", "N3", "N2", "N1"]);

const vocabItemSchema = z.object({
  term: z.string(),
  reading: z.string().describe("Kana reading of the term."),
  romaji: z.string().describe("Rōmaji (Hepburn) transliteration of the term."),
  meaning: z.string(),
  jlptLevel: jlptLevelSchema,
  exampleSentence: z.string(),
  exampleFurigana: z
    .string()
    .optional()
    .describe(
      "exampleSentence with furigana as inline <ruby> HTML markup, e.g. <ruby>漢字<rt>かんじ</rt></ruby>. Only <ruby>/<rt>/<rp> tags are kept on render.",
    ),
  exampleRomaji: z
    .string()
    .optional()
    .describe("Rōmaji (Hepburn) transliteration of exampleSentence."),
});

const grammarNoteSchema = z.object({
  pattern: z.string(),
  explanation: z.string(),
  exampleSentence: z.string(),
  romaji: z
    .string()
    .describe("Rōmaji (Hepburn) transliteration of exampleSentence."),
  exampleFurigana: z
    .string()
    .optional()
    .describe(
      "exampleSentence with furigana as inline <ruby> HTML markup, e.g. <ruby>漢字<rt>かんじ</rt></ruby>. Only <ruby>/<rt>/<rp> tags are kept on render.",
    ),
});

/**
 * Lesson fields that may be omitted on an update (by `id` or matching `url`) to
 * keep the stored value. `title`/`url`/`publishedAt`/`difficultyLevel` are
 * always required on the input.
 */
const MERGEABLE_LESSON_FIELDS = [
  "titleJa",
  "credibilityScore",
  "originalText",
  "englishText",
  "furiganaText",
  "romajiText",
  "vocabList",
  "grammarNotes",
] as const;

const upsertLessonInputSchema = z.object({
  id: z
    .string()
    .optional()
    .describe(
      "Existing lesson id (from get_recent_lessons) to update. Omit to create; a create whose url already exists updates that lesson instead.",
    ),
  title: z.string().describe("English translation of the article headline."),
  titleJa: z.string().optional().describe("The original Japanese headline."),
  url: z.string().url().describe("The article's canonical URL."),
  source: z
    .string()
    .optional()
    .describe(
      "Publisher domain, e.g. https://www3.nhk.or.jp. Derived from the URL if omitted.",
    ),
  publishedAt: z
    .string()
    .describe("ISO 8601 timestamp of the original publish date."),
  credibilityScore: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe(
      "Your assessment (0-1) of this publisher's reliability. Only required the FIRST time a given domain is cited — cached per-domain and reused automatically afterwards. Omitting it for an unscored domain returns an error asking you to supply one.",
    ),
  difficultyLevel: jlptLevelSchema.describe(
    "One overall JLPT (N5-N1) difficulty estimate for this lesson.",
  ),
  originalText: z
    .string()
    .optional()
    .describe(
      "A representative passage (a few sentences to a short paragraph) from the article's Japanese text to teach from — not the whole article.",
    ),
  englishText: z
    .string()
    .optional()
    .describe(
      "A faithful English translation of the whole originalText passage, for learners to check their reading against.",
    ),
  furiganaText: z
    .string()
    .optional()
    .describe(
      "The same passage as originalText with furigana as inline <ruby> HTML markup, e.g. <ruby>漢字<rt>かんじ</rt></ruby>. Only <ruby>/<rt>/<rp> tags are kept on render; everything else is escaped.",
    ),
  romajiText: z
    .string()
    .optional()
    .describe(
      "Rōmaji (Hepburn) transliteration of the whole originalText passage.",
    ),
  vocabList: z
    .array(vocabItemSchema)
    .optional()
    .describe(
      "8-15 notable terms from the passage, each with kana reading, rōmaji, meaning, an approximate JLPT level, and the example sentence it appears in.",
    ),
  grammarNotes: z
    .array(grammarNoteSchema)
    .optional()
    .describe(
      "1-3 grammar patterns worth flagging from the passage, each with a plain explanation plus an example sentence and its rōmaji.",
    ),
});

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_recent_lessons",
      {
        title: "Get recent lessons",
        description:
          "List NipponDaily's existing lessons from Redis, newest article first. Use this before writing new lessons to see what's already covered. For URL-level dedup, call check_processed_urls instead.",
        inputSchema: z.object({
          days: z.number().int().min(1).max(90).optional().default(30),
          limit: z.number().int().min(1).max(100).optional().default(30),
        }),
      },
      async ({ days, limit }) => {
        const lessons = await lessonsService.getLessons();
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        const recent = lessons
          .filter(
            (l) =>
              (new Date(l.publishedAt).getTime() || l.addedAt || 0) >= cutoff,
          )
          .sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime(),
          )
          .slice(0, limit)
          .map((l) => ({
            id: l.id,
            title: l.title,
            url: l.url,
            source: l.source,
            publishedAt: l.publishedAt,
            difficultyLevel: l.difficultyLevel,
          }));
        return { content: [{ type: "text", text: JSON.stringify(recent) }] };
      },
    );

    server.registerTool(
      "check_processed_urls",
      {
        title: "Check processed URLs",
        description:
          "Given candidate article URLs, return which of them NipponDaily has already ingested, so you don't create duplicate lessons. Any URL you passed in that isn't in the returned `processed` list is unprocessed — treat it as new.",
        inputSchema: z.object({
          urls: z.array(z.string().url()).min(1).max(200),
        }),
      },
      async ({ urls }) => {
        const flags = await Promise.all(
          urls.map((url) => lessonsService.isArticleProcessed(url)),
        );
        const processed = urls.filter((_, i) => flags[i]);
        return {
          content: [{ type: "text", text: JSON.stringify({ processed }) }],
        };
      },
    );

    server.registerTool(
      "upsert_lesson",
      {
        title: "Upsert lesson",
        description:
          "Create or update one NipponDaily lesson in Redis — a single Japanese news article plus the lesson authored from its own Japanese text (originalText, englishText, furiganaText, romajiText, vocabList, grammarNotes, difficultyLevel). Visible in the app immediately. There is no clustering, no cross-article synthesis and no topic taxonomy. To update, pass the lesson's `id` (from get_recent_lessons) or just re-use its `url`; any mergeable field you omit keeps its stored value. Marks the source URL as processed. `favicon` is always derived server-side from the domain; `credibilityScore` is cached per-domain and may be omitted once a domain has been scored.",
        inputSchema: upsertLessonInputSchema,
      },
      async (input) => {
        const byId = input.id ? await lessonsService.getLesson(input.id) : null;
        let existing = byId;
        if (!existing) {
          const all = await lessonsService.getLessons();
          existing = all.find((l) => l.url === input.url) ?? null;
        }

        const now = Date.now();
        const domain = input.source || extractDomain(input.url);

        let credibilityScore = input.credibilityScore;
        if (credibilityScore === undefined) {
          credibilityScore =
            existing?.credibilityScore ??
            (await lessonsService.getDomainCredibility(domain)) ??
            undefined;
          if (credibilityScore === undefined) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    saved: false,
                    error: `No cached credibility score for domain "${domain}" yet. Provide credibilityScore (0-1) for this source based on your own assessment of the publisher — it will be cached and reused automatically for future sources from this domain.`,
                  }),
                },
              ],
            };
          }
        } else {
          await lessonsService.setDomainCredibility(domain, credibilityScore);
        }

        // Start from the existing lesson (if any) so omitted mergeable fields
        // keep their stored value; then apply everything the caller sent.
        const merged: Record<string, unknown> = { ...(existing ?? {}) };
        for (const key of MERGEABLE_LESSON_FIELDS) {
          if (input[key as keyof typeof input] !== undefined) {
            merged[key] = input[key as keyof typeof input];
          }
        }

        const lesson: Lesson = {
          id: existing?.id ?? input.id ?? randomUUID(),
          title: input.title,
          titleJa: (merged.titleJa as string | undefined) ?? undefined,
          source: domain,
          url: input.url,
          favicon: extractFavicon(input.url),
          publishedAt: input.publishedAt,
          addedAt: existing?.addedAt ?? now,
          credibilityScore,
          difficultyLevel: input.difficultyLevel,
          originalText: (merged.originalText as string) ?? "",
          englishText: (merged.englishText as string) ?? "",
          furiganaText: (merged.furiganaText as string) ?? "",
          romajiText: (merged.romajiText as string) ?? "",
          vocabList: (merged.vocabList as Lesson["vocabList"]) ?? [],
          grammarNotes: (merged.grammarNotes as Lesson["grammarNotes"]) ?? [],
        };

        await lessonsService.saveLesson(lesson);
        await lessonsService.markArticleProcessed(lesson.url);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                saved: true,
                id: lesson.id,
                isNew: !existing,
              }),
            },
          ],
        };
      },
    );

    server.registerTool(
      "cleanup_old_data",
      {
        title: "Cleanup old data",
        description:
          "Delete lessons from Redis whose article is older than one month. Run this first, before writing new lessons, so stale lessons don't accumulate. Also callable ad hoc. Pass dryRun: true to preview counts without deleting anything.",
        inputSchema: z.object({
          dryRun: z.boolean().optional().default(false),
        }),
      },
      async ({ dryRun }) => {
        const result = await cleanupOldDataTask({ dryRun });
        return {
          content: [
            { type: "text", text: JSON.stringify({ ...result, dryRun }) },
          ],
        };
      },
    );

    server.registerTool(
      "mark_ingest_complete",
      {
        title: "Mark ingest complete",
        description:
          'Record the current time as NipponDaily\'s last-ingest timestamp, surfaced to readers as "Updated N ago". Call at the end of every run, including runs that wrote no lessons.',
        inputSchema: z.object({
          timestamp: z.number().int().optional(),
        }),
      },
      async ({ timestamp }) => {
        const ts = timestamp ?? Date.now();
        await lessonsService.setLastIngestTime(ts);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, timestamp: ts }),
            },
          ],
        };
      },
    );
  },
  {
    serverInfo: { name: "nippondaily-news-pipeline", version: "1.0.0" },
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
