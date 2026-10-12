/**
 * The daily-word catalogue and its date logic — imported by BOTH the server
 * (GET /api/daily-word, GET /api/word-calendar) and the content tests, so a
 * month's worth of entries is registered in exactly one place.
 *
 * Server and tests only — importing this from app/ would ship every future
 * word to the browser. The data-free labels live in shared/word-labels.ts.
 *
 * To add a month: write data/word-plan/YYYY-MM.json, pin its pages with
 * `pnpm data:etymology --terms …`, pick its sentences with
 * `pnpm data:sentences`, run `pnpm data:words` to generate
 * data/words/YYYY-MM.json, then `pnpm data:kanji`, and add its import below.
 */
import { DAY_MS, toJst } from "./jst";
import type {
  DailyWordPayload,
  WordCalendarDay,
  WordEntry,
} from "~~/types/index";
import october2018 from "~~/data/words/2018-10.json";
import november2018 from "~~/data/words/2018-11.json";
import december2018 from "~~/data/words/2018-12.json";
import january2019 from "~~/data/words/2019-01.json";
import february2019 from "~~/data/words/2019-02.json";
import march2019 from "~~/data/words/2019-03.json";
import april2019 from "~~/data/words/2019-04.json";
import may2019 from "~~/data/words/2019-05.json";
import june2019 from "~~/data/words/2019-06.json";
import july2019 from "~~/data/words/2019-07.json";
import august2019 from "~~/data/words/2019-08.json";
import september2019 from "~~/data/words/2019-09.json";
import october2019 from "~~/data/words/2019-10.json";
import november2019 from "~~/data/words/2019-11.json";
import december2019 from "~~/data/words/2019-12.json";
import january2020 from "~~/data/words/2020-01.json";
import february2020 from "~~/data/words/2020-02.json";
import march2020 from "~~/data/words/2020-03.json";
import april2020 from "~~/data/words/2020-04.json";
import may2020 from "~~/data/words/2020-05.json";
import june2020 from "~~/data/words/2020-06.json";
import july2020 from "~~/data/words/2020-07.json";
import august2020 from "~~/data/words/2020-08.json";
import september2020 from "~~/data/words/2020-09.json";
import october2020 from "~~/data/words/2020-10.json";
import november2020 from "~~/data/words/2020-11.json";
import december2020 from "~~/data/words/2020-12.json";
import january2021 from "~~/data/words/2021-01.json";
import february2021 from "~~/data/words/2021-02.json";
import march2021 from "~~/data/words/2021-03.json";
import april2021 from "~~/data/words/2021-04.json";
import may2021 from "~~/data/words/2021-05.json";
import june2021 from "~~/data/words/2021-06.json";
import july2021 from "~~/data/words/2021-07.json";
import august2021 from "~~/data/words/2021-08.json";
import september2021 from "~~/data/words/2021-09.json";
import october2021 from "~~/data/words/2021-10.json";
import november2021 from "~~/data/words/2021-11.json";
import december2021 from "~~/data/words/2021-12.json";
import january2022 from "~~/data/words/2022-01.json";
import february2022 from "~~/data/words/2022-02.json";
import march2022 from "~~/data/words/2022-03.json";
import april2022 from "~~/data/words/2022-04.json";
import may2022 from "~~/data/words/2022-05.json";
import june2022 from "~~/data/words/2022-06.json";
import july2022 from "~~/data/words/2022-07.json";
import august2022 from "~~/data/words/2022-08.json";
import september2022 from "~~/data/words/2022-09.json";
import october2022 from "~~/data/words/2022-10.json";
import november2022 from "~~/data/words/2022-11.json";
import december2022 from "~~/data/words/2022-12.json";
import january2023 from "~~/data/words/2023-01.json";
import february2023 from "~~/data/words/2023-02.json";
import march2023 from "~~/data/words/2023-03.json";
import april2023 from "~~/data/words/2023-04.json";
import may2023 from "~~/data/words/2023-05.json";
import june2023 from "~~/data/words/2023-06.json";
import july2023 from "~~/data/words/2023-07.json";
import august2023 from "~~/data/words/2023-08.json";
import september2023 from "~~/data/words/2023-09.json";
import october2023 from "~~/data/words/2023-10.json";
import november2023 from "~~/data/words/2023-11.json";
import december2023 from "~~/data/words/2023-12.json";
import january2024 from "~~/data/words/2024-01.json";
import february2024 from "~~/data/words/2024-02.json";
import march2024 from "~~/data/words/2024-03.json";
import april2024 from "~~/data/words/2024-04.json";
import may2024 from "~~/data/words/2024-05.json";
import june2024 from "~~/data/words/2024-06.json";
import july2024 from "~~/data/words/2024-07.json";
import august2024 from "~~/data/words/2024-08.json";
import september2024 from "~~/data/words/2024-09.json";
import october2024 from "~~/data/words/2024-10.json";
import november2024 from "~~/data/words/2024-11.json";
import december2024 from "~~/data/words/2024-12.json";
import january2025 from "~~/data/words/2025-01.json";
import february2025 from "~~/data/words/2025-02.json";
import march2025 from "~~/data/words/2025-03.json";
import april2025 from "~~/data/words/2025-04.json";
import may2025 from "~~/data/words/2025-05.json";
import june2025 from "~~/data/words/2025-06.json";
import july2025 from "~~/data/words/2025-07.json";
import august2025 from "~~/data/words/2025-08.json";
import september2025 from "~~/data/words/2025-09.json";
import october2025 from "~~/data/words/2025-10.json";
import november2025 from "~~/data/words/2025-11.json";
import december2025 from "~~/data/words/2025-12.json";
import january2026 from "~~/data/words/2026-01.json";
import february2026 from "~~/data/words/2026-02.json";
import march2026 from "~~/data/words/2026-03.json";
import april2026 from "~~/data/words/2026-04.json";
import may2026 from "~~/data/words/2026-05.json";
import june2026 from "~~/data/words/2026-06.json";
import july2026 from "~~/data/words/2026-07.json";
import august2026 from "~~/data/words/2026-08.json";
import september2026 from "~~/data/words/2026-09.json";
import october2026 from "~~/data/words/2026-10.json";
import november2026 from "~~/data/words/2026-11.json";
import december2026 from "~~/data/words/2026-12.json";
import january2027 from "~~/data/words/2027-01.json";
import february2027 from "~~/data/words/2027-02.json";
import march2027 from "~~/data/words/2027-03.json";
import april2027 from "~~/data/words/2027-04.json";
import may2027 from "~~/data/words/2027-05.json";
import june2027 from "~~/data/words/2027-06.json";
import july2027 from "~~/data/words/2027-07.json";
import august2027 from "~~/data/words/2027-08.json";
import september2027 from "~~/data/words/2027-09.json";
import october2027 from "~~/data/words/2027-10.json";
import november2027 from "~~/data/words/2027-11.json";
import december2027 from "~~/data/words/2027-12.json";
import january2028 from "~~/data/words/2028-01.json";
import february2028 from "~~/data/words/2028-02.json";
import march2028 from "~~/data/words/2028-03.json";
import april2028 from "~~/data/words/2028-04.json";
import may2028 from "~~/data/words/2028-05.json";
import june2028 from "~~/data/words/2028-06.json";
import july2028 from "~~/data/words/2028-07.json";
import august2028 from "~~/data/words/2028-08.json";
import september2028 from "~~/data/words/2028-09.json";
import october2028 from "~~/data/words/2028-10.json";
import november2028 from "~~/data/words/2028-11.json";
import december2028 from "~~/data/words/2028-12.json";
import january2029 from "~~/data/words/2029-01.json";
import february2029 from "~~/data/words/2029-02.json";
import march2029 from "~~/data/words/2029-03.json";
import april2029 from "~~/data/words/2029-04.json";
import may2029 from "~~/data/words/2029-05.json";
import june2029 from "~~/data/words/2029-06.json";
import july2029 from "~~/data/words/2029-07.json";
import august2029 from "~~/data/words/2029-08.json";
import september2029 from "~~/data/words/2029-09.json";
import october2029 from "~~/data/words/2029-10.json";
import november2029 from "~~/data/words/2029-11.json";
import december2029 from "~~/data/words/2029-12.json";
import january2030 from "~~/data/words/2030-01.json";
import february2030 from "~~/data/words/2030-02.json";
import march2030 from "~~/data/words/2030-03.json";
import april2030 from "~~/data/words/2030-04.json";
import may2030 from "~~/data/words/2030-05.json";
import june2030 from "~~/data/words/2030-06.json";
import july2030 from "~~/data/words/2030-07.json";
import august2030 from "~~/data/words/2030-08.json";
import september2030 from "~~/data/words/2030-09.json";
import october2030 from "~~/data/words/2030-10.json";
import november2030 from "~~/data/words/2030-11.json";
import december2030 from "~~/data/words/2030-12.json";
import january2031 from "~~/data/words/2031-01.json";
import february2031 from "~~/data/words/2031-02.json";
import march2031 from "~~/data/words/2031-03.json";
import april2031 from "~~/data/words/2031-04.json";
import may2031 from "~~/data/words/2031-05.json";
import june2031 from "~~/data/words/2031-06.json";
import july2031 from "~~/data/words/2031-07.json";
import august2031 from "~~/data/words/2031-08.json";
import september2031 from "~~/data/words/2031-09.json";
import october2031 from "~~/data/words/2031-10.json";
import november2031 from "~~/data/words/2031-11.json";
import december2031 from "~~/data/words/2031-12.json";
import january2032 from "~~/data/words/2032-01.json";
import february2032 from "~~/data/words/2032-02.json";
import march2032 from "~~/data/words/2032-03.json";
import april2032 from "~~/data/words/2032-04.json";
import may2032 from "~~/data/words/2032-05.json";
import june2032 from "~~/data/words/2032-06.json";
import july2032 from "~~/data/words/2032-07.json";
import august2032 from "~~/data/words/2032-08.json";
import september2032 from "~~/data/words/2032-09.json";
import october2032 from "~~/data/words/2032-10.json";
import november2032 from "~~/data/words/2032-11.json";
import december2032 from "~~/data/words/2032-12.json";
import january2033 from "~~/data/words/2033-01.json";
import february2033 from "~~/data/words/2033-02.json";
import march2033 from "~~/data/words/2033-03.json";
import april2033 from "~~/data/words/2033-04.json";
import may2033 from "~~/data/words/2033-05.json";
import june2033 from "~~/data/words/2033-06.json";
import july2033 from "~~/data/words/2033-07.json";
import august2033 from "~~/data/words/2033-08.json";
import september2033 from "~~/data/words/2033-09.json";
import october2033 from "~~/data/words/2033-10.json";
import november2033 from "~~/data/words/2033-11.json";
import december2033 from "~~/data/words/2033-12.json";
import january2034 from "~~/data/words/2034-01.json";
import february2034 from "~~/data/words/2034-02.json";
import march2034 from "~~/data/words/2034-03.json";
import april2034 from "~~/data/words/2034-04.json";
import may2034 from "~~/data/words/2034-05.json";
import june2034 from "~~/data/words/2034-06.json";
import july2034 from "~~/data/words/2034-07.json";
import august2034 from "~~/data/words/2034-08.json";
import september2034 from "~~/data/words/2034-09.json";
import october2034 from "~~/data/words/2034-10.json";
import november2034 from "~~/data/words/2034-11.json";
import december2034 from "~~/data/words/2034-12.json";
import january2035 from "~~/data/words/2035-01.json";
import february2035 from "~~/data/words/2035-02.json";
import march2035 from "~~/data/words/2035-03.json";
import april2035 from "~~/data/words/2035-04.json";
import may2035 from "~~/data/words/2035-05.json";
import june2035 from "~~/data/words/2035-06.json";
import july2035 from "~~/data/words/2035-07.json";
import august2035 from "~~/data/words/2035-08.json";
import september2035 from "~~/data/words/2035-09.json";
import october2035 from "~~/data/words/2035-10.json";
import november2035 from "~~/data/words/2035-11.json";
import december2035 from "~~/data/words/2035-12.json";
import january2036 from "~~/data/words/2036-01.json";
import february2036 from "~~/data/words/2036-02.json";
import march2036 from "~~/data/words/2036-03.json";
import april2036 from "~~/data/words/2036-04.json";
import may2036 from "~~/data/words/2036-05.json";
import june2036 from "~~/data/words/2036-06.json";
import july2036 from "~~/data/words/2036-07.json";
import august2036 from "~~/data/words/2036-08.json";
import september2036 from "~~/data/words/2036-09.json";
import october2036 from "~~/data/words/2036-10.json";
import november2036 from "~~/data/words/2036-11.json";
import december2036 from "~~/data/words/2036-12.json";
import january2037 from "~~/data/words/2037-01.json";
import february2037 from "~~/data/words/2037-02.json";
import march2037 from "~~/data/words/2037-03.json";
import april2037 from "~~/data/words/2037-04.json";
import may2037 from "~~/data/words/2037-05.json";
import june2037 from "~~/data/words/2037-06.json";
import july2037 from "~~/data/words/2037-07.json";
import august2037 from "~~/data/words/2037-08.json";
import september2037 from "~~/data/words/2037-09.json";
import october2037 from "~~/data/words/2037-10.json";
import november2037 from "~~/data/words/2037-11.json";
import december2037 from "~~/data/words/2037-12.json";
import january2038 from "~~/data/words/2038-01.json";
import february2038 from "~~/data/words/2038-02.json";
import march2038 from "~~/data/words/2038-03.json";
import april2038 from "~~/data/words/2038-04.json";
import may2038 from "~~/data/words/2038-05.json";
import june2038 from "~~/data/words/2038-06.json";
import july2038 from "~~/data/words/2038-07.json";
import august2038 from "~~/data/words/2038-08.json";
import september2038 from "~~/data/words/2038-09.json";
import october2038 from "~~/data/words/2038-10.json";
import november2038 from "~~/data/words/2038-11.json";
import december2038 from "~~/data/words/2038-12.json";
import january2039 from "~~/data/words/2039-01.json";
import february2039 from "~~/data/words/2039-02.json";
import march2039 from "~~/data/words/2039-03.json";
import april2039 from "~~/data/words/2039-04.json";
import may2039 from "~~/data/words/2039-05.json";
import june2039 from "~~/data/words/2039-06.json";
import july2039 from "~~/data/words/2039-07.json";
import august2039 from "~~/data/words/2039-08.json";
import september2039 from "~~/data/words/2039-09.json";
import october2039 from "~~/data/words/2039-10.json";
import november2039 from "~~/data/words/2039-11.json";
import december2039 from "~~/data/words/2039-12.json";
import january2040 from "~~/data/words/2040-01.json";
import february2040 from "~~/data/words/2040-02.json";
import march2040 from "~~/data/words/2040-03.json";

/** Every month's entries, oldest first. */
const MONTHS: WordEntry[][] = [
  october2018 as WordEntry[],
  november2018 as WordEntry[],
  december2018 as WordEntry[],
  january2019 as WordEntry[],
  february2019 as WordEntry[],
  march2019 as WordEntry[],
  april2019 as WordEntry[],
  may2019 as WordEntry[],
  june2019 as WordEntry[],
  july2019 as WordEntry[],
  august2019 as WordEntry[],
  september2019 as WordEntry[],
  october2019 as WordEntry[],
  november2019 as WordEntry[],
  december2019 as WordEntry[],
  january2020 as WordEntry[],
  february2020 as WordEntry[],
  march2020 as WordEntry[],
  april2020 as WordEntry[],
  may2020 as WordEntry[],
  june2020 as WordEntry[],
  july2020 as WordEntry[],
  august2020 as WordEntry[],
  september2020 as WordEntry[],
  october2020 as WordEntry[],
  november2020 as WordEntry[],
  december2020 as WordEntry[],
  january2021 as WordEntry[],
  february2021 as WordEntry[],
  march2021 as WordEntry[],
  april2021 as WordEntry[],
  may2021 as WordEntry[],
  june2021 as WordEntry[],
  july2021 as WordEntry[],
  august2021 as WordEntry[],
  september2021 as WordEntry[],
  october2021 as WordEntry[],
  november2021 as WordEntry[],
  december2021 as WordEntry[],
  january2022 as WordEntry[],
  february2022 as WordEntry[],
  march2022 as WordEntry[],
  april2022 as WordEntry[],
  may2022 as WordEntry[],
  june2022 as WordEntry[],
  july2022 as WordEntry[],
  august2022 as WordEntry[],
  september2022 as WordEntry[],
  october2022 as WordEntry[],
  november2022 as WordEntry[],
  december2022 as WordEntry[],
  january2023 as WordEntry[],
  february2023 as WordEntry[],
  march2023 as WordEntry[],
  april2023 as WordEntry[],
  may2023 as WordEntry[],
  june2023 as WordEntry[],
  july2023 as WordEntry[],
  august2023 as WordEntry[],
  september2023 as WordEntry[],
  october2023 as WordEntry[],
  november2023 as WordEntry[],
  december2023 as WordEntry[],
  january2024 as WordEntry[],
  february2024 as WordEntry[],
  march2024 as WordEntry[],
  april2024 as WordEntry[],
  may2024 as WordEntry[],
  june2024 as WordEntry[],
  july2024 as WordEntry[],
  august2024 as WordEntry[],
  september2024 as WordEntry[],
  october2024 as WordEntry[],
  november2024 as WordEntry[],
  december2024 as WordEntry[],
  january2025 as WordEntry[],
  february2025 as WordEntry[],
  march2025 as WordEntry[],
  april2025 as WordEntry[],
  may2025 as WordEntry[],
  june2025 as WordEntry[],
  july2025 as WordEntry[],
  august2025 as WordEntry[],
  september2025 as WordEntry[],
  october2025 as WordEntry[],
  november2025 as WordEntry[],
  december2025 as WordEntry[],
  january2026 as WordEntry[],
  february2026 as WordEntry[],
  march2026 as WordEntry[],
  april2026 as WordEntry[],
  may2026 as WordEntry[],
  june2026 as WordEntry[],
  july2026 as WordEntry[],
  august2026 as WordEntry[],
  september2026 as WordEntry[],
  october2026 as WordEntry[],
  november2026 as WordEntry[],
  december2026 as WordEntry[],
  january2027 as WordEntry[],
  february2027 as WordEntry[],
  march2027 as WordEntry[],
  april2027 as WordEntry[],
  may2027 as WordEntry[],
  june2027 as WordEntry[],
  july2027 as WordEntry[],
  august2027 as WordEntry[],
  september2027 as WordEntry[],
  october2027 as WordEntry[],
  november2027 as WordEntry[],
  december2027 as WordEntry[],
  january2028 as WordEntry[],
  february2028 as WordEntry[],
  march2028 as WordEntry[],
  april2028 as WordEntry[],
  may2028 as WordEntry[],
  june2028 as WordEntry[],
  july2028 as WordEntry[],
  august2028 as WordEntry[],
  september2028 as WordEntry[],
  october2028 as WordEntry[],
  november2028 as WordEntry[],
  december2028 as WordEntry[],
  january2029 as WordEntry[],
  february2029 as WordEntry[],
  march2029 as WordEntry[],
  april2029 as WordEntry[],
  may2029 as WordEntry[],
  june2029 as WordEntry[],
  july2029 as WordEntry[],
  august2029 as WordEntry[],
  september2029 as WordEntry[],
  october2029 as WordEntry[],
  november2029 as WordEntry[],
  december2029 as WordEntry[],
  january2030 as WordEntry[],
  february2030 as WordEntry[],
  march2030 as WordEntry[],
  april2030 as WordEntry[],
  may2030 as WordEntry[],
  june2030 as WordEntry[],
  july2030 as WordEntry[],
  august2030 as WordEntry[],
  september2030 as WordEntry[],
  october2030 as WordEntry[],
  november2030 as WordEntry[],
  december2030 as WordEntry[],
  january2031 as WordEntry[],
  february2031 as WordEntry[],
  march2031 as WordEntry[],
  april2031 as WordEntry[],
  may2031 as WordEntry[],
  june2031 as WordEntry[],
  july2031 as WordEntry[],
  august2031 as WordEntry[],
  september2031 as WordEntry[],
  october2031 as WordEntry[],
  november2031 as WordEntry[],
  december2031 as WordEntry[],
  january2032 as WordEntry[],
  february2032 as WordEntry[],
  march2032 as WordEntry[],
  april2032 as WordEntry[],
  may2032 as WordEntry[],
  june2032 as WordEntry[],
  july2032 as WordEntry[],
  august2032 as WordEntry[],
  september2032 as WordEntry[],
  october2032 as WordEntry[],
  november2032 as WordEntry[],
  december2032 as WordEntry[],
  january2033 as WordEntry[],
  february2033 as WordEntry[],
  march2033 as WordEntry[],
  april2033 as WordEntry[],
  may2033 as WordEntry[],
  june2033 as WordEntry[],
  july2033 as WordEntry[],
  august2033 as WordEntry[],
  september2033 as WordEntry[],
  october2033 as WordEntry[],
  november2033 as WordEntry[],
  december2033 as WordEntry[],
  january2034 as WordEntry[],
  february2034 as WordEntry[],
  march2034 as WordEntry[],
  april2034 as WordEntry[],
  may2034 as WordEntry[],
  june2034 as WordEntry[],
  july2034 as WordEntry[],
  august2034 as WordEntry[],
  september2034 as WordEntry[],
  october2034 as WordEntry[],
  november2034 as WordEntry[],
  december2034 as WordEntry[],
  january2035 as WordEntry[],
  february2035 as WordEntry[],
  march2035 as WordEntry[],
  april2035 as WordEntry[],
  may2035 as WordEntry[],
  june2035 as WordEntry[],
  july2035 as WordEntry[],
  august2035 as WordEntry[],
  september2035 as WordEntry[],
  october2035 as WordEntry[],
  november2035 as WordEntry[],
  december2035 as WordEntry[],
  january2036 as WordEntry[],
  february2036 as WordEntry[],
  march2036 as WordEntry[],
  april2036 as WordEntry[],
  may2036 as WordEntry[],
  june2036 as WordEntry[],
  july2036 as WordEntry[],
  august2036 as WordEntry[],
  september2036 as WordEntry[],
  october2036 as WordEntry[],
  november2036 as WordEntry[],
  december2036 as WordEntry[],
  january2037 as WordEntry[],
  february2037 as WordEntry[],
  march2037 as WordEntry[],
  april2037 as WordEntry[],
  may2037 as WordEntry[],
  june2037 as WordEntry[],
  july2037 as WordEntry[],
  august2037 as WordEntry[],
  september2037 as WordEntry[],
  october2037 as WordEntry[],
  november2037 as WordEntry[],
  december2037 as WordEntry[],
  january2038 as WordEntry[],
  february2038 as WordEntry[],
  march2038 as WordEntry[],
  april2038 as WordEntry[],
  may2038 as WordEntry[],
  june2038 as WordEntry[],
  july2038 as WordEntry[],
  august2038 as WordEntry[],
  september2038 as WordEntry[],
  october2038 as WordEntry[],
  november2038 as WordEntry[],
  december2038 as WordEntry[],
  january2039 as WordEntry[],
  february2039 as WordEntry[],
  march2039 as WordEntry[],
  april2039 as WordEntry[],
  may2039 as WordEntry[],
  june2039 as WordEntry[],
  july2039 as WordEntry[],
  august2039 as WordEntry[],
  september2039 as WordEntry[],
  october2039 as WordEntry[],
  november2039 as WordEntry[],
  december2039 as WordEntry[],
  january2040 as WordEntry[],
  february2040 as WordEntry[],
  march2040 as WordEntry[],
];

export const WORD_ENTRIES: readonly WordEntry[] = MONTHS.flat().sort((a, b) =>
  a.date.localeCompare(b.date),
);

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real YYYY-MM-DD calendar date (no 2026-02-30). */
export function isValidIsoDate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [, y, mo, d] = m.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d
  );
}

/** A real YYYY-MM month. */
export function isValidMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** Today's date in Japan (JST) — a new word opens at midnight there,
 *  the same calendar the seasonal theme follows. */
export function todayJst(now: Date = new Date()): string {
  return toJst(now).toISOString().slice(0, 10);
}

export function entryForDate(date: string): WordEntry | undefined {
  return WORD_ENTRIES.find((e) => e.date === date);
}

/** The newest entry that is open on `date` — the word a day shows while the
 *  catalogue has yet to reach it (the days before the first word are the only
 *  ones with nothing to show). */
export function latestEntryOnOrBefore(date: string): WordEntry | undefined {
  return [...WORD_ENTRIES].reverse().find((e) => e.date <= date);
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);
}

/** The word for a day with no entry of its own and the lap it falls on.
 *
 *  Until the last written day the answer is the newest entry open on `date`,
 *  on lap 1. After it the words start again from the first one (a lap, 周):
 *  the day after the last entry shows the first word on lap 2, the next the
 *  second, and so on, then lap 3. The word depends only on the date, so every
 *  reader sees the same one, and every word shown has already been open. */
export function lapEntryForDate(
  date: string,
): { entry: WordEntry; lap: number } | undefined {
  const last = WORD_ENTRIES[WORD_ENTRIES.length - 1];
  if (!last || date <= last.date) {
    const entry = latestEntryOnOrBefore(date);
    return entry && { entry, lap: 1 };
  }
  const since = daysBetween(last.date, date) - 1;
  return {
    entry: WORD_ENTRIES[since % WORD_ENTRIES.length]!,
    lap: 2 + Math.floor(since / WORD_ENTRIES.length),
  };
}

/** An entry with the open days on either side of it. `next` stays null until
 *  that day has arrived, so navigating forward can never reveal a future word. */
export function payloadFor(
  entry: WordEntry,
  today: string = todayJst(),
  lap = 1,
): DailyWordPayload {
  const i = WORD_ENTRIES.indexOf(entry);
  const prev = WORD_ENTRIES[i - 1];
  const next = WORD_ENTRIES[i + 1];
  return {
    entry,
    lap,
    prev: prev ? { date: prev.date, term: prev.term } : null,
    next:
      next && next.date <= today ? { date: next.date, term: next.term } : null,
  };
}

/** Months (YYYY-MM) that have at least one entry, oldest first, then any month
 *  after the last entry that a lap has reached by `today`. */
export function monthsWithEntries(today: string = todayJst()): string[] {
  const months = [...new Set(WORD_ENTRIES.map((e) => e.date.slice(0, 7)))];
  const last = WORD_ENTRIES[WORD_ENTRIES.length - 1];
  if (!last) return months;
  for (let m = nextMonth(last.date.slice(0, 7)); m <= today.slice(0, 7);) {
    months.push(m);
    m = nextMonth(m);
  }
  return months;
}

function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

/** Every day of a month as the calendar shows it: an open day carries its
 *  word, an upcoming day carries nothing, and a day with no entry is omitted.
 *  After the last entry the open days carry the lap word (`wordDate` is the
 *  page it lives on); the days still to come stay omitted. */
export function calendarForMonth(
  month: string,
  today: string = todayJst(),
): WordCalendarDay[] {
  const days: WordCalendarDay[] = WORD_ENTRIES.filter((e) =>
    e.date.startsWith(month),
  ).map((e) =>
    e.date <= today
      ? {
          date: e.date,
          status: "open",
          term: e.term,
          kana: e.kana,
          stratum: e.stratum,
        }
      : { date: e.date, status: "upcoming" },
  );
  const last = WORD_ENTRIES[WORD_ENTRIES.length - 1];
  if (!last || month < last.date.slice(0, 7)) return days;
  const [y, m] = month.split("-").map(Number) as [number, number];
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${month}-${String(d).padStart(2, "0")}`;
    if (date <= last.date || date > today) continue;
    const { entry, lap } = lapEntryForDate(date)!;
    days.push({
      date,
      status: "open",
      term: entry.term,
      kana: entry.kana,
      stratum: entry.stratum,
      wordDate: entry.date,
      lap,
    });
  }
  return days;
}
