import { describe, it, expect } from "vitest";
import { WORD_ENTRIES } from "~~/shared/words";

/**
 * Every field of an entry except its headline is derived from sources by
 * scripts/lib/word-entry.mjs. This test re-runs that derivation from
 * data/word-plan/*.json and the committed snapshots and requires the committed
 * data/words/*.json to match exactly — so a derived field can't be edited by
 * hand, and a changed source (a re-pinned Wiktionary page, a new reference
 * build) shows up here instead of silently leaving old content behind.
 * Fix a failure by running `pnpm data:words` and reviewing the diff.
 */
describe("generated word entries", () => {
  it("can be built from the plan and sources for every planned day", async () => {
    const { generateAll } = await import(
      // @ts-expect-error — plain .mjs module without type declarations
      "../../scripts/generate-word-entries.mjs"
    );
    const { months, failures } = generateAll();
    expect(failures, "entries the generator could not build").toEqual([]);

    const generated = (Object.values(months) as unknown[][]).flat();
    expect(generated.length).toBe(WORD_ENTRIES.length);

    const stale = generated
      .filter(
        (g: any, i) =>
          JSON.stringify(g) !==
          JSON.stringify(
            WORD_ENTRIES.find((e) => e.date === g.date) ?? WORD_ENTRIES[i],
          ),
      )
      .map((g: any) => `${g.date} ${g.term}`);
    expect(
      stale,
      "committed entries that differ — run pnpm data:words",
    ).toEqual([]);
  });

  it("has a hand-written headline for every day, and nothing else hand-written", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const { join } = await import("node:path");
    const dir = join(import.meta.dirname, "../../data/word-plan");
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      for (const p of JSON.parse(readFileSync(join(dir, f), "utf8"))) {
        // `kana` only names the reading when a spelling has several pool words.
        expect(
          Object.keys(p)
            .filter((k) => k !== "kana")
            .sort(),
          `${f} ${p.date}`,
        ).toEqual(["date", "headline", "term"]);
        expect(p.headline.length, `${p.date} headline`).toBeGreaterThan(10);
      }
    }
  });
});
