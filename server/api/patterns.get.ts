import { ok } from "../utils/api-response";
import { patternsFor } from "~~/shared/patterns";
import { todayJst } from "~~/shared/words";

export default defineEventHandler(() => ok(patternsFor(todayJst())));
