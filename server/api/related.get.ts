import { z } from "zod";
import { notFound, ok } from "../utils/api-response";
import { openDateSchema, parseQuery } from "../utils/http-query";
import {
  referencesFor,
  relatedWords,
  sameDayWords,
  soundAlikesOf,
} from "~~/shared/related";
import { entryForDate, todayJst } from "~~/shared/words";

const relatedQuerySchema = z.object({ date: openDateSchema });

export default defineEventHandler((event) => {
  const { date } = parseQuery(event, relatedQuerySchema);

  const entry = entryForDate(date);
  if (!entry) throw notFound(`There is no word for ${date}.`);

  const today = todayJst();
  return ok({
    date,
    words: relatedWords(entry, today),
    ...referencesFor(entry, today),
    sameDay: sameDayWords(entry, today),
    soundAlikes: soundAlikesOf(entry, today),
  });
});
