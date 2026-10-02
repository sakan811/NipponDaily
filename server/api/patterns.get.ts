import { patternsFor } from "~~/shared/patterns";
import { todayJst } from "~~/shared/words";

export default defineEventHandler(() => ({
  success: true,
  data: patternsFor(todayJst()),
  timestamp: new Date().toISOString(),
}));
