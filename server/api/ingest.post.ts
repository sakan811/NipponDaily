import { ingestNewsTask } from "../services/ingest";

/**
 * POST /api/ingest
 *
 * Called by QStash on a configured schedule (set up in the Upstash QStash
 * dashboard — no integration code needed here). Runs the full news ingestion
 * pipeline and returns a summary of what was processed.
 */
export default defineEventHandler(async (_event) => {
  console.log("[POST /api/ingest] Starting news ingestion pipeline request...");
  try {
    const result = await ingestNewsTask();
    console.log(
      "[POST /api/ingest] News Ingestion task completed successfully. Result:",
      result,
    );
    return {
      ...result,
      success: true,
      message: "News ingestion completed successfully",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[POST /api/ingest] Ingestion error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to execute news ingestion",
      data: { error: error instanceof Error ? error.message : String(error) },
    });
  }
});
