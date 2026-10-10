import { z } from "zod";
import { notFound, ok } from "../utils/api-response";
import { openDateSchema, parseQuery } from "../utils/http-query";
import { relatedWords } from "~~/shared/related";
import { entryForDate, todayJst } from "~~/shared/words";

const relatedQuerySchema = z.object({ date: openDateSchema });

export default defineEventHandler((event) => {
  const { date } = parseQuery(event, relatedQuerySchema);

  const entry = entryForDate(date);
  if (!entry) throw notFound(`There is no word for ${date}.`);

  return ok({ date, words: relatedWords(entry, todayJst()) });
});
