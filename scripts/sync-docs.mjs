/**
 * pnpm docs:sync — fills the generated regions of README.md and docs/*.md from
 * the single sources of truth, so a fact is written once and every place that
 * states it follows:
 *
 *   shared/sources.ts    attribution (names, URLs, licences, credit lines)
 *   shared/endpoints.ts  the HTTP route list
 *   data/words/*.json    the word range and count (via shared/catalogue.ts)
 *
 * A region looks like
 *
 *   <!-- docs:begin endpoints -->  …generated…  <!-- docs:end endpoints -->
 *
 * (or inline within a sentence). Edit the source, run this, commit the result;
 * never edit between the markers. `--check` writes nothing and exits 1 if any
 * file is out of date, which `test/server/docs-sync.test.ts` also enforces.
 *
 * Only facts that don't change day to day belong here: nothing that depends on
 * "today" (such as how many words have opened) may be rendered, or the check
 * would fail every midnight.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";
import { DATA_SOURCES } from "../shared/sources.ts";
import { API_ENDPOINTS } from "../shared/endpoints.ts";
import {
  rangeMonthsText,
  rangeText,
  summariseCatalogue,
} from "../shared/catalogue.ts";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Every markdown file that may hold a generated region. */
export function docFiles() {
  return [
    "README.md",
    ...readdirSync(join(ROOT, "docs"))
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => `docs/${f}`),
  ];
}

function catalogue() {
  const dates = readdirSync(join(ROOT, "data/words"))
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) =>
      JSON.parse(readFileSync(join(ROOT, "data/words", f), "utf8")).map(
        (e) => e.date,
      ),
    );
  // `today` is irrelevant: nothing date-dependent is rendered.
  return summariseCatalogue(dates, "");
}

const cell = (text) => text.replace(/\|/g, "\\|");

function endpointsTable() {
  const rows = API_ENDPOINTS.map(
    (e) => `| \`${e.method} ${e.path}${e.query ?? ""}\` | ${cell(e.returns)} |`,
  );
  return `\n| Endpoint | Returns |\n| :-- | :-- |\n${rows.join("\n")}\n`;
}

/** The renderers, by region id. Inline ones return text without newlines. */
export function renderers() {
  const c = catalogue();
  return {
    range: () => rangeText(c),
    "range-months": () => rangeMonthsText(c),
    first: () => c.first,
    last: () => c.last,
    total: () => String(c.total),
    attribution: () => `\n${DATA_SOURCES.map((s) => s.credit).join("\n\n")}\n`,
    endpoints: endpointsTable,
  };
}

const REGION = /<!-- docs:begin ([\w-]+) -->([\s\S]*?)<!-- docs:end \1 -->/g;

async function format(file, text) {
  const path = join(ROOT, file);
  const options = (await prettier.resolveConfig(path)) ?? {};
  return prettier.format(text, { ...options, filepath: path });
}

/**
 * Renders every region and returns the files whose content would change.
 * With `write`, also saves them.
 */
export async function syncDocs({ write = false } = {}) {
  const render = renderers();
  const stale = [];

  for (const file of docFiles()) {
    const path = join(ROOT, file);
    const before = readFileSync(path, "utf8");
    if (!before.includes("<!-- docs:begin ")) continue;
    const filled = before.replace(REGION, (_m, id) => {
      const fn = render[id];
      if (!fn) throw new Error(`${file}: unknown docs region "${id}"`);
      return `<!-- docs:begin ${id} -->${fn()}<!-- docs:end ${id} -->`;
    });
    const after = await format(file, filled);
    if (after !== before) {
      stale.push(file);
      if (write) writeFileSync(path, after);
    }
  }
  return stale;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const stale = await syncDocs({ write: !check });
  if (check && stale.length) {
    console.error(`Out of date (run pnpm docs:sync): ${stale.join(", ")}`);
    process.exit(1);
  }
  console.log(
    stale.length ? `Updated ${stale.join(", ")}` : "Docs are up to date.",
  );
}
