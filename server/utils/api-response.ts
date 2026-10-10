import type { ApiResponse } from "~~/types/index";

/** The envelope every JSON answer is wrapped in: `{ success, data, timestamp }`. */
export const ok = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

/** The `404` every endpoint answers with when what was asked for is not there. */
export const notFound = (message: string) =>
  createError({
    statusCode: 404,
    statusMessage: "Not Found",
    data: { error: message },
  });
