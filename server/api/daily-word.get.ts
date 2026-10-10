import { z } from "zod";
import { notFound, ok } from "../utils/api-response";
import { openDateSchema, parseQuery } from "../utils/http-query";
import {
  entryForDate,
  lapEntryForDate,
  payloadFor,
  todayJst,
} from "~~/shared/words";

const dailyWordQuerySchema = z.object({
  date: openDateSchema
    .nullable()
    .optional()
    .transform((val) => val || undefined),
});

export default defineEventHandler((event) => {
  const { date: requestedDate } = parseQuery(event, dailyWordQuerySchema);

  const today = todayJst();
  // No ?date= means "today's word". When the catalogue has run out the words
  // start again from the first (a lap), so the page is never empty and never
  // shows a word that has not opened. An explicit date must have its own entry
  // and is always on lap 1.
  const shown = requestedDate ? undefined : lapEntryForDate(today);
  const entry = requestedDate ? entryForDate(requestedDate) : shown?.entry;

  if (!entry) {
    throw notFound(
      requestedDate
        ? `There is no word for ${requestedDate}.`
        : "The first word has not opened yet.",
    );
  }

  return ok(payloadFor(entry, today, shown?.lap));
});
