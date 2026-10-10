import { z } from "zod";
import { notFound, ok } from "../utils/api-response";
import { parseQuery } from "../utils/http-query";
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
  const { char } = parseQuery(event, kanjiQuerySchema);

  // Only open days count, so a kanji used only by an upcoming word is a 404
  // and its existence is not revealed early.
  const detail = kanjiDetail(char, todayJst());
  if (!detail) throw notFound(`No word written with ${char} has opened yet.`);

  return ok(detail);
});
