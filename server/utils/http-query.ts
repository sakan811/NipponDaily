import type { H3Event } from "h3";
import { z } from "zod";
import { isValidIsoDate, todayJst } from "~~/shared/words";

/**
 * getQuery(event) as used by the GET endpoints under server/api/ — wrapped
 * in a fallback for the same reason daily-game.get.ts originally needed one:
 * a raw H3Event (as opposed to the object test mocks pass) can reach here
 * without a fully-populated node request, so this re-parses the URL's own
 * search params rather than throwing.
 */
export function safeGetQuery(event: H3Event): Record<string, unknown> {
  try {
    return getQuery(event);
  } catch {
    const urlObj = new URL(
      event.path || event.node?.req?.url || "",
      "http://localhost",
    );
    return Object.fromEntries(urlObj.searchParams.entries());
  }
}

/** Turns a failed query parse into the `400` every endpoint answers with. */
export function rejectQuery(error: unknown): never {
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

/** The request's query parsed by `schema`, or the `400` every endpoint answers with. */
export function parseQuery<S extends z.ZodTypeAny>(
  event: H3Event,
  schema: S,
): z.output<S> {
  try {
    return schema.parse(safeGetQuery(event));
  } catch (error) {
    return rejectQuery(error);
  }
}

/** A real calendar date that has arrived (today or earlier, JST). A future date
 *  is rejected so an upcoming word is never served before its day. */
export const openDateSchema = z
  .string()
  .refine(isValidIsoDate, "Must be a real YYYY-MM-DD date")
  .refine((d) => d <= todayJst(), "Date cannot be in the future");
