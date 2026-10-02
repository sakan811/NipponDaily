import { partsIndex } from "~~/shared/parts";
import { todayJst } from "~~/shared/words";

export default defineEventHandler(() => ({
  success: true,
  data: { parts: partsIndex(todayJst()) },
  timestamp: new Date().toISOString(),
}));
