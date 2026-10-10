import { ok } from "../utils/api-response";
import { summariseCatalogue } from "~~/shared/catalogue";
import { WORD_ENTRIES, todayJst } from "~~/shared/words";

export default defineEventHandler(() =>
  ok(
    summariseCatalogue(
      WORD_ENTRIES.map((e) => e.date),
      todayJst(),
    ),
  ),
);
