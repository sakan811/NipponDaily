import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import { MAX_PART_LENGTH, partDetail } from "~~/shared/parts";
import { todayJst } from "~~/shared/words";

const partQuerySchema = z.object({
  text: z.string().trim().min(1).max(MAX_PART_LENGTH),
});

export default defineEventHandler((event) => {
  let text: string;
  try {
    ({ text } = partQuerySchema.parse(safeGetQuery(event)));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: {
          error: "Invalid query parameters",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      });
    }
    throw error;
  }

  // Only open days count, so a part seen only in an upcoming word is a 404
  // — its existence is not revealed early.
  const detail = partDetail(text, todayJst());
  if (!detail) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: { error: `No word has been taken apart into ${text} yet.` },
    });
  }

  return {
    success: true,
    data: detail,
    timestamp: new Date().toISOString(),
  };
});
