import { ingestNewsTask } from "../../services/ingest";

export default defineEventHandler(async (event) => {
  try {
    const result = await ingestNewsTask();
    return {
      ...result,
      success: true,
      message: "News ingestion completed successfully",
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Cron fetch-news error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to execute cron ingestion",
      data: { error: error.message },
    });
  }
});
