import { ingestNewsTask } from "../services/ingest";

/**
 * POST /api/ingest
 *
 * Called by QStash on a configured schedule (set up in the Upstash QStash
 * dashboard — no integration code needed here). Runs the full news ingestion
 * pipeline and returns a summary of what was processed.
 */
export default defineEventHandler(async (_event) => {
  try {
    const result = await ingestNewsTask();
    return {
      ...result,
      success: true,
      message: "News ingestion completed successfully",
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("[POST /api/ingest] Ingestion error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to execute news ingestion",
      data: { error: error.message },
    });
  }
});
