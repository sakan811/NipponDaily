import { ok } from "../utils/api-response";
import { partsIndex } from "~~/shared/parts";
import { todayJst } from "~~/shared/words";

export default defineEventHandler(() => ok({ parts: partsIndex(todayJst()) }));
