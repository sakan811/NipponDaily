import { ok } from "../utils/api-response";
import { coverageOf, summariseCatalogue } from "~~/shared/catalogue";
import { WORD_ENTRIES, todayJst } from "~~/shared/words";

export default defineEventHandler(() => {
  const today = todayJst();
  return ok({
    ...summariseCatalogue(
      WORD_ENTRIES.map((e) => e.date),
      today,
    ),
    coverage: coverageOf(WORD_ENTRIES.filter((e) => e.date <= today)),
  });
});
