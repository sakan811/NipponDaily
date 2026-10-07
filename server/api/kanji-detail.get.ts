import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import { kanjiDetail } from "~~/shared/kanji";
import { todayJst } from "~~/shared/words";

const kanjiQuerySchema = z.object({
  // One character; a kanji outside the first plane is two UTF-16 units.
  char: z
    .string()
    .trim()
    .refine((s) => [...s].length === 1, "must be a single character"),
});

export default defineEventHandler((event) => {
  let char: string;
  try {
    ({ char } = kanjiQuerySchema.parse(safeGetQuery(event)));
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

  // Only open days count, so a kanji used only by an upcoming word is a 404
  // and its existence is not revealed early.
  const detail = kanjiDetail(char, todayJst());
  if (!detail) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      data: { error: `No word written with ${char} has opened yet.` },
    });
  }

  return {
    success: true,
    data: detail,
    timestamp: new Date().toISOString(),
  };
});
