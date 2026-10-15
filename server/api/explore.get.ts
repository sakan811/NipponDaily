import { z } from "zod";
import { ok } from "../utils/api-response";
import { exploreFilterShape, filtersOf } from "../utils/explore-filters";
import { parseQuery } from "../utils/http-query";
import { exploreWords } from "~~/shared/explore";
import { EXPLORE_PAGE_SIZE } from "~~/shared/limits";
import { todayJst } from "~~/shared/words";

const exploreQuerySchema = z.object({
  ...exploreFilterShape,
  // An empty value means the default page, like the filters.
  limit: z
    .union([z.literal(""), z.coerce.number().int().min(1)])
    .optional()
    .transform((n) => n || EXPLORE_PAGE_SIZE),
});

export default defineEventHandler((event) => {
  const parsed = parseQuery(event, exploreQuerySchema);

  // Only open days are ever searched, so an upcoming word cannot be found early.
  return ok(exploreWords(filtersOf(parsed), todayJst(), parsed.limit));
});
