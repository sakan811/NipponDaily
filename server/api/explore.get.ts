import { z } from "zod";
import { ok } from "../utils/api-response";
import { exploreFilterShape, filtersOf } from "../utils/explore-filters";
import { parseQuery } from "../utils/http-query";
import { exploreWords } from "~~/shared/explore";
import { todayJst } from "~~/shared/words";

const exploreQuerySchema = z.object(exploreFilterShape);

export default defineEventHandler((event) => {
  const filters = filtersOf(parseQuery(event, exploreQuerySchema));

  // Only open days are ever searched, so an upcoming word cannot be found early.
  return ok(exploreWords(filters, todayJst()));
});
