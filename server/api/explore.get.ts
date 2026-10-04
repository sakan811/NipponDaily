import { z } from "zod";
import { safeGetQuery } from "../utils/http-query";
import {
  exploreFilterShape,
  filtersOf,
  rejectQuery,
} from "../utils/explore-filters";
import { exploreWords } from "~~/shared/explore";
import { todayJst } from "~~/shared/words";

const exploreQuerySchema = z.object(exploreFilterShape);

export default defineEventHandler((event) => {
  let filters: ReturnType<typeof filtersOf>;
  try {
    filters = filtersOf(exploreQuerySchema.parse(safeGetQuery(event)));
  } catch (error) {
    return rejectQuery(error);
  }

  return {
    success: true,
    // Only open days are ever searched, so an upcoming word cannot be found early.
    data: exploreWords(filters, todayJst()),
    timestamp: new Date().toISOString(),
  };
});
