import { computed } from "vue";
import { setResponseStatus, useAsyncData, useRequestEvent } from "#app";
import type { ApiResponse } from "~~/types/index";

/**
 * Shared fetch plumbing for the pages that read the catalogue. Everything here
 * goes through `useAsyncData`, so the server renders the page with its data
 * already in it (crawlers and link previews see the word, not a skeleton) and
 * the browser reuses that payload instead of fetching again.
 */

/** A readable message for a failed fetch; `notFound` is what a 404/400 means
 *  for this particular page. */
export function describeError(
  err: unknown,
  notFound: { 400?: string; 404?: string },
  fallback: string,
): string {
  const status = (err as { statusCode?: number } | null)?.statusCode;
  if (status === 404 && notFound[404]) return notFound[404];
  if (status === 400 && notFound[400]) return notFound[400];
  return fallback;
}

/** Runs a fetch for `useAsyncData`; when a page fetch fails during server
 *  rendering, the HTTP response becomes a 404 so a missing or not-yet-open day
 *  is never indexed as a normal page. */
export async function fetchPage<T>(
  nuxtApp: Parameters<typeof useRequestEvent>[0],
  load: () => Promise<ApiResponse<T>>,
  label: string,
): Promise<T | null> {
  try {
    const response = await load();
    return response?.data ?? null;
  } catch (err: unknown) {
    console.error(`Error fetching ${label}:`, (err as Error)?.message ?? err);
    if (import.meta.server) {
      const status = (err as { statusCode?: number } | null)?.statusCode;
      const event = useRequestEvent(nuxtApp);
      if (event && (status === 400 || status === 404)) {
        setResponseStatus(event, 404);
      }
    }
    throw err;
  }
}

export interface ApiDataOptions {
  /** The `useAsyncData` key; a getter makes the data follow whatever it reads. */
  key: string | (() => string);
  /** The endpoint, e.g. `/api/part`. */
  path: string;
  /** The query string's fields, read on every fetch. Without it `$fetch` gets no options. */
  query?: () => Record<string, unknown>;
  /** What the failure is called in the server log. */
  label: string;
  /** The message for a failure the page has no specific words for. */
  failed?: string;
  /** Specific messages for a `404` and a `400`. */
  errors?: { 400?: string; 404?: string };
}

/**
 * One endpoint read through `useAsyncData`: the payload (or null), whether it
 * is pending, a message when it failed, and `refresh`. A failure during server
 * rendering turns the HTTP response into a `404` (see `fetchPage`).
 */
export function useApiData<T>(options: ApiDataOptions) {
  const { data, error, status, refresh } = useAsyncData(
    options.key,
    (nuxtApp) =>
      fetchPage<T>(
        nuxtApp,
        () =>
          options.query
            ? $fetch<ApiResponse<T>>(options.path, { query: options.query() })
            : $fetch<ApiResponse<T>>(options.path),
        options.label,
      ),
  );

  return {
    data: computed(() => data.value ?? null),
    loading: computed(() => status.value === "pending"),
    error: computed(() =>
      error.value
        ? describeError(
            error.value,
            options.errors ?? {},
            options.failed ?? "Failed to load this. Please try again.",
          )
        : null,
    ),
    refresh: async (): Promise<void> => {
      await refresh();
    },
  };
}
