import { z } from "zod";
import { notFound, ok } from "../utils/api-response";
import { parseQuery } from "../utils/http-query";
import { MAX_PART_LENGTH } from "~~/shared/limits";
import { partDetail } from "~~/shared/parts";
import { todayJst } from "~~/shared/words";

const partQuerySchema = z.object({
  text: z.string().trim().min(1).max(MAX_PART_LENGTH),
});

export default defineEventHandler((event) => {
  const { text } = parseQuery(event, partQuerySchema);

  // Only open days count, so a part seen only in an upcoming word is a 404
  // — its existence is not revealed early.
  const detail = partDetail(text, todayJst());
  if (!detail) throw notFound(`No word has been taken apart into ${text} yet.`);

  return ok(detail);
});
