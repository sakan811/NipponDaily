import { summariseCatalogue } from "~~/shared/catalogue";
import { WORD_ENTRIES, todayJst } from "~~/shared/words";

export default defineEventHandler(() => ({
  success: true,
  data: summariseCatalogue(
    WORD_ENTRIES.map((e) => e.date),
    todayJst(),
  ),
  timestamp: new Date().toISOString(),
}));
