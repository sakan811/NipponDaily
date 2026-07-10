import { ingestNewsTask } from "../../services/ingest";

export default defineEventHandler(async (event) => {
  try {
    const result = await ingestNewsTask();
    return {
      success: true,
      message: "News ingestion completed successfully",
      ...result,
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
