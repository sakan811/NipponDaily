import { z } from "zod";
import { cleanupOldDataTask } from "../services/cleanup";

const cleanupBodySchema = z.object({
  dryRun: z.boolean().optional().default(false),
});

/**
 * POST /api/cleanup
 *
 * Called by QStash on a configured schedule (set up in the Upstash QStash
 * dashboard — no integration code needed here). Deletes stories older than
 * 30 days from Redis so the store doesn't grow unbounded.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}));
    const { dryRun } = cleanupBodySchema.parse(body);

    console.log(
      `[POST /api/cleanup] Starting cleanup pipeline... DryRun: ${dryRun}`,
    );
    const result = await cleanupOldDataTask({ dryRun });

    return {
      ...result,
      dryRun,
      message: "Cleanup completed successfully",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid body parameters",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      });
    }

    console.error("[POST /api/cleanup] Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to run cleanup",
      data: { error: error instanceof Error ? error.message : String(error) },
    });
  }
});
