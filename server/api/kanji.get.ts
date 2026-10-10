import { ok } from "../utils/api-response";
import { kanjiIndex } from "~~/shared/kanji";
import { todayJst } from "~~/shared/words";

export default defineEventHandler(() => ok({ kanji: kanjiIndex(todayJst()) }));
