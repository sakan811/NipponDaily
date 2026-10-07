import { kanjiIndex } from "~~/shared/kanji";
import { todayJst } from "~~/shared/words";

export default defineEventHandler(() => ({
  success: true,
  data: { kanji: kanjiIndex(todayJst()) },
  timestamp: new Date().toISOString(),
}));
