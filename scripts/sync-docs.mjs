/**
 * pnpm docs:sync — fills the generated region of README.md from the single
 * source of truth, so the attribution is written once:
 *
 *   shared/sources.ts    attribution (names, URLs, licences, credit lines)
 *
 * The documentation itself is the book under `app/pages/docs/`, which reads
 * `shared/sources.ts`, `shared/endpoints.ts`, `shared/seasons.ts` and
 * `GET /api/catalogue` directly, so it has nothing to generate.
 *
 * A region looks like
 *
 *   <!-- docs:begin attribution -->  …generated…  <!-- docs:end attribution -->
 *
 * Edit the source, run this, commit the result; never edit between the
 * markers. `--check` writes nothing and exits 1 if the file is out of date,
 * which `test/server/docs-sync.test.ts` also enforces.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";
import { DATA_SOURCES } from "../shared/sources.ts";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Every markdown file that may hold a generated region. */
export function docFiles() {
  return ["README.md"];
}

/** The renderers, by region id. */
export function renderers() {
  return {
    attribution: () => `\n${DATA_SOURCES.map((s) => s.credit).join("\n\n")}\n`,
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
