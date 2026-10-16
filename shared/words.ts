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
  PartWordRef,
  WordCalendarDay,
  WordEntry,
} from "~~/types/index";
import may2005 from "~~/data/words/2005-05.json";
import june2005 from "~~/data/words/2005-06.json";
import july2005 from "~~/data/words/2005-07.json";
import august2005 from "~~/data/words/2005-08.json";
import september2005 from "~~/data/words/2005-09.json";
import october2005 from "~~/data/words/2005-10.json";
import november2005 from "~~/data/words/2005-11.json";
import december2005 from "~~/data/words/2005-12.json";
import january2006 from "~~/data/words/2006-01.json";
import february2006 from "~~/data/words/2006-02.json";
import march2006 from "~~/data/words/2006-03.json";
import april2006 from "~~/data/words/2006-04.json";
import may2006 from "~~/data/words/2006-05.json";
import june2006 from "~~/data/words/2006-06.json";
import july2006 from "~~/data/words/2006-07.json";
import august2006 from "~~/data/words/2006-08.json";
import september2006 from "~~/data/words/2006-09.json";
import october2006 from "~~/data/words/2006-10.json";
import november2006 from "~~/data/words/2006-11.json";
import december2006 from "~~/data/words/2006-12.json";
import january2007 from "~~/data/words/2007-01.json";
import february2007 from "~~/data/words/2007-02.json";
import march2007 from "~~/data/words/2007-03.json";
import april2007 from "~~/data/words/2007-04.json";
import may2007 from "~~/data/words/2007-05.json";
import june2007 from "~~/data/words/2007-06.json";
import july2007 from "~~/data/words/2007-07.json";
import august2007 from "~~/data/words/2007-08.json";
import september2007 from "~~/data/words/2007-09.json";
import october2007 from "~~/data/words/2007-10.json";
import november2007 from "~~/data/words/2007-11.json";
import december2007 from "~~/data/words/2007-12.json";
import january2008 from "~~/data/words/2008-01.json";
import february2008 from "~~/data/words/2008-02.json";
import march2008 from "~~/data/words/2008-03.json";
import april2008 from "~~/data/words/2008-04.json";
import may2008 from "~~/data/words/2008-05.json";
import june2008 from "~~/data/words/2008-06.json";
import july2008 from "~~/data/words/2008-07.json";
import august2008 from "~~/data/words/2008-08.json";
import september2008 from "~~/data/words/2008-09.json";
import october2008 from "~~/data/words/2008-10.json";
import november2008 from "~~/data/words/2008-11.json";
import december2008 from "~~/data/words/2008-12.json";
import january2009 from "~~/data/words/2009-01.json";
import february2009 from "~~/data/words/2009-02.json";
import march2009 from "~~/data/words/2009-03.json";
import april2009 from "~~/data/words/2009-04.json";
import may2009 from "~~/data/words/2009-05.json";
import june2009 from "~~/data/words/2009-06.json";
import july2009 from "~~/data/words/2009-07.json";
import august2009 from "~~/data/words/2009-08.json";
import september2009 from "~~/data/words/2009-09.json";
import october2009 from "~~/data/words/2009-10.json";
import november2009 from "~~/data/words/2009-11.json";
import december2009 from "~~/data/words/2009-12.json";
import january2010 from "~~/data/words/2010-01.json";
import february2010 from "~~/data/words/2010-02.json";
import march2010 from "~~/data/words/2010-03.json";
import april2010 from "~~/data/words/2010-04.json";
import may2010 from "~~/data/words/2010-05.json";
import june2010 from "~~/data/words/2010-06.json";
import july2010 from "~~/data/words/2010-07.json";
import august2010 from "~~/data/words/2010-08.json";
import september2010 from "~~/data/words/2010-09.json";
import october2010 from "~~/data/words/2010-10.json";
import november2010 from "~~/data/words/2010-11.json";
import december2010 from "~~/data/words/2010-12.json";
import january2011 from "~~/data/words/2011-01.json";
import february2011 from "~~/data/words/2011-02.json";
import march2011 from "~~/data/words/2011-03.json";
import april2011 from "~~/data/words/2011-04.json";
import may2011 from "~~/data/words/2011-05.json";
import june2011 from "~~/data/words/2011-06.json";
import july2011 from "~~/data/words/2011-07.json";
import august2011 from "~~/data/words/2011-08.json";
import september2011 from "~~/data/words/2011-09.json";
import october2011 from "~~/data/words/2011-10.json";
import november2011 from "~~/data/words/2011-11.json";
import december2011 from "~~/data/words/2011-12.json";
import january2012 from "~~/data/words/2012-01.json";
import february2012 from "~~/data/words/2012-02.json";
import march2012 from "~~/data/words/2012-03.json";
import april2012 from "~~/data/words/2012-04.json";
import may2012 from "~~/data/words/2012-05.json";
import june2012 from "~~/data/words/2012-06.json";
import july2012 from "~~/data/words/2012-07.json";
import august2012 from "~~/data/words/2012-08.json";
import september2012 from "~~/data/words/2012-09.json";
import october2012 from "~~/data/words/2012-10.json";
import november2012 from "~~/data/words/2012-11.json";
import december2012 from "~~/data/words/2012-12.json";
import january2013 from "~~/data/words/2013-01.json";
import february2013 from "~~/data/words/2013-02.json";
import march2013 from "~~/data/words/2013-03.json";
import april2013 from "~~/data/words/2013-04.json";
import may2013 from "~~/data/words/2013-05.json";
import june2013 from "~~/data/words/2013-06.json";
import july2013 from "~~/data/words/2013-07.json";
import august2013 from "~~/data/words/2013-08.json";
import september2013 from "~~/data/words/2013-09.json";
import october2013 from "~~/data/words/2013-10.json";
import november2013 from "~~/data/words/2013-11.json";
import december2013 from "~~/data/words/2013-12.json";
import january2014 from "~~/data/words/2014-01.json";
import february2014 from "~~/data/words/2014-02.json";
import march2014 from "~~/data/words/2014-03.json";
import april2014 from "~~/data/words/2014-04.json";
import may2014 from "~~/data/words/2014-05.json";
import june2014 from "~~/data/words/2014-06.json";
import july2014 from "~~/data/words/2014-07.json";
import august2014 from "~~/data/words/2014-08.json";
import september2014 from "~~/data/words/2014-09.json";
import october2014 from "~~/data/words/2014-10.json";
import november2014 from "~~/data/words/2014-11.json";
import december2014 from "~~/data/words/2014-12.json";
import january2015 from "~~/data/words/2015-01.json";
import february2015 from "~~/data/words/2015-02.json";
import march2015 from "~~/data/words/2015-03.json";
import april2015 from "~~/data/words/2015-04.json";
import may2015 from "~~/data/words/2015-05.json";
import june2015 from "~~/data/words/2015-06.json";
import july2015 from "~~/data/words/2015-07.json";
import august2015 from "~~/data/words/2015-08.json";
import september2015 from "~~/data/words/2015-09.json";
import october2015 from "~~/data/words/2015-10.json";
import november2015 from "~~/data/words/2015-11.json";
import december2015 from "~~/data/words/2015-12.json";
import january2016 from "~~/data/words/2016-01.json";
import february2016 from "~~/data/words/2016-02.json";
import march2016 from "~~/data/words/2016-03.json";
import april2016 from "~~/data/words/2016-04.json";
import may2016 from "~~/data/words/2016-05.json";
import june2016 from "~~/data/words/2016-06.json";
import july2016 from "~~/data/words/2016-07.json";
import august2016 from "~~/data/words/2016-08.json";
import september2016 from "~~/data/words/2016-09.json";
import october2016 from "~~/data/words/2016-10.json";
import november2016 from "~~/data/words/2016-11.json";
import december2016 from "~~/data/words/2016-12.json";
import january2017 from "~~/data/words/2017-01.json";
import february2017 from "~~/data/words/2017-02.json";
import march2017 from "~~/data/words/2017-03.json";
import april2017 from "~~/data/words/2017-04.json";
import may2017 from "~~/data/words/2017-05.json";
import june2017 from "~~/data/words/2017-06.json";
import july2017 from "~~/data/words/2017-07.json";
import august2017 from "~~/data/words/2017-08.json";
import september2017 from "~~/data/words/2017-09.json";
import october2017 from "~~/data/words/2017-10.json";
import november2017 from "~~/data/words/2017-11.json";
import december2017 from "~~/data/words/2017-12.json";
import january2018 from "~~/data/words/2018-01.json";
import february2018 from "~~/data/words/2018-02.json";
import march2018 from "~~/data/words/2018-03.json";
import april2018 from "~~/data/words/2018-04.json";
import may2018 from "~~/data/words/2018-05.json";
import june2018 from "~~/data/words/2018-06.json";
import july2018 from "~~/data/words/2018-07.json";
import august2018 from "~~/data/words/2018-08.json";
import september2018 from "~~/data/words/2018-09.json";
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

/** Every month's entries, oldest first. */
const MONTHS: WordEntry[][] = [
  may2005 as WordEntry[],
  june2005 as WordEntry[],
  july2005 as WordEntry[],
  august2005 as WordEntry[],
  september2005 as WordEntry[],
  october2005 as WordEntry[],
  november2005 as WordEntry[],
  december2005 as WordEntry[],
  january2006 as WordEntry[],
  february2006 as WordEntry[],
  march2006 as WordEntry[],
  april2006 as WordEntry[],
  may2006 as WordEntry[],
  june2006 as WordEntry[],
  july2006 as WordEntry[],
  august2006 as WordEntry[],
  september2006 as WordEntry[],
  october2006 as WordEntry[],
  november2006 as WordEntry[],
  december2006 as WordEntry[],
  january2007 as WordEntry[],
  february2007 as WordEntry[],
  march2007 as WordEntry[],
  april2007 as WordEntry[],
  may2007 as WordEntry[],
  june2007 as WordEntry[],
  july2007 as WordEntry[],
  august2007 as WordEntry[],
  september2007 as WordEntry[],
  october2007 as WordEntry[],
  november2007 as WordEntry[],
  december2007 as WordEntry[],
  january2008 as WordEntry[],
  february2008 as WordEntry[],
  march2008 as WordEntry[],
  april2008 as WordEntry[],
  may2008 as WordEntry[],
  june2008 as WordEntry[],
  july2008 as WordEntry[],
  august2008 as WordEntry[],
  september2008 as WordEntry[],
  october2008 as WordEntry[],
  november2008 as WordEntry[],
  december2008 as WordEntry[],
  january2009 as WordEntry[],
  february2009 as WordEntry[],
  march2009 as WordEntry[],
  april2009 as WordEntry[],
  may2009 as WordEntry[],
  june2009 as WordEntry[],
  july2009 as WordEntry[],
  august2009 as WordEntry[],
  september2009 as WordEntry[],
  october2009 as WordEntry[],
  november2009 as WordEntry[],
  december2009 as WordEntry[],
  january2010 as WordEntry[],
  february2010 as WordEntry[],
  march2010 as WordEntry[],
  april2010 as WordEntry[],
  may2010 as WordEntry[],
  june2010 as WordEntry[],
  july2010 as WordEntry[],
  august2010 as WordEntry[],
  september2010 as WordEntry[],
  october2010 as WordEntry[],
  november2010 as WordEntry[],
  december2010 as WordEntry[],
  january2011 as WordEntry[],
  february2011 as WordEntry[],
  march2011 as WordEntry[],
  april2011 as WordEntry[],
  may2011 as WordEntry[],
  june2011 as WordEntry[],
  july2011 as WordEntry[],
  august2011 as WordEntry[],
  september2011 as WordEntry[],
  october2011 as WordEntry[],
  november2011 as WordEntry[],
  december2011 as WordEntry[],
  january2012 as WordEntry[],
  february2012 as WordEntry[],
  march2012 as WordEntry[],
  april2012 as WordEntry[],
  may2012 as WordEntry[],
  june2012 as WordEntry[],
  july2012 as WordEntry[],
  august2012 as WordEntry[],
  september2012 as WordEntry[],
  october2012 as WordEntry[],
  november2012 as WordEntry[],
  december2012 as WordEntry[],
  january2013 as WordEntry[],
  february2013 as WordEntry[],
  march2013 as WordEntry[],
  april2013 as WordEntry[],
  may2013 as WordEntry[],
  june2013 as WordEntry[],
  july2013 as WordEntry[],
  august2013 as WordEntry[],
  september2013 as WordEntry[],
  october2013 as WordEntry[],
  november2013 as WordEntry[],
  december2013 as WordEntry[],
  january2014 as WordEntry[],
  february2014 as WordEntry[],
  march2014 as WordEntry[],
  april2014 as WordEntry[],
  may2014 as WordEntry[],
  june2014 as WordEntry[],
  july2014 as WordEntry[],
  august2014 as WordEntry[],
  september2014 as WordEntry[],
  october2014 as WordEntry[],
  november2014 as WordEntry[],
  december2014 as WordEntry[],
  january2015 as WordEntry[],
  february2015 as WordEntry[],
  march2015 as WordEntry[],
  april2015 as WordEntry[],
  may2015 as WordEntry[],
  june2015 as WordEntry[],
  july2015 as WordEntry[],
  august2015 as WordEntry[],
  september2015 as WordEntry[],
  october2015 as WordEntry[],
  november2015 as WordEntry[],
  december2015 as WordEntry[],
  january2016 as WordEntry[],
  february2016 as WordEntry[],
  march2016 as WordEntry[],
  april2016 as WordEntry[],
  may2016 as WordEntry[],
  june2016 as WordEntry[],
  july2016 as WordEntry[],
  august2016 as WordEntry[],
  september2016 as WordEntry[],
  october2016 as WordEntry[],
  november2016 as WordEntry[],
  december2016 as WordEntry[],
  january2017 as WordEntry[],
  february2017 as WordEntry[],
  march2017 as WordEntry[],
  april2017 as WordEntry[],
  may2017 as WordEntry[],
  june2017 as WordEntry[],
  july2017 as WordEntry[],
  august2017 as WordEntry[],
  september2017 as WordEntry[],
  october2017 as WordEntry[],
  november2017 as WordEntry[],
  december2017 as WordEntry[],
  january2018 as WordEntry[],
  february2018 as WordEntry[],
  march2018 as WordEntry[],
  april2018 as WordEntry[],
  may2018 as WordEntry[],
  june2018 as WordEntry[],
  july2018 as WordEntry[],
  august2018 as WordEntry[],
  september2018 as WordEntry[],
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

/** An open word as the pages list it: enough to name it and link to its day. */
export const refOf = (e: WordEntry): PartWordRef => ({
  date: e.date,
  term: e.term,
  kana: e.kana,
  meaning: e.meaning,
  stratum: e.stratum,
});

/** The open words whose day falls on the same month and day as the entry's, in
 *  other years, oldest first. Only the dates are compared: nothing about the
 *  words is said to link them. */
export function sameDayWords(
  entry: WordEntry,
  today: string = todayJst(),
): PartWordRef[] {
  const monthDay = entry.date.slice(5);
  return WORD_ENTRIES.filter(
    (e) =>
      e.date <= today && e.date !== entry.date && e.date.slice(5) === monthDay,
  ).map(refOf);
}

/** An entry with the open days on either side of it, and the open words of
 *  the same day in other years. `next` stays null until that day has arrived,
 *  so navigating forward can never reveal a future word. */
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
    sameDay: sameDayWords(entry, today),
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
